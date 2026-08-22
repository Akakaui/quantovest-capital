'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface OnboardingAnswers {
  experience: string;
  assetInterest: string;
  capitalGoal: string;
  targetDeposit: string;
  riskTolerance: string;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    experience: 'Intermediate',
    assetInterest: 'Multi-Asset',
    capitalGoal: 'Capital Growth',
    targetDeposit: '$7,500 Growth',
    riskTolerance: 'Balanced'
  });

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      setSaving(true);
      try {
        await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ onboardingAnswers: answers, onboardingCompleted: true }),
        });
      } catch { /* ignore */ }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#12161A] border border-[#202722] rounded-2xl max-w-lg w-full p-6 sm:p-8 text-white relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#202722] hover:bg-[#2A3539] text-[#A8ACB3] hover:text-white transition-colors flex items-center justify-center" aria-label="Close">
          <Icon icon="solar:close-bold" className="w-4 h-4" />
        </button>
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 border-b border-[#202722] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#22C55E] font-mono text-sm flex items-center justify-center font-semibold">
              0{step}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-white">Investor Questionnaire</h3>
              <p className="text-xs text-[#A8ACB3]">Step {step} of 5</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`w-5 h-1.5 rounded-full transition-all ${
                  i <= step ? 'bg-[#22C55E]' : 'bg-[#202722]'
                }`}
              ></span>
            ))}
          </div>
        </div>

        {/* Question Content */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-lg font-normal text-white">What is your trading experience level?</h4>
            <p className="text-xs text-[#A8ACB3]">Quantovest copytrading tailors risk execution to your background.</p>
            <div className="space-y-2.5 pt-2">
              {['Beginner (New to Markets)', 'Intermediate (Some Trading Experience)', 'Pro / Institutional Trader'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswers({ ...answers, experience: opt })}
                  className={`w-full p-4 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                    answers.experience === opt
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-white'
                      : 'border-[#202722] bg-[#1A1F24] text-[#A8ACB3] hover:border-[#22C55E]/40'
                  }`}
                >
                  <span>{opt}</span>
                  {answers.experience === opt && <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-[#22C55E]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-lg font-normal text-white">Which market assets interest you most?</h4>
            <p className="text-xs text-[#A8ACB3]">Select primary focus for automated strategy allocation.</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { name: 'Foreign Exchange (FX)', icon: 'solar:dollar-minimalistic-bold' },
                { name: 'Cryptocurrency', icon: 'solar:bitcoin-bold' },
                { name: 'Global Equities', icon: 'solar:chart-2-bold' },
                { name: 'Multi-Asset (All Markets)', icon: 'solar:layers-bold' }
              ].map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => setAnswers({ ...answers, assetInterest: opt.name })}
                  className={`p-4 rounded-xl border text-left text-xs font-medium flex flex-col gap-2 transition-all ${
                    answers.assetInterest === opt.name
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-white'
                      : 'border-[#202722] bg-[#1A1F24] text-[#A8ACB3] hover:border-[#22C55E]/40'
                  }`}
                >
                  <Icon icon={opt.icon} className="w-6 h-6 text-[#22C55E]" />
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-lg font-normal text-white">What is your primary financial objective?</h4>
            <p className="text-xs text-[#A8ACB3]">Helps customize your dashboard ROI growth curve projections.</p>
            <div className="space-y-2.5 pt-2">
              {[
                'Steady Capital Growth (Long Term)',
                'Monthly Passive Income Cashflow',
                'High Yield Alpha Returns'
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswers({ ...answers, capitalGoal: opt })}
                  className={`w-full p-4 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                    answers.capitalGoal === opt
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-white'
                      : 'border-[#202722] bg-[#1A1F24] text-[#A8ACB3] hover:border-[#22C55E]/40'
                  }`}
                >
                  <span>{opt}</span>
                  {answers.capitalGoal === opt && <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-[#22C55E]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h4 className="text-lg font-normal text-white">How much capital do you plan to start with?</h4>
            <p className="text-xs text-[#A8ACB3]">Quantovest offers 3 institutional plan tiers.</p>
            <div className="space-y-2.5 pt-2">
              {[
                { name: '$1,500 Starter Plan', roi: '15% Daily' },
                { name: '$7,500 Growth Plan', roi: '25% Daily' },
                { name: '$45,000+ Elite Plan', roi: '35% Daily' }
              ].map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => setAnswers({ ...answers, targetDeposit: opt.name })}
                  className={`w-full p-4 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                    answers.targetDeposit === opt.name
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-white'
                      : 'border-[#202722] bg-[#1A1F24] text-[#A8ACB3] hover:border-[#22C55E]/40'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white">{opt.name}</p>
                    <p className="text-[11px] text-[#22C55E] font-mono">{opt.roi}</p>
                  </div>
                  {answers.targetDeposit === opt.name && <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-[#22C55E]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h4 className="text-lg font-normal text-white">Select your preferred risk appetite</h4>
            <p className="text-xs text-[#A8ACB3]">Master traders execute copytrades matching your risk profile.</p>
            <div className="space-y-2.5 pt-2">
              {[
                { name: 'Conservative (Low Drawdown, Capital Preservation)', badge: 'Risk Level 1-2' },
                { name: 'Balanced (Moderate Risk & Steady Target ROI)', badge: 'Risk Level 3' },
                { name: 'Aggressive (Maximum Alpha Yield Pursuit)', badge: 'Risk Level 4-5' }
              ].map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => setAnswers({ ...answers, riskTolerance: opt.name })}
                  className={`w-full p-4 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                    answers.riskTolerance === opt.name
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-white'
                      : 'border-[#202722] bg-[#1A1F24] text-[#A8ACB3] hover:border-[#22C55E]/40'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white">{opt.name}</p>
                    <span className="text-[10px] bg-[#202722] text-[#A8ACB3] px-2 py-0.5 rounded font-mono mt-1 inline-block">
                      {opt.badge}
                    </span>
                  </div>
                  {answers.riskTolerance === opt.name && <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-[#22C55E]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buttons Footer */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#202722]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-full text-xs font-medium text-[#A8ACB3] border border-[#202722] hover:bg-[#1A1F24]"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={handleNext}
            disabled={saving}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#22C55E] text-[#0A0D0C] hover:bg-[#16A34A] flex items-center gap-2"
          >
            <span>{step === 5 ? (saving ? 'Saving...' : 'Complete Onboarding') : 'Continue'}</span>
            <Icon icon="solar:alt-arrow-right-bold" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
