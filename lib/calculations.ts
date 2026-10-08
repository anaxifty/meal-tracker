import { Member, MealRecord, BazarExpense, Deposit, UtilityExpense } from '@/types/mess';

export interface MemberCalculationSummary {
  member: Member;
  totalMeals: number;
  mealCost: number;
  utilityShare: number;
  totalCost: number; // mealCost + utilityShare
  totalDeposited: number;
  outOfPocketUtilitiesPaid: number;
  totalPaid: number; // totalDeposited + outOfPocketUtilitiesPaid
  balance: number; // totalPaid - totalCost
  status: 'refund' | 'due' | 'settled';
}

export interface MessOverallSummary {
  grandTotalMeals: number;
  totalBazarExpense: number;
  mealRate: number;
  totalUtilitiesExpense: number;
  totalDeposits: number;
  fundCashInHand: number;
  memberSummaries: MemberCalculationSummary[];
}

export function calculateMessSummary(
  members: Member[],
  mealRecords: MealRecord[],
  bazarExpenses: BazarExpense[],
  deposits: Deposit[],
  utilities: UtilityExpense[]
): MessOverallSummary {
  // 1. Calculate Grand Total Meals
  let grandTotalMeals = 0;
  const memberMealsMap: Record<string, number> = {};

  for (const m of members) {
    memberMealsMap[m.id] = 0;
  }

  for (const record of mealRecords) {
    for (const m of members) {
      const count = Number(record.meals[m.id]) || 0;
      memberMealsMap[m.id] += count;
      grandTotalMeals += count;
    }
  }

  // 2. Calculate Total Bazar Expense
  const totalBazarExpense = bazarExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // 3. Calculate Live Meal Rate
  const mealRate = grandTotalMeals > 0 ? totalBazarExpense / grandTotalMeals : 0;

  // 4. Calculate Shared Utilities
  const totalUtilitiesExpense = utilities.reduce((sum, u) => sum + (Number(u.amount) || 0), 0);

  const memberUtilityShares: Record<string, number> = {};
  const memberOutOfPocketUtilities: Record<string, number> = {};

  for (const m of members) {
    memberUtilityShares[m.id] = 0;
    memberOutOfPocketUtilities[m.id] = 0;
  }

  for (const u of utilities) {
    const amount = Number(u.amount) || 0;
    const splitIds = u.splitAmongMemberIds && u.splitAmongMemberIds.length > 0
      ? u.splitAmongMemberIds
      : members.map((m) => m.id);

    const sharePerHead = splitIds.length > 0 ? amount / splitIds.length : 0;

    for (const memberId of splitIds) {
      if (memberUtilityShares[memberId] !== undefined) {
        memberUtilityShares[memberId] += sharePerHead;
      }
    }

    // Check if a member paid it out of pocket
    if (u.paidFrom === 'member' && u.paidById && memberOutOfPocketUtilities[u.paidById] !== undefined) {
      memberOutOfPocketUtilities[u.paidById] += amount;
    }
  }

  // 5. Calculate Member Deposits
  const memberDepositsMap: Record<string, number> = {};
  for (const m of members) {
    memberDepositsMap[m.id] = 0;
  }

  for (const d of deposits) {
    if (memberDepositsMap[d.memberId] !== undefined) {
      memberDepositsMap[d.memberId] += Number(d.amount) || 0;
    }
  }

  const totalDeposits = Object.values(memberDepositsMap).reduce((a, b) => a + b, 0);

  // 6. Cash In Hand Calculation for Mess Fund
  // Fund Cash = Deposits in hand - Bazar from fund - Utilities from fund
  const bazarFromFund = bazarExpenses
    .filter((b) => b.paidFrom === 'fund')
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const utilitiesFromFund = utilities
    .filter((u) => u.paidFrom === 'fund')
    .reduce((sum, u) => sum + (Number(u.amount) || 0), 0);

  const fundCashInHand = totalDeposits - bazarFromFund - utilitiesFromFund;

  // 7. Individual Member Summaries
  const memberSummaries: MemberCalculationSummary[] = members.map((m) => {
    const totalMeals = memberMealsMap[m.id] || 0;
    const mealCost = totalMeals * mealRate;
    const utilityShare = memberUtilityShares[m.id] || 0;
    const totalCost = mealCost + utilityShare;
    const totalDeposited = memberDepositsMap[m.id] || 0;
    const outOfPocketUtilitiesPaid = memberOutOfPocketUtilities[m.id] || 0;
    const totalPaid = totalDeposited + outOfPocketUtilitiesPaid;
    const balance = totalPaid - totalCost;

    let status: 'refund' | 'due' | 'settled' = 'settled';
    if (balance > 0.5) {
      status = 'refund';
    } else if (balance < -0.5) {
      status = 'due';
    }

    return {
      member: m,
      totalMeals,
      mealCost,
      utilityShare,
      totalCost,
      totalDeposited,
      outOfPocketUtilitiesPaid,
      totalPaid,
      balance,
      status,
    };
  });

  return {
    grandTotalMeals,
    totalBazarExpense,
    mealRate,
    totalUtilitiesExpense,
    totalDeposits,
    fundCashInHand,
    memberSummaries,
  };
}
