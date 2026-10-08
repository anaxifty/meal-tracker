import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { Member, ParsedItemResult } from '@/types/mess';
import { convertBengaliDigitsToEnglish, normalizeDate } from '@/lib/bengali-utils';

function findMember(nameQuery: string, members: Member[]): Member | undefined {
  if (!nameQuery) return undefined;
  const q = nameQuery.trim().toLowerCase();

  return members.find((m) => {
    if (m.name.toLowerCase() === q) return true;
    if (m.bnName && m.bnName.toLowerCase() === q) return true;
    if (m.aliases.some((alias) => alias.toLowerCase() === q || q.includes(alias.toLowerCase()))) {
      return true;
    }
    // Partial inclusion
    if (q.includes(m.name.toLowerCase()) || (m.bnName && q.includes(m.bnName))) {
      return true;
    }
    return false;
  });
}

/**
 * Local deterministic parser for common Bangla & Banglish patterns:
 * 1) Daily meal list:
 *    ০৮-১০-২৬
 *    মাহমুদুল - 0
 *    সাগর - 0
 *    ইফতি - 1
 * 2) Deposit: "iftyr 1000 add hobe", "farhan 2000 tk deposit"
 * 3) Utility: "ifty 750 tk r wifi bill dise", "gas kena hoise 2230tk r", "current bill 1400 tk"
 * 4) Bazar: "bazar 650 tk chicken by sagor", "sagor bazar 850"
 */
