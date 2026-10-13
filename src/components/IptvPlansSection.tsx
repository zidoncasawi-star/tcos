import React from 'react';
import { IptvPlan } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  plans: IptvPlan[];
  onNavigate: (path: string) => void;
}

export const IptvPlansSection: React.FC<Props> = ({ plans, onNavigate }) => {
  return (
    <section className="mt-16 space-y-6 pt-8 border-t border-slate-200/60">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
          IPTV & Offres
        </h2>
        <button
          onClick={() => onNavigate('/iptv')}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline text-xs sm:text-sm font-bold transition-all cursor-pointer"
        >
          <span>Voir toutes les offres</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          // Determine the duration badge text
          const durationText = `${plan.durationMonths} ${plan.durationMonths > 1 ? 'MOIS' : 'MOIS'}`;

          return (
            <div
              key={plan.id}
              className="bg-slate-950 text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden border border-slate-900/40 hover:border-slate-800/80 transition-all group hover:shadow-2xl"
            >
              {/* Corner Ambient light glow effect on hover */}
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />
              
              <div>
                {/* Card Title & Duration Badge */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide leading-snug">
                    {plan.name}
                  </h3>
                  <span className="shrink-0 bg-[#0d2a23] text-[#10b981] border border-[#10b981]/20 text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider">
                    {durationText}
                  </span>
                </div>

                {/* Price */}
                <div className="my-5 flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-black font-sans text-white tracking-tight">
                    {plan.price.toFixed(2)}€
                  </span>
                </div>

                {/* Features list */}
                <ul className="space-y-3.5">
                  {plan.features.slice(0, 6).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300 text-xs sm:text-[13px] tracking-wide leading-relaxed">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Discovery CTA Button */}
              <div className="mt-7">
                <button
                  onClick={() => onNavigate(`/commander?plan=${plan.slug}`)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-3 rounded-xl text-xs sm:text-sm transition-all shadow-sm cursor-pointer text-center block"
                >
                  Découvrir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
