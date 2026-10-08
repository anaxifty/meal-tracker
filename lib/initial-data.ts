import { Member, MessMonthState } from '@/types/mess';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm-1',
    name: 'Farhan',
    bnName: 'ফারহান',
    aliases: ['farhan', 'ফারহান', 'farhanr', 'farhaner'],
    active: true,
  },
  {
    id: 'm-2',
    name: 'Ifty',
    bnName: 'ইফতি',
    aliases: ['ifty', 'ইফতি', 'iftyr', 'iftyer', 'ifty bhai'],
    active: true,
  },
  {
    id: 'm-3',
    name: 'Mahmudul',
    bnName: 'মাহমুদুল',
    aliases: ['mahmudul', 'মাহমুদুল', 'mahmuduler', 'mahmud'],
    active: true,
  },
  {
    id: 'm-4',
    name: 'Belal',
    bnName: 'বেলাল',
    aliases: ['belal', 'বেলাল', 'belaler', 'bilal'],
    active: true,
  },
  {
    id: 'm-5',
    name: 'Mehedi',
    bnName: 'মেহেদী',
    aliases: ['mehedi', 'মেহেদী', 'mehedi jr', 'mehedir', 'mehedier'],
    active: true,
  },
  {
    id: 'm-6',
    name: 'Sagor',
    bnName: 'সাগর',
    aliases: ['sagor', 'সাগর', 'sagorer', 'sagorr', 'shagor'],
    active: true,
  },
  {
    id: 'm-7',
    name: 'Ikhlas',
    bnName: 'এখলাস',
    aliases: ['ikhlas', 'এখলাস', 'ইখলাস', 'ikhlaser', 'ekhlas'],
    active: true,
  },
  {
    id: 'm-8',
    name: 'Shifat',
    bnName: 'শিফাত',
    aliases: ['shifat', 'শিফাত', 'shifater', 'sifat'],
    active: true,
  },
];

