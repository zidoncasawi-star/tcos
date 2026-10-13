import React from 'react';
import { Calendar } from 'lucide-react';

interface Props {
  selectedOffset: number;
  onChange: (offset: number) => void;
}

export const DateSelector: React.FC<Props> = ({ selectedOffset, onChange }) => {
  const getDayLabel = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    
    // Format e.g. "Mer. 2 Sept."
    const weekday = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    const day = d.getDate();
    const month = d.toLocaleDateString('fr-FR', { month: 'short' });
    
    if (offset === 0) return `Aujourd'hui (${day} ${month})`;
    if (offset === 1) return `Demain (${day} ${month})`;
    if (offset === 2) return `Après-demain (${day} ${month})`;
    return `${weekday} ${day} ${month}`;
  };

  return (
    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold px-2.5 hidden sm:flex shrink-0">
        <Calendar className="w-3.5 h-3.5 text-blue-600" />
        <span>Date :</span>
      </div>
      {[0, 1, 2].map(offset => {
        const isActive = selectedOffset === offset;
        return (
          <button
            key={offset}
            onClick={() => onChange(offset)}
            className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {getDayLabel(offset)}
          </button>
        );
      })}
    </div>
  );
};
