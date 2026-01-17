
import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface PrayerCardProps {
  name: string;
  time: string;
  isNext: boolean;
  isCompleted: boolean;
  onToggle: () => void;
}

const PrayerCard: React.FC<PrayerCardProps> = ({ name, time, isNext, isCompleted, onToggle }) => {
  return (
    <div 
      className={`relative p-5 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
        ${isNext ? 'bg-emerald-900 text-white shadow-xl scale-[1.02]' : 'bg-white text-slate-800 shadow-sm border border-slate-100 hover:border-emerald-200'}
        ${isCompleted ? 'ring-2 ring-emerald-500' : ''}
      `}
      onClick={onToggle}
    >
      {isNext && (
        <div className="absolute top-0 right-0 p-2">
          <span className="bg-emerald-400 text-emerald-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Next Prayer
          </span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <p className={`text-sm font-medium ${isNext ? 'text-emerald-100' : 'text-slate-500'}`}>{name}</p>
          <h3 className="text-2xl font-bold mt-1 tracking-tight">{time}</h3>
        </div>
        <div className="flex flex-col items-center">
          {isCompleted ? (
            <CheckCircle className={`w-8 h-8 ${isNext ? 'text-emerald-300' : 'text-emerald-500'}`} />
          ) : (
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isNext ? 'border-emerald-700' : 'border-slate-200'}`}>
              <Clock className={`w-4 h-4 ${isNext ? 'text-emerald-600' : 'text-slate-300'}`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerCard;
