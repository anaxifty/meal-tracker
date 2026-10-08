'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Mic, MicOff, Loader2, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Member, ParsedItemResult } from '@/types/mess';
import { useSpeechRecognitionSupported } from '@/hooks/use-mounted';

interface NaturalLanguageInputProps {
  members: Member[];
  onParsedResults: (results: ParsedItemResult[], rawInput: string) => void;
}

export function NaturalLanguageInput({ members, onParsedResults }: NaturalLanguageInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionSupported = useSpeechRecognitionSupported();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition support in browser
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'bn-BD'; // Default to Bengali, also accepts English/Banglish

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/parse-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input,
          members,
          currentDate: new Date().toISOString().split('T')[0],
        }),
      });

      const data = await res.json();
      if (data.results && data.results.length > 0) {
        onParsedResults(data.results, input);
      } else {
        alert('কোন তথ্য সঠিকভাবে শনাক্ত করা যায়নি। অনুগ্রহ করে নাম ও সংখ্যা পরিষ্কার করে লিখুন।');
      }
    } catch (err) {
      console.error('Failed to parse natural language:', err);
      alert('ইনপুট প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset samples given by user
  const samplePresets = [
    {
      label: '📋 আজকের মিল শিট (০৮-১০-২৬)',
      text: `০৮-১০-২৬
মাহমুদুল - 0
সাগর - 0
ইফতি - 1
ফারহান - ০
এখলাস - 1
বেলাল- 0
মেহেদী —0`,
    },
    {
      label: '💰 ইফতির ১০০০ টাকা জমা',
      text: 'iftyr 1000 add hobe',
    },
    {
      label: '🌐 ওয়াইফাই বিল (ইফতি দিয়েছে)',
      text: 'ifty 750 tk r wifi bill dise',
    },
    {
      label: '🔥 গ্যাস কেনা হইছে',
      text: 'gas kena hoise 2230tk r',
    },
    {
      label: '🛒 বাজার খরচ',
      text: 'Bazar 850 tk for chicken and vegetables by Sagor',
    },
  ];

  return (
    <div className="bg-white border border-emerald-100 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            ন্যাচারাল ল্যাঙ্গুয়েজ ইনপুট (Natural Language Input)
          </span>
          <span className="hidden sm:inline-block text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
            বাংলা / Banglish / English
          </span>
        </div>

        {recognitionSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
              isListening
                ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-3 h-3 text-rose-600" />
                <span>শুনছি...</span>
              </>
            ) : (
              <>
                <Mic className="w-3 h-3 text-slate-500" />
                <span>মুখে বলুন</span>
              </>
            )}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`এখানে স্বাভাবিক ভাষায় লিখুন বা পেস্ট করুন...\nযেমন:\n• ০৮-১০-২৬ মাহমুদুল - 0 ইফতি - 1 এখলাস - 1...\n• iftyr 1000 add hobe\n• ifty 750 tk r wifi bill dise\n• gas kena hoise 2230tk r\n• Sagor bazar 850 tk`}
            className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-y min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <div className="absolute right-2.5 bottom-3.5 flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono">
              Ctrl + ↵
            </span>
            {input.trim() && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-1"
                title="মুছুন"
              >
                ক্লিয়ার
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>বিশ্লেষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>যুক্ত করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Example Presets */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
            <Lightbulb className="w-3 h-3 text-amber-500" /> টেস্ট করুন:
          </span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInput(preset.text);
                textareaRef.current?.focus();
              }}
              className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
