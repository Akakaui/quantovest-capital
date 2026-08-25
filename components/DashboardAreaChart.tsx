'use client';

import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChartPoint {
  date: string;
  value: number;
}

type ChartMode = 'area' | 'line' | 'bar';

export default function DashboardAreaChart({ chartData }: { chartData: ChartPoint[] }) {
  const [mode, setMode] = useState<ChartMode>('area');
  const sharedAxes = (
    <>
      <CartesianGrid stroke="#263437" strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="date" stroke="#A8ACB3" fontSize={11} tickLine={false} axisLine={false} />
      <YAxis stroke="#A8ACB3" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 100', 'dataMax + 100']} tickFormatter={(value) => `$${value}`} />
      <Tooltip
        contentStyle={{ backgroundColor: '#12161A', borderColor: '#202722', borderRadius: '12px', fontSize: '12px', color: '#FFF' }}
        formatter={(value: number) => [`$${Number(value).toLocaleString()}`, 'Portfolio value']}
      />
    </>
  );

  return (
    <div>
      <div className="flex items-center justify-end gap-1 mb-2" role="group" aria-label="Chart type">
        {(['area', 'line', 'bar'] as ChartMode[]).map((chartMode) => (
          <button
            key={chartMode}
            type="button"
            onClick={() => setMode(chartMode)}
            aria-pressed={mode === chartMode}
            className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wide transition-colors ${mode === chartMode ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40' : 'text-[#93A09A] border border-transparent hover:border-[#263437] hover:text-[#F3F7F4]'}`}
          >
            {chartMode}
          </button>
        ))}
      </div>
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'bar' ? (
            <BarChart data={chartData}>
              {sharedAxes}
              <Bar dataKey="value" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          ) : mode === 'line' ? (
            <LineChart data={chartData}>
              {sharedAxes}
              <Line type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={3} dot={{ r: 3, fill: '#22C55E', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          ) : (
            <AreaChart data={chartData}>
              {sharedAxes}
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#portfolioGradient)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
