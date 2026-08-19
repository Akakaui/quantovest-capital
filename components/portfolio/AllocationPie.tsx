'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AllocationData {
  name: string;
  percent: number;
  color: string;
}

interface AllocationPieProps {
  data: AllocationData[];
}

export default function AllocationPie({ data }: AllocationPieProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-[#0A0F11] border border-[#263437] rounded-xl text-center">
        <p className="text-xs text-[#93A09A]">No allocation data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#141C1F] border border-[#263437] rounded-2xl space-y-4">
      <h3 className="text-sm font-semibold text-[#F3F7F4]">Portfolio Allocation</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="percent"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#12161A', borderColor: '#202722', borderRadius: '12px', fontSize: '12px', color: '#FFF' }}
              formatter={(value: number) => [`${value}%`, 'Allocation']}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => <span style={{ color: '#93A09A', fontSize: '11px' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
