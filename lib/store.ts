// DEPRECATED: This mock store is kept for backward compatibility only. All pages should use API routes instead.
import { useState, useEffect } from 'react';

export type Role = 'investor' | 'admin';
export type KycStatus = 'unverified' | 'pending' | 'approved' | 'rejected';

export interface OnboardingAnswers {
  experience: string;
  assetInterest: string;
  capitalGoal: string;
  targetDeposit: string;
  riskTolerance: string;
}

export interface PayoutDetails {
  cryptoAddress: string;
  cryptoNetwork: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
}

export interface NotificationPrefs {
  notifyDailyRoi: boolean;
  notifyStrategyAlerts: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  balance: number;
  totalInvested: number;
  totalProfit: number;
  dailyRoiPercent: number;
  allTimeRoiPercent: number;
  plan: 'Starter' | 'Growth' | 'Elite' | 'None';
  kycStatus: KycStatus;
  kycReason?: string;
  copiedTraderId?: string | null;
  onboardingCompleted: boolean;
  onboardingAnswers?: OnboardingAnswers;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  payoutDetails: PayoutDetails;
  notificationPrefs: NotificationPrefs;
}

export interface MasterTrader {
  id: string;
  name: string;
  avatar: string;
  specialty: 'FX Specialist' | 'Crypto Arbitrage' | 'Equities Momentum' | 'Multi-Asset Macro';
  winRate: number;
  riskLevel: 1 | 2 | 3 | 4 | 5;
  thirtyDayReturn: number;
  totalFollowers: number;
  bio: string;
  assets: string[];
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'Bank Wire Transfer' | 'Bitcoin (BTC)' | 'Ethereum (ETH)' | 'USDT (TRC20)';
  proofScreenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  destination: string;
  method: 'Bank Wire' | 'Crypto Wallet';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface KycSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  idDocumentUrl: string;
  proofOfAddressUrl: string;
  status: KycStatus;
  createdAt: string;
}

export interface DailyLog {
  id: string;
  date: string;
  percentage: number;
  marketNote: string;
}

export interface ChartPoint {
  date: string;
  value: number;
  percentage: number;
}

// Initial Mock Master Traders
export const INITIAL_TRADERS: MasterTrader[] = [
  {
    id: 'trader-1',
    name: 'Alexei Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialty: 'FX Specialist',
    winRate: 94.2,
    riskLevel: 2,
    thirtyDayReturn: 24.8,
    totalFollowers: 1420,
    bio: '12 years institutional FX trader covering EUR/USD, GBP/JPY high-frequency momentum.',
    assets: ['EUR/USD', 'GBP/USD', 'USD/JPY']
  },
  {
    id: 'trader-2',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    specialty: 'Crypto Arbitrage',
    winRate: 91.8,
    riskLevel: 3,
    thirtyDayReturn: 31.4,
    totalFollowers: 2180,
    bio: 'Quantitative crypto trader exploiting delta-neutral spot and futures yield spreads.',
    assets: ['BTC/USD', 'ETH/USD', 'SOL/USD']
  },
  {
    id: 'trader-3',
    name: 'Marcus Thorne',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialty: 'Equities Momentum',
    winRate: 89.5,
    riskLevel: 2,
    thirtyDayReturn: 19.6,
    totalFollowers: 950,
    bio: 'Former Wall St desk trader focusing on US Megacap tech trends and earnings breakouts.',
    assets: ['NVDA', 'AAPL', 'TSLA', 'MSFT']
  },
  {
    id: 'trader-4',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialty: 'Multi-Asset Macro',
    winRate: 93.6,
    riskLevel: 1,
    thirtyDayReturn: 22.1,
    totalFollowers: 3100,
    bio: 'Conservative global macro manager balancing gold, FX, and blue-chip equities.',
    assets: ['XAU/USD', 'EUR/USD', 'S&P 500']
  }
];

// Initial Mock User
const INITIAL_USER: User = {
  id: 'user-001',
  name: 'Alexander Sterling',
  email: 'alex.sterling@quantovest.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'investor',
  balance: 12450.80,
  totalInvested: 10000.00,
  totalProfit: 2450.80,
  dailyRoiPercent: 1.35,
  allTimeRoiPercent: 24.5,
  plan: 'Growth',
  kycStatus: 'pending',
  copiedTraderId: 'trader-1',
  onboardingCompleted: true,
  onboardingAnswers: {
    experience: 'Intermediate',
    assetInterest: 'Multi-Asset',
    capitalGoal: 'Capital Growth',
    targetDeposit: '$5,000 Growth',
    riskTolerance: 'Balanced'
  },
  twoFactorEnabled: false,
  twoFactorSecret: '',
  payoutDetails: { cryptoAddress: '', cryptoNetwork: '', bankName: '', bankAccountName: '', bankAccountNumber: '' },
  notificationPrefs: { notifyDailyRoi: true, notifyStrategyAlerts: true }
};

