import React from 'react';
import { Program, Channel } from '../types';
import { ChannelBadge } from './ChannelBadge';
import { Clock, Film, Tv, Trophy, Info, Sparkles, Smile, ShieldAlert, Star, Play } from 'lucide-react';

interface Props {
  program: Program;
  channel?: Channel;
  variant?: 'compact' | 'featured' | 'horizontal';
  onSelectChannel?: (channelSlug: string) => void;
  onSelectProgram?: (program: Program) => void;
}

export const ProgramCard: React.FC<Props> = ({
  program,
  channel,
  variant = 'compact',
  onSelectChannel,
  onSelectProgram
}) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'film': return <Film className="w-3.5 h-3.5 text-amber-600" />;
      case 'serie': return <Tv className="w-3.5 h-3.5 text-blue-600" />;
      case 'sport': return <Trophy className="w-3.5 h-3.5 text-emerald-600" />;
      case 'info': return <Info className="w-3.5 h-3.5 text-indigo-600" />;
      case 'divertissement': return <Sparkles className="w-3.5 h-3.5 text-rose-600" />;
      case 'jeunesse': return <Smile className="w-3.5 h-3.5 text-purple-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'film': return 'text-red-600 bg-red-50 border border-red-100';
      case 'serie': return 'text-blue-600 bg-blue-50 border border-blue-100';
      case 'sport': return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
      case 'divertissement': return 'text-purple-600 bg-purple-50 border border-purple-100';
      case 'info': return 'text-slate-700 bg-slate-100 border border-slate-200';
      default: return 'text-slate-600 bg-slate-100 border border-slate-200';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'film': return 'Film';
      case 'serie': return 'Série';
      case 'sport': return 'Sport';
      case 'info': return 'Information';
      case 'divertissement': return 'Divertissement';
      case 'jeunesse': return 'Jeunesse';
      case 'documentaire': return 'Documentaire';
      case 'magazine': return 'Magazine';
      default: return 'Programme';
    }
  };

  // Calculate live progress if happening now
  const now = new Date();
  const currentTotalMin = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = program.startTime.split(':').map(Number);
  const [eh, em] = program.endTime.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh < sh ? (eh + 24) * 60 + em : eh * 60 + em;
  const isLive = program.dateOffset === 0 && currentTotalMin >= startMin && currentTotalMin <= endMin;
  const progressPercent = isLive ? Math.min(100, Math.max(0, ((currentTotalMin - startMin) / (endMin - startMin)) * 100)) : 0;

  if (variant === 'featured') {
    return (
      <article
        onClick={() => onSelectProgram?.(program)}
        className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col md:flex-row"
      >
        <div className="relative md:w-5/12 h-48 md:h-auto min-h-[220px] bg-slate-900 overflow-hidden shrink-0">
          <img
            src={program.imageUrl}
            alt={program.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {channel && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectChannel?.(channel.slug);
                }}
                className="hover:opacity-90"
              >
                <ChannelBadge channel={channel} size="sm" />
              </button>
            )}
            {isLive && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white tracking-wider uppercase shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Direct
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 text-white">
            <span className="text-xl font-bold tracking-tight font-serif">
              {program.startTime}
            </span>
            <span className="text-xs text-slate-300 ml-1.5">
              ({program.durationMinutes} min)
            </span>
          </div>
        </div>

        <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${getCategoryBadgeClass(program.category)}`}>
                {getCategoryIcon(program.category)}
                <span>{getCategoryLabel(program.category)}</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {program.genre}
              </span>
              {program.tmdb_vote_average && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  {program.tmdb_vote_average}
                </span>
              )}
              {program.tmdb_trailer_key && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                  <Play className="w-2.5 h-2.5 fill-red-600 text-red-600" />
                  Bande-annonce
                </span>
              )}
              {program.rating && program.rating !== 'Tous publics' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <ShieldAlert className="w-3 h-3" />
                  {program.rating}
                </span>
              )}
            </div>

            <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1 font-serif">
              {program.title}
            </h3>

            {program.subtitle && (
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-2.5 line-clamp-1">
                {program.subtitle}
              </p>
            )}

            <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
              {program.synopsis}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              {program.director && (
                <span>De : <strong className="text-slate-700">{program.director}</strong></span>
              )}
              {program.presenter && (
                <span>Présenté par : <strong className="text-slate-700">{program.presenter}</strong></span>
              )}
            </div>
            <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Fiche détaillée &rarr;
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Standard compact card (for grids)
  return (
    <article
      onClick={() => onSelectProgram?.(program)}
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col"
    >
      <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
        <img
          src={program.imageUrl}
          alt={program.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {channel && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectChannel?.(channel.slug);
              }}
              className="hover:opacity-90"
            >
              <ChannelBadge channel={channel} size="sm" />
            </button>
          )}
          {isLive && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white tracking-wider uppercase shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Direct
            </span>
          )}
        </div>

        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
          <div className="font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-300" />
            <span>{program.startTime} - {program.endTime}</span>
          </div>
          <span className="text-[11px] text-slate-300">
            {program.durationMinutes} min
          </span>
        </div>

        {isLive && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${getCategoryBadgeClass(program.category)}`}>
              {getCategoryIcon(program.category)}
              <span>{getCategoryLabel(program.category)}</span>
            </span>
            <span className="text-[11px] text-slate-400">•</span>
            <span className="text-[11px] text-slate-500 line-clamp-1">
              {program.genre}
            </span>
            {program.tmdb_vote_average && (
              <>
                <span className="text-[11px] text-slate-400">•</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                  {program.tmdb_vote_average}
                </span>
              </>
            )}
          </div>

          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1 font-serif">
            {program.title}
          </h4>

          {program.subtitle && (
            <p className="text-xs text-slate-500 line-clamp-1 mb-2 font-medium">
              {program.subtitle}
            </p>
          )}

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {program.synopsis}
          </p>
        </div>

        {program.rating && program.rating !== 'Tous publics' && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] text-amber-700">
            <ShieldAlert className="w-3 h-3" />
            <span>{program.rating}</span>
          </div>
        )}
      </div>
    </article>
  );
};