function localFastParse(text: string, members: Member[], fallbackDate: string): ParsedItemResult[] {
  const results: ParsedItemResult[] = [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return results;

  // Let's check if the text contains a daily meal sheet
  // Pattern: first line might be a date, subsequent lines have "Name - Number"
  let detectedDate = fallbackDate;
  const mealEntries: Array<{ memberId: string; memberName: string; count: number }> = [];

  const remainingLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = convertBengaliDigitsToEnglish(rawLine);

    // Check if line is just a date like 08-10-26 or ০৮-১০-২৬
    if (/^(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})$/.test(line)) {
      detectedDate = normalizeDate(line, fallbackDate);
      continue;
    }

    // Check for Member - Count pattern (e.g., মাহমুদুল - 0 or ইফতি — 1 or Farhan: 2)
    const mealMatch = line.match(/^([^\d\-—:=]+)\s*[\-—:=]\s*(\d+(?:\.\d+)?)/);
    if (mealMatch) {
      const candidateName = mealMatch[1].trim();
      const count = parseFloat(mealMatch[2]);
      const matchedMember = findMember(candidateName, members);
      if (matchedMember) {
        mealEntries.push({
          memberId: matchedMember.id,
          memberName: matchedMember.name,
          count,
        });
        continue;
      }
    }

    remainingLines.push(rawLine);
  }

  if (mealEntries.length > 0) {
    results.push({
      type: 'meals',
      summary: `Meal entries for ${detectedDate} (${mealEntries.length} members updated)`,
      data: {
        date: detectedDate,
        mealEntries,
      },
    });
  }

  // Parse remaining lines for deposits, utilities, bazar
  for (const rawLine of remainingLines) {
    const englishLine = convertBengaliDigitsToEnglish(rawLine).toLowerCase();

    // 1. Deposits check: e.g. "iftyr 1000 add hobe", "farhan 2000 deposit"
    const depositRegex = /(?:(\w+|[\u0980-\u09FF]+)(?:r|er)?\s+)?(\d+(?:\.\d+)?)\s*(?:tk|taka)?\s*(?:add\s*hobe|deposit|জমা)/i;
    const depositMatch = englishLine.match(depositRegex);
    if (depositMatch) {
      const nameCand = depositMatch[1];
      const amount = parseFloat(depositMatch[2]);
      const matchedMember = nameCand ? findMember(nameCand, members) : undefined;

      results.push({
        type: 'deposit',
        summary: `Deposit ৳${amount} for ${matchedMember ? matchedMember.name : 'Member'}`,
        data: {
          date: detectedDate,
          deposit: {
            memberId: matchedMember ? matchedMember.id : members[0]?.id || '',
            memberName: matchedMember ? matchedMember.name : 'Unknown',
            amount,
            method: 'Cash / Mobile',
            note: rawLine,
          },
        },
      });
      continue;
    }

    // Also reverse check: "ifty 1000 taka dise" or "deposit 1500 ifty"
    const simpleDeposit = englishLine.match(/(?:deposit|জমা)\s*(\d+)/i);
    if (simpleDeposit && !results.some(r => r.summary.includes(simpleDeposit[1]))) {
      const amount = parseFloat(simpleDeposit[1]);
      const foundMember = members.find(m => englishLine.includes(m.name.toLowerCase()) || (m.bnName && rawLine.includes(m.bnName)));
      if (foundMember) {
        results.push({
          type: 'deposit',
          summary: `Deposit ৳${amount} for ${foundMember.name}`,
          data: {
            date: detectedDate,
            deposit: {
              memberId: foundMember.id,
              memberName: foundMember.name,
              amount,
              method: 'Cash',
              note: rawLine,
            },
          },
        });
        continue;
      }
    }

    // 2. Utility Bills: "wifi", "gas", "current"
    // e.g. "ifty 750 tk r wifi bill dise", "gas kena hoise 2230tk r", "current bill 1200"
    const hasWifi = englishLine.includes('wifi') || englishLine.includes('ওয়াইফাই');
    const hasGas = englishLine.includes('gas') || englishLine.includes('গ্যাস');
    const hasCurrent = englishLine.includes('current') || englishLine.includes('বিদ্যুৎ') || englishLine.includes('electricity');

    if (hasWifi || hasGas || hasCurrent) {
      const amountMatch = englishLine.match(/(\d+(?:\.\d+)?)\s*(?:tk|taka|টাকা)?/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1]);
        let category: 'wifi' | 'gas' | 'current' = 'gas';
        let title = 'Gas Bill';
        if (hasWifi) {
          category = 'wifi';
          title = 'Wifi Bill';
        } else if (hasCurrent) {
          category = 'current';
          title = 'Current Bill';
        }

        // Check if a member paid it out of pocket: e.g. "ifty 750 tk r wifi bill dise"
        let payer: Member | undefined = undefined;
        for (const m of members) {
          if (englishLine.includes(m.name.toLowerCase()) || (m.bnName && rawLine.includes(m.bnName))) {
            payer = m;
            break;
          }
        }

        results.push({
          type: 'utility',
          summary: `${title} ৳${amount} (${payer ? `Paid out-of-pocket by ${payer.name}` : 'Paid from mess fund'})`,
          data: {
            date: detectedDate,
            utility: {
              category,
              title,
              amount,
              paidById: payer ? payer.id : undefined,
              paidByName: payer ? payer.name : undefined,
              paidFrom: payer ? 'member' : 'fund',
            },
          },
        });
        continue;
      }
    }

    // 3. Bazar: "bazar 650 tk", "sagor 850 bazar"
    const hasBazar = englishLine.includes('bazar') || englishLine.includes('বাজার') || englishLine.includes('market');
    if (hasBazar) {
      const amountMatch = englishLine.match(/(\d+(?:\.\d+)?)\s*(?:tk|taka|টাকা)?/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1]);
        let shopper: Member | undefined = undefined;
        for (const m of members) {
          if (englishLine.includes(m.name.toLowerCase()) || (m.bnName && rawLine.includes(m.bnName))) {
            shopper = m;
            break;
          }
        }

        results.push({
          type: 'bazar',
          summary: `Bazar expense ৳${amount}${shopper ? ` by ${shopper.name}` : ''}`,
          data: {
            date: detectedDate,
            bazar: {
              amount,
              items: rawLine.replace(/(\d+(?:\.\d+)?)\s*(?:tk|taka|টাকা)?/gi, '').trim() || 'Daily Bazar',
              shopperId: shopper ? shopper.id : undefined,
              shopperName: shopper ? shopper.name : undefined,
              paidFrom: 'fund',
            },
          },
        });
        continue;
      }
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, members = [], currentDate = new Date().toISOString().split('T')[0] } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // First attempt fast local parse
    const localResults = localFastParse(text, members, currentDate);

    // If local results found items with high structure, we can return or complement with Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // If no API key configured, safely return local results
      return NextResponse.json({
        success: true,
        source: 'local-rule-engine',
        results: localResults,
      });
    }

    // Use Gemini for advanced language understanding (complex sentences, Banglish slang, multi-turn text)
    try {
      const ai = new GoogleGenAI({});

      const memberListString = members
        .map((m: Member) => `- ID: "${m.id}", English: "${m.name}", Bengali: "${m.bnName || ''}", Aliases: [${m.aliases.join(', ')}]`)
        .join('\n');

      const systemPrompt = `You are an expert AI parser for a Bengali / Banglish bachelor mess meal tracking app.
Current reference date is "${currentDate}".

Known Mess Members:
${memberListString}

A user can submit inputs in Bengali, Banglish, or English.
Input types include:
1. "meals": Daily meal count for members on a date.
   Example:
   "০৮-১০-২৬
   মাহমুদুল - 0
   সাগর - 0
   ইফতি - 1
   ফারহান - ০
   এখলাস - 1
   বেলাল- 0
   মেহেদী —0"
   -> Convert Bengali numerals to numbers (০=0, ১=1, ২=2, etc.). Format date to YYYY-MM-DD. Map Bengali/English names to Member IDs.

2. "deposit": Member giving cash / deposit into mess fund.
   Example: "iftyr 1000 add hobe" or "Ifty gave 2000 tk deposit via bKash"
   -> memberId: member's ID, amount: 1000, note.

3. "utility": Shared flat bills like wifi, current bill (electricity), gas cylinder.
   Example: "ifty 750 tk r wifi bill dise" -> category: "wifi", amount: 750, paidById: Ifty's member ID, paidFrom: "member" (because Ifty paid it out of his pocket for everyone).
   Example: "gas kena hoise 2230tk r" -> category: "gas", amount: 2230, paidFrom: "fund".

4. "bazar": Daily market expenditure for mess meals.
   Example: "Bazar 850 tk by Sagor for chicken and vegetables" -> amount: 850, shopperId: Sagor's ID, items: "chicken and vegetables", paidFrom: "fund".

Respond ONLY with valid JSON with the key "results" which is an array of items with:
{
  "results": [
    {
      "type": "meals" | "deposit" | "bazar" | "utility",
      "summary": string,
      "data": {
        "date": "YYYY-MM-DD",
        // if type == "meals":
        "mealEntries": [ { "memberId": string, "memberName": string, "count": number } ],
        // if type == "deposit":
        "deposit": { "memberId": string, "memberName": string, "amount": number, "method": string, "note": string },
        // if type == "bazar":
        "bazar": { "amount": number, "items": string, "shopperId": string, "shopperName": string, "paidFrom": "fund" | "shopper" },
        // if type == "utility":
        "utility": { "category": "wifi" | "current" | "gas" | "other", "title": string, "amount": number, "paidById": string | null, "paidByName": string | null, "paidFrom": "fund" | "member" }
      }
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nUser Input to Parse:\n"""\n${text}\n"""`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      if (parsed.results && Array.isArray(parsed.results) && parsed.results.length > 0) {
        return NextResponse.json({
          success: true,
          source: 'gemini',
          results: parsed.results,
        });
      }
    } catch (geminiError) {
      console.warn('Gemini parser fallback to local rule parser:', geminiError);
    }

    // Fallback to local rule engine if Gemini gave no results or had issue
    return NextResponse.json({
      success: true,
      source: 'local-rule-engine',
      results: localResults,
    });
  } catch (error) {
    console.error('Error in parse-input route:', error);
    return NextResponse.json(
      { error: 'Failed to process input', details: String(error) },
      { status: 500 }
    );
  }
}
