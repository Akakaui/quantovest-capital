import { and, eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { deposits, portfolioLedger, referralAttributions, referralRewards } from '@/db/schema';
import { notifyUser } from '@/lib/notifications';

const RATE_BPS = 1_000;

export interface ReferralRewardResult {
  created: boolean;
  reason: 'no_attribution' | 'already_rewarded' | 'created';
  rewardId?: number;
  rewardAmountCents?: number;
}

export async function grantReferralRewardForDeposit(depositId: string, depositInvestorId: string, depositAmountCents: number): Promise<ReferralRewardResult> {
  const db = getDb();
  if (!db) return { created: false, reason: 'no_attribution' };

  const attribution = await db.select().from(referralAttributions).where(and(eq(referralAttributions.referredInvestorId, depositInvestorId), eq(referralAttributions.status, 'active'))).limit(1);
  if (!attribution[0]) return { created: false, reason: 'no_attribution' };

  const key = `first-deposit:${depositInvestorId}`;
  const existing = await db.select().from(referralRewards).where(eq(referralRewards.idempotencyKey, key)).limit(1);
  if (existing[0]) return { created: false, reason: 'already_rewarded' };

  const rewardAmountCents = Math.max(0, Math.floor(depositAmountCents * RATE_BPS / 10_000));

  const rewardId = await db.transaction(async tx => {
    const inserted = await tx.insert(referralRewards).values({
      attributionId: attribution[0].id,
      referrerId: attribution[0].referrerId,
      referredInvestorId: depositInvestorId,
      qualifyingDepositId: depositId,
      idempotencyKey: key,
      qualifyingAmountCents: depositAmountCents,
      rewardAmountCents,
      status: 'available',
    }).returning({ id: referralRewards.id });
    await tx.insert(portfolioLedger).values({
      investorId: attribution[0].referrerId,
      type: 'referral_reward',
      amountCents: rewardAmountCents,
      referenceId: `referral-reward:${inserted[0].id}`,
      description: `Referral bonus — $${(rewardAmountCents / 100).toFixed(2)} from a referred investor's first deposit`,
    });
    return inserted[0].id;
  });

  await notifyUser(
    attribution[0].referrerId,
    'referral_reward_credited',
    'Referral bonus credited',
    `Your referral generated a 10% first-deposit bonus of $${(rewardAmountCents / 100).toFixed(2)}.`,
    rewardId,
  );

  return { created: true, reason: 'created', rewardId, rewardAmountCents };
}
