
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DailyProgress } from '../types';

interface ProgressTrackerProps {
  history: DailyProgress[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ history }) => {
  const chartData = history.slice(-7).map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    count: Object.values(day.prayers).filter(p => p).length,
  }));

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Consistency</h2>
          <p className="text-sm text-slate-500">Prayer count for the last 7 days</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-emerald-600">
            {chartData.length > 0 ? chartData[chartData.length - 1].count : 0}
          </span>
          <span className="text-slate-400 text-sm ml-1">/ 5 today</span>
        </div>
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.count === 5 ? '#059669' : '#10b981'} fillOpacity={entry.count / 5 + 0.2} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressTracker;
