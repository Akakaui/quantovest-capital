export type PlanName = 'None' | 'Starter' | 'Growth' | 'Elite';

export const PLAN_MINIMUMS: Record<string, number> = {
  Starter: 1500,
  Growth: 7500,
  Elite: 45000,
};

export const PLAN_MINIMUMS_CENTS: Record<string, number> = {
  Starter: 150000,
  Growth: 750000,
  Elite: 4500000,
};

export const PLAN_ORDER: PlanName[] = ['None', 'Starter', 'Growth', 'Elite'];
