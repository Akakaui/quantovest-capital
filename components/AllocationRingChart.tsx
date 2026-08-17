'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AllocationSegment {
  name: string;
  value: number;
  color: string;
}

const PLAN_ALLOCATIONS: Record<string, AllocationSegment[]> = {
  Starter: [
    { name: 'FX', value: 100, color: '#22C55E' },
  ],
  Growth: [
    { name: 'FX', value: 60, color: '#22C55E' },
    { name: 'Crypto', value: 40, color: '#3B82F6' },
  ],
  Elite: [
    { name: 'FX', value: 40, color: '#22C55E' },
    { name: 'Crypto', value: 30, color: '#3B82F6' },
    { name: 'Stocks', value: 30, color: '#F4B860' },
  ],
};

interface AllocationRingChartProps {
  plan: string;
}

export default function AllocationRingChart({ plan }: AllocationRingChartProps) {
  const data = PLAN_ALLOCATIONS[plan] || PLAN_ALLOCATIONS['Starter'];

  return (
    <div className="p-6 rounded-2xl bg-[#141C1F] border border-[#263437] space-y-4">
      <div>
        <h3 className="text-base font-normal text-[#F3F7F4]">Portfolio Allocation</h3>
        <p className="text-xs text-[#93A09A]">
          {plan} Plan — Market Distribution
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {data.map((segment) => (
            <div key={segment.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-xs text-[#DCE8E0] font-medium">{segment.name}</span>
              </div>
              <span className="text-xs font-mono font-semibold text-[#F3F7F4]">{segment.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