const INITIAL_CHARTS: ChartPoint[] = [
  { date: 'Aug 05', value: 10000.00, percentage: 0.0 },
  { date: 'Aug 06', value: 10180.00, percentage: 1.8 },
  { date: 'Aug 07', value: 10420.00, percentage: 2.35 },
  { date: 'Aug 08', value: 10890.00, percentage: 4.51 },
  { date: 'Aug 09', value: 11340.00, percentage: 4.13 },
  { date: 'Aug 10', value: 11980.00, percentage: 5.64 },
  { date: 'Aug 11', value: 12450.80, percentage: 3.92 }
];

const INITIAL_DEPOSITS: DepositRequest[] = [
  {
    id: 'dep-101',
    userId: 'user-001',
    userName: 'Alexander Sterling',
    amount: 10000.00,
    method: 'Bank Wire Transfer',
    proofScreenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-08-01 10:30 AM'
  }
];

const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wth-201',
    userId: 'user-001',
    userName: 'Alexander Sterling',
    amount: 500.00,
    destination: 'Bank Account ****4829',
    method: 'Bank Wire',
    status: 'approved',
    createdAt: '2026-08-05 02:15 PM'
  }
];

const INITIAL_KYC: KycSubmission[] = [
  {
    id: 'kyc-301',
    userId: 'user-001',
    userName: 'Alexander Sterling',
    userEmail: 'alex.sterling@quantovest.com',
    idDocumentUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    proofOfAddressUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    createdAt: '2026-08-10 09:14 AM'
  }
];

// Helper to load state from localStorage or fallback
const getStorageItem = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`quantovest_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStorageItem = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`quantovest_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
};

export const PLAN_MINIMUMS: Record<string, number> = {
  Starter: 500,
  Growth: 5000,
  Elite: 15000,
};

export const PLAN_ORDER: User['plan'][] = ['None', 'Starter', 'Growth', 'Elite'];