export function getInitialState(monthYear = '2026-10'): MessMonthState {
  const members = [...INITIAL_MEMBERS];

  // Pre-seed a few days of sample meal records for October 2026 so the table is immediately populated and demonstrates calculations
  const mealRecords = [
    {
      date: '2026-10-01',
      meals: {
        'm-1': 2,
        'm-2': 3,
        'm-3': 2,
        'm-4': 2,
        'm-5': 1,
        'm-6': 2,
        'm-7': 2,
        'm-8': 2,
      },
      note: 'Lunch & Dinner',
    },
    {
      date: '2026-10-02',
      meals: {
        'm-1': 2,
        'm-2': 2,
        'm-3': 1,
        'm-4': 2,
        'm-5': 2,
        'm-6': 3,
        'm-7': 1,
        'm-8': 2,
      },
    },
    {
      date: '2026-10-03',
      meals: {
        'm-1': 1,
        'm-2': 2,
        'm-3': 2,
        'm-4': 0,
        'm-5': 2,
        'm-6': 2,
        'm-7': 2,
        'm-8': 1,
      },
    },
    {
      date: '2026-10-04',
      meals: {
        'm-1': 2,
        'm-2': 2,
        'm-3': 2,
        'm-4': 2,
        'm-5': 1,
        'm-6': 2,
        'm-7': 2,
        'm-8': 2,
      },
    },
    {
      date: '2026-10-05',
      meals: {
        'm-1': 2,
        'm-2': 3,
        'm-3': 2,
        'm-4': 2,
        'm-5': 2,
        'm-6': 2,
        'm-7': 1,
        'm-8': 2,
      },
    },
    {
      date: '2026-10-06',
      meals: {
        'm-1': 1,
        'm-2': 2,
        'm-3': 2,
        'm-4': 2,
        'm-5': 2,
        'm-6': 2,
        'm-7': 2,
        'm-8': 0,
      },
    },
    {
      date: '2026-10-07',
      meals: {
        'm-1': 2,
        'm-2': 2,
        'm-3': 2,
        'm-4': 1,
        'm-5': 2,
        'm-6': 2,
        'm-7': 2,
        'm-8': 2,
      },
    },
    {
      date: '2026-10-08',
      meals: {
        'm-1': 0,
        'm-2': 1,
        'm-3': 0,
        'm-4': 0,
        'm-5': 0,
        'm-6': 0,
        'm-7': 1,
        'm-8': 0,
      },
      note: '০৮-১০-২৬ user prompt example',
    },
  ];

  // Daily Bazar (Meal expenditures)
  const bazarExpenses = [
    {
      id: 'b-1',
      date: '2026-10-01',
      amount: 1250,
      shopperId: 'm-6', // Sagor
      items: 'Chicken, Vegetables, Cooking Oil',
      paidFrom: 'fund' as const,
    },
    {
      id: 'b-2',
      date: '2026-10-03',
      amount: 880,
      shopperId: 'm-1', // Farhan
      items: 'Rice 10kg, Dal, Spices',
      paidFrom: 'fund' as const,
    },
    {
      id: 'b-3',
      date: '2026-10-05',
      amount: 1120,
      shopperId: 'm-2', // Ifty
      items: 'Fish, Potatoes, Onions, Green Chili',
      paidFrom: 'fund' as const,
    },
    {
      id: 'b-4',
      date: '2026-10-07',
      amount: 750,
      shopperId: 'm-4', // Belal
      items: 'Eggs 2 dozen, Vegetables, Flour',
      paidFrom: 'fund' as const,
    },
  ];

  // Deposits from members
  const deposits = [
    {
      id: 'd-1',
      memberId: 'm-1', // Farhan
      date: '2026-10-01',
      amount: 2000,
      method: 'bKash',
      note: 'Advance deposit',
    },
    {
      id: 'd-2',
      memberId: 'm-2', // Ifty
      date: '2026-10-01',
      amount: 2000,
      method: 'Cash',
      note: 'Advance deposit',
    },
    {
      id: 'd-3',
      memberId: 'm-3', // Mahmudul
      date: '2026-10-01',
      amount: 2000,
      method: 'Nagad',
    },
    {
      id: 'd-4',
      memberId: 'm-4', // Belal
      date: '2026-10-02',
      amount: 2000,
      method: 'Cash',
    },
    {
      id: 'd-5',
      memberId: 'm-5', // Mehedi
      date: '2026-10-02',
      amount: 1500,
      method: 'bKash',
    },
    {
      id: 'd-6',
      memberId: 'm-6', // Sagor
      date: '2026-10-01',
      amount: 2000,
      method: 'Cash',
    },
    {
      id: 'd-7',
      memberId: 'm-7', // Ikhlas
      date: '2026-10-01',
      amount: 2000,
      method: 'bKash',
    },
    {
      id: 'd-8',
      memberId: 'm-8', // Shifat
      date: '2026-10-03',
      amount: 1500,
      method: 'Cash',
    },
  ];

  // Shared utilities: Wifi bill, Gas cylinder, Current bill (Electricity)
  // Per user instruction: wifi, current bill, gas bill are subtracted from everybody's deposited money
  const allMemberIds = members.map((m) => m.id);
  const utilities = [
    {
      id: 'u-1',
      category: 'wifi' as const,
      title: 'Wifi Bill (Internet)',
      amount: 750,
      date: '2026-10-05',
      paidById: 'm-2', // "ifty 750 tk r wifi bill dise" -> Ifty paid out of pocket
      paidFrom: 'member' as const,
      splitAmongMemberIds: allMemberIds,
    },
    {
      id: 'u-2',
      category: 'gas' as const,
      title: 'Gas Cylinder',
      amount: 2230,
      date: '2026-10-06',
      paidById: undefined,
      paidFrom: 'fund' as const, // Paid from mess fund
      splitAmongMemberIds: allMemberIds,
    },
    {
      id: 'u-3',
      category: 'current' as const,
      title: 'Current Bill (Electricity)',
      amount: 1600,
      date: '2026-10-07',
      paidById: undefined,
      paidFrom: 'fund' as const,
      splitAmongMemberIds: allMemberIds,
    },
  ];

  return {
    monthYear,
    members,
    mealRecords,
    bazarExpenses,
    deposits,
    utilities,
  };
}
