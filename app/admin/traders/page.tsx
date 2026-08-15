'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useQuantovestStore, MasterTrader } from '@/lib/store';
import { Icon } from '@iconify/react';

export default function AdminTradersPage() {
  const { traders, createTrader } = useQuantovestStore();
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState<MasterTrader['specialty']>('FX Specialist');
  const [winRate, setWinRate] = useState(92.5);
  const [riskLevel, setRiskLevel] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [thirtyDayReturn, setThirtyDayReturn] = useState(25.0);
  const [bio, setBio] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTrader({
      name,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      specialty,
      winRate,
      riskLevel,
      thirtyDayReturn,
      totalFollowers: 100,
      bio: bio || 'Institutional strategy execution trader focusing on momentum alpha.',
      assets: ['EUR/USD', 'BTC/USD']
    });
    setName('');
    setBio('');
  };

  return (
    <div className="min-h-screen bg-[#0A0D0C] text-white flex flex-col md:flex-row font-sans">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#202722] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-white">Master Trader Profile Manager</h1>
          <p className="text-xs text-[#A8ACB3]">Create and manage institutional master trader profiles visible to investors.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Trader Form */}
          <form onSubmit={handleSubmit} className="bg-[#12161A] border border-[#202722] rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-normal text-white mb-2">Create New Master Trader Profile</h3>
            
            <div>
              <label className="text-xs text-[#A8ACB3] block mb-1">Trader Legal / Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Victor Krum — FX Strategist"
                className="w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A8ACB3] block mb-1">Specialty Focus</label>
                <select
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value as MasterTrader['specialty'])}
                  className="w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#22C55E]"
                >
                  <option value="FX Specialist">FX Specialist</option>
                  <option value="Crypto Arbitrage">Crypto Arbitrage</option>
                  <option value="Equities Momentum">Equities Momentum</option>
                  <option value="Multi-Asset Macro">Multi-Asset Macro</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#A8ACB3] block mb-1">Win Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={winRate}
                  onChange={e => setWinRate(Number(e.target.value))}
                  className="w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A8ACB3] block mb-1">30-Day Return (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={thirtyDayReturn}
                  onChange={e => setThirtyDayReturn(Number(e.target.value))}
                  className="w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div>
                <label className="text-xs text-[#A8ACB3] block mb-1">Risk Score (1 to 5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  required
                  value={riskLevel}
                  onChange={e => setRiskLevel(Number(e.target.value) as any)}
                  className="w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#A8ACB3] block mb-1">Trader Strategy Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Institutional background, market pairing focus..."
                className="w-full bg-[#0A0D0C] border border-[#202722] rounded-xl p-3 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#22C55E] text-[#E8EFEB] font-semibold text-xs hover:bg-[#16A34A] transition-colors shadow-lg mt-2"
            >
              Add Master Trader Profile
            </button>
          </form>

          {/* Existing Traders List */}
          <div className="space-y-4">
            <h3 className="text-base font-normal text-white">Active Master Traders ({traders.length})</h3>
            {traders.map((trader) => (
              <div key={trader.id} className="p-4 rounded-xl bg-[#12161A] border border-[#202722] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={trader.avatar} alt={trader.name} className="w-10 h-10 rounded-full object-cover border border-[#22C55E]/40" />
                  <div>
                    <p className="font-semibold text-white">{trader.name}</p>
                    <p className="text-[10px] text-[#A8ACB3]">{trader.specialty}</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <p className="text-xs text-[#22C55E] font-semibold">+{trader.thirtyDayReturn}% 30D</p>
                  <p className="text-[10px] text-[#A8ACB3]">{trader.winRate}% Win Rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