export function useQuantovestStore() {
  const [user, setUser] = useState<User>(() => getStorageItem('user', INITIAL_USER));
  const [traders, setTraders] = useState<MasterTrader[]>(() => getStorageItem('traders', INITIAL_TRADERS));
  const [chartData, setChartData] = useState<ChartPoint[]>(() => getStorageItem('chartData', INITIAL_CHARTS));
  const [deposits, setDeposits] = useState<DepositRequest[]>(() => getStorageItem('deposits', INITIAL_DEPOSITS));
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => getStorageItem('withdrawals', INITIAL_WITHDRAWALS));
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>(() => getStorageItem('kycSubmissions', INITIAL_KYC));
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => getStorageItem('dailyLogs', [
    { id: 'log-1', date: 'Aug 11, 2026', percentage: 1.35, marketNote: 'FX EUR/USD intraday rally + Crypto BTC momentum' }
  ]));

  useEffect(() => {
    setStorageItem('user', user);
  }, [user]);

  // Real-time synchronization across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith('quantovest_')) {
        const key = e.key.replace('quantovest_', '');
        try {
          const newVal = e.newValue ? JSON.parse(e.newValue) : null;
          if (!newVal) return;
          if (key === 'user') setUser(newVal);
          if (key === 'traders') setTraders(newVal);
          if (key === 'chartData') setChartData(newVal);
          if (key === 'deposits') setDeposits(newVal);
          if (key === 'withdrawals') setWithdrawals(newVal);
          if (key === 'kycSubmissions') setKycSubmissions(newVal);
          if (key === 'dailyLogs') setDailyLogs(newVal);
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    setStorageItem('traders', traders);
  }, [traders]);

  useEffect(() => {
    setStorageItem('chartData', chartData);
  }, [chartData]);

  useEffect(() => {
    setStorageItem('deposits', deposits);
  }, [deposits]);

  useEffect(() => {
    setStorageItem('withdrawals', withdrawals);
  }, [withdrawals]);

  useEffect(() => {
    setStorageItem('kycSubmissions', kycSubmissions);
  }, [kycSubmissions]);

  // Auth Functions
  const login = (role: Role, email?: string) => {
    if (role === 'admin') {
      const adminUser: User = {
        id: 'admin-001',
        name: 'Firm Admin (Chief Trader)',
        email: email || 'admin@quantovest.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        role: 'admin',
        balance: 42850000,
        totalInvested: 35000000,
        totalProfit: 7850000,
        dailyRoiPercent: 1.35,
        allTimeRoiPercent: 22.4,
        plan: 'Elite',
        kycStatus: 'approved',
        onboardingCompleted: true,
        twoFactorEnabled: false,
        twoFactorSecret: '',
        payoutDetails: { cryptoAddress: '', cryptoNetwork: '', bankName: '', bankAccountName: '', bankAccountNumber: '' },
        notificationPrefs: { notifyDailyRoi: true, notifyStrategyAlerts: true }
      };
      setUser(adminUser);
    } else {
      setUser(prev => ({ ...prev, role: 'investor' }));
    }
  };

  const signup = (name: string, email: string) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role: 'investor',
      balance: 0,
      totalInvested: 0,
      totalProfit: 0,
      dailyRoiPercent: 0,
      allTimeRoiPercent: 0,
      plan: 'None',
      kycStatus: 'unverified',
      onboardingCompleted: false,
      twoFactorEnabled: false,
      twoFactorSecret: '',
      payoutDetails: { cryptoAddress: '', cryptoNetwork: '', bankName: '', bankAccountName: '', bankAccountNumber: '' },
      notificationPrefs: { notifyDailyRoi: true, notifyStrategyAlerts: true }
    };
    setUser(newUser);
  };

  const completeOnboarding = (answers: OnboardingAnswers) => {
    setUser(prev => ({
      ...prev,
      onboardingCompleted: true,
      onboardingAnswers: answers
    }));
  };

  const submitKyc = (idDocUrl: string, proofAddressUrl: string) => {
    const newSubmission: KycSubmission = {
      id: `kyc-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      idDocumentUrl: idDocUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      proofOfAddressUrl: proofAddressUrl || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=80',
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };
    setKycSubmissions(prev => [newSubmission, ...prev]);
    setUser(prev => ({ ...prev, kycStatus: 'pending' }));
  };

  const submitDeposit = (amount: number, method: DepositRequest['method'], proofUrl: string) => {
    const newDeposit: DepositRequest = {
      id: `dep-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      amount,
      method,
      proofScreenshotUrl: proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };
    setDeposits(prev => [newDeposit, ...prev]);
  };

  const submitWithdrawal = (amount: number, destination: string, method: WithdrawalRequest['method']) => {
    const newWithdrawal: WithdrawalRequest = {
      id: `wth-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      amount,
      destination,
      method,
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };
    setWithdrawals(prev => [newWithdrawal, ...prev]);
  };

  const copyTrader = (traderId: string): { success: boolean; message: string } => {
    if (user.balance < 500) {
      return {
        success: false,
        message: 'Account Funding Required: You need a minimum deposit balance of $500 to copy master traders.'
      };
    }
    const trader = traders.find(t => t.id === traderId);
    setUser(prev => ({ ...prev, copiedTraderId: traderId }));
    return {
      success: true,
      message: `Successfully connected copytrading strategy to ${trader?.name || 'Master Trader'}!`
    };
  };

  // ADMIN ACTIONS
  const publishDailyRoi = (percentage: number, marketNote: string) => {
    // Calculate new balance & profit
    setUser(prev => {
      const profitDelta = prev.balance > 0 ? (prev.balance * (percentage / 100)) : 0;
      const newBalance = Math.max(0, prev.balance + profitDelta);
      const newProfit = prev.totalProfit + profitDelta;
      const newAllTime = prev.totalInvested > 0 ? ((newBalance - prev.totalInvested) / prev.totalInvested) * 100 : 0;
      return {
        ...prev,
        balance: Number(newBalance.toFixed(2)),
        totalProfit: Number(newProfit.toFixed(2)),
        dailyRoiPercent: percentage,
        allTimeRoiPercent: Number(newAllTime.toFixed(2))
      };
    });

    // Add chart point
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    setChartData(prev => {
      const lastVal = prev.length > 0 ? prev[prev.length - 1].value : 10000;
      const newVal = Number((lastVal * (1 + percentage / 100)).toFixed(2));
      return [...prev.slice(-14), { date: todayStr, value: newVal, percentage }];
    });

    // Log
    setDailyLogs(prev => [
      { id: `log-${Date.now()}`, date: new Date().toLocaleDateString(), percentage, marketNote },
      ...prev
    ]);
  };

  const approveDeposit = (depositId: string) => {
    setDeposits(prev => prev.map(d => {
      if (d.id === depositId) {
        // Credit user balance
        setUser(u => {
          const newBal = u.balance + d.amount;
          const newInvested = u.totalInvested + d.amount;
          let newPlan: User['plan'] = u.plan;
          if (newBal >= 15000) newPlan = 'Elite';
          else if (newBal >= 5000) newPlan = 'Growth';
          else if (newBal >= 500) newPlan = 'Starter';

          return {
            ...u,
            balance: Number(newBal.toFixed(2)),
            totalInvested: Number(newInvested.toFixed(2)),
            plan: newPlan
          };
        });
        return { ...d, status: 'approved' };
      }
      return d;
    }));
  };

  const approveWithdrawal = (withdrawalId: string) => {
    setWithdrawals(prev => prev.map(w => {
      if (w.id === withdrawalId) {
        setUser(u => ({
          ...u,
          balance: Math.max(0, Number((u.balance - w.amount).toFixed(2)))
        }));
        return { ...w, status: 'approved' };
      }
      return w;
    }));
  };

  const approveKyc = (userId: string) => {
    setKycSubmissions(prev => prev.map(k => k.userId === userId ? { ...k, status: 'approved' } : k));
    setUser(u => u.id === userId ? { ...u, kycStatus: 'approved' } : u);
  };

  const rejectKyc = (userId: string, reason: string) => {
    setKycSubmissions(prev => prev.map(k => k.userId === userId ? { ...k, status: 'rejected' } : k));
    setUser(u => u.id === userId ? { ...u, kycStatus: 'rejected', kycReason: reason } : u);
  };

  const createTrader = (trader: Omit<MasterTrader, 'id'>) => {
    const newTrader: MasterTrader = {
      ...trader,
      id: `trader-${Date.now()}`
    };
    setTraders(prev => [newTrader, ...prev]);
  };

  const upgradePlan = (targetPlan: User['plan']): { success: boolean; message: string } => {
    if (targetPlan === 'None') return { success: false, message: 'Cannot upgrade to None.' };
    const minBalance = PLAN_MINIMUMS[targetPlan] ?? 0;
    if (user.balance < minBalance) {
      const needed = minBalance - user.balance;
      return { success: false, message: `Insufficient balance. You need $${needed.toLocaleString()} more to qualify for the ${targetPlan} plan.` };
    }
    const currentIdx = PLAN_ORDER.indexOf(user.plan);
    const targetIdx = PLAN_ORDER.indexOf(targetPlan);
    if (targetIdx <= currentIdx) {
      return { success: false, message: `You are already on the ${user.plan} plan or higher.` };
    }
    setUser(prev => ({ ...prev, plan: targetPlan }));
    return { success: true, message: `Successfully upgraded to the ${targetPlan} plan!` };
  };

  const closeAccount = () => {
    setUser(prev => ({ ...prev, plan: 'None', balance: 0, totalProfit: 0, allTimeRoiPercent: 0 }));
  };

  const updatePayoutDetails = (details: Partial<PayoutDetails>) => {
    setUser(prev => ({ ...prev, payoutDetails: { ...prev.payoutDetails, ...details } }));
  };

  const updateNotificationPrefs = (prefs: Partial<NotificationPrefs>) => {
    setUser(prev => ({ ...prev, notificationPrefs: { ...prev.notificationPrefs, ...prefs } }));
  };

  const setTwoFactor = (enabled: boolean, secret: string) => {
    setUser(prev => ({ ...prev, twoFactorEnabled: enabled, twoFactorSecret: secret }));
  };

  return {
    user,
    traders,
    chartData,
    deposits,
    withdrawals,
    kycSubmissions,
    dailyLogs,
    login,
    signup,
    completeOnboarding,
    submitKyc,
    submitDeposit,
    submitWithdrawal,
    copyTrader,
    publishDailyRoi,
    approveDeposit,
    approveWithdrawal,
    approveKyc,
    rejectKyc,
    createTrader,
    upgradePlan,
    closeAccount,
    updatePayoutDetails,
    updateNotificationPrefs,
    setTwoFactor
  };
}
