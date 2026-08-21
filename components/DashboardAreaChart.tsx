'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface ChartPoint {
  date: string;
  value: number;
}

export default function DashboardAreaChart({ chartData }: { chartData: ChartPoint[] }) {
  return (
    <div className="h-72 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#A8ACB3" fontSize={11} tickLine={false} />
          <YAxis stroke="#A8ACB3" fontSize={11} tickLine={false} domain={['dataMin - 100', 'dataMax + 100']} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#12161A', borderColor: '#202722', borderRadius: '12px', fontSize: '12px', color: '#FFF' }}
            formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Portfolio Value']}
          />
          <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#signalGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
