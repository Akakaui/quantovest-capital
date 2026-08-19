export type PlanName = 'None' | 'Starter' | 'Growth' | 'Elite';

export const PLAN_MINIMUMS: Record<string, number> = {
  Starter: 500,
  Growth: 5000,
  Elite: 15000,
};

export const PLAN_MINIMUMS_CENTS: Record<string, number> = {
  Starter: 50000,
  Growth: 500000,
  Elite: 1500000,
};

export const PLAN_ORDER: PlanName[] = ['None', 'Starter', 'Growth', 'Elite'];
