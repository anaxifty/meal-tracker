export interface Member {
  id: string;
  name: string;
  bnName?: string;
  aliases: string[];
  active: boolean;
}

export interface MealRecord {
  date: string; // YYYY-MM-DD
  meals: Record<string, number>; // memberId -> meal count (e.g. 0, 1, 1.5, 2)
  note?: string;
}

export interface BazarExpense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  shopperId?: string; // member who did bazar
  items: string;
  paidFrom: 'fund' | 'shopper'; // 'fund' = from mess deposit, 'shopper' = personal money paid by shopper
}

export interface Deposit {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  method?: string; // Cash, bKash, Nagad
  note?: string;
}

export interface UtilityExpense {
  id: string;
  category: 'wifi' | 'current' | 'gas' | 'other';
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paidById?: string; // member who paid out of pocket (e.g. ifty paid wifi bill)
  paidFrom: 'fund' | 'member';
  splitAmongMemberIds: string[]; // members sharing this bill
}

export interface ParsedItemResult {
  type: 'meals' | 'deposit' | 'bazar' | 'utility';
  summary: string;
  data: {
    date?: string;
    // For meals:
    mealEntries?: Array<{
      memberId: string;
      memberName: string;
      count: number;
    }>;
    // For deposit:
    deposit?: {
      memberId: string;
      memberName: string;
      amount: number;
      method?: string;
      note?: string;
    };
    // For bazar:
    bazar?: {
      amount: number;
      items: string;
      shopperId?: string;
      shopperName?: string;
      paidFrom?: 'fund' | 'shopper';
    };
    // For utility:
    utility?: {
      category: 'wifi' | 'current' | 'gas' | 'other';
      title: string;
      amount: number;
      paidById?: string;
      paidByName?: string;
      paidFrom: 'fund' | 'member';
    };
  };
}

export interface MessMonthState {
  monthYear: string; // "2026-10"
  members: Member[];
  mealRecords: MealRecord[];
  bazarExpenses: BazarExpense[];
  deposits: Deposit[];
  utilities: UtilityExpense[];
}
