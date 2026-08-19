'use client';

import React from 'react';
import { Icon } from '@iconify/react';

interface HoldingCardProps {
  symbol: string;
  name: string;
  quantity: string;
  currentPrice: number;
  costBasis: number;
  change24h?: number;
}

export default function HoldingCard({ symbol, name, quantity, currentPrice, costBasis, change24h }: HoldingCardProps) {
  const currentValue = parseFloat(quantity) * currentPrice;
  const profit = currentValue - costBasis;
  const profitPercent = costBasis > 0 ? ((profit / costBasis) * 100) : 0;
  const isPositive = profit >= 0;

  return (
    <div className="p-4 bg-[#0A0F11] border border-[#263437] rounded-xl space-y-3 hover:border-[#22C55E]/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#151D20] border border-[#263437] flex items-center justify-center text-[#22C55E] text-[10px] font-mono font-bold">
            {symbol.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#F3F7F4]">{symbol.toUpperCase()}</p>
            <p className="text-[10px] text-[#93A09A]">{name}</p>
          </div>
        </div>
        {change24h !== undefined && (
          <span className={`text-[10px] font-mono font-semibold ${change24h >= 0 ? 'text-[#22C55E]' : 'text-[#CF202F]'}`}>
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <p className="text-[#93A09A] font-mono">Quantity</p>
          <p className="text-[#F3F7F4] font-mono">{parseFloat(quantity).toFixed(4)}</p>
        </div>
        <div>
          <p className="text-[#93A09A] font-mono">Price</p>
          <p className="text-[#F3F7F4] font-mono">${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-[#93A09A] font-mono">Value</p>
          <p className="text-[#F3F7F4] font-mono">${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-[#93A09A] font-mono">P&L</p>
          <p className={`font-mono font-semibold ${isPositive ? 'text-[#22C55E]' : 'text-[#CF202F]'}`}>
            {isPositive ? '+' : ''}{profitPercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
