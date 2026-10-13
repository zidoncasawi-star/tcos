import React, { useState, useEffect, useRef } from 'react';
import { FootballMatch } from '../services/footballService';
import { ChevronLeft, Trophy, Calendar, Clock, Activity, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

interface Props {
  matchId: string;
  onNavigate: (path: string) => void;
}

export function MatchDetailPage({ matchId, onNavigate }: Props) {
  const [match, setMatch] = useState<FootballMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchMatch = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true);
    try {
      const res = await fetch(`/api/football/matches/${matchId}`);
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      if (data.success && data.match) {
        setMatch(data.match);
      } else {
        throw new Error(data.error || 'Match introuvable');
      }
    } catch (err) {
      console.error(err);
      if (!isAutoRefresh) setError('⚠️ Impossible de charger les détails de ce match.');
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
    
    // Auto-refresh for live matches every 30 seconds
    autoRefreshInterval.current = setInterval(() => {
      if (match && (match.status === 'live' || match.status === 'halftime')) {
        fetchMatch(true);
      }
    }, 30000);

    return () => {
      if (autoRefreshInterval.current) clearInterval(autoRefreshInterval.current);
    };
  }, [matchId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-64 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => onNavigate('/matchs-en-direct')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" /> Retour aux matchs
        </button>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-8 rounded-3xl text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 mb-4 text-amber-500" />
          <h2 className="text-xl font-bold mb-2">Match introuvable</h2>
          <p>{error || 'Ce match n\'existe pas ou a été supprimé.'}</p>
        </div>
      </div>
    );
  }

  const isLive = match.status === 'live' || match.status === 'halftime';
  const isFinished = match.status === 'finished';
  const isUpcoming = match.status === 'scheduled';
  
  const pageTitle = `${match.homeTeam.name} vs ${match.awayTeam.name} - En direct à la TV ce soir`;
  
  useEffect(() => {
    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", `Suivez en direct le match ${match.homeTeam.name} contre ${match.awayTeam.name} (${match.competition.name}) à la tv ce soir. Programme tv, score, résultats et événements du match.`);
    }
  }, [pageTitle, match]);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Back Button */}
      <button 
        onClick={() => onNavigate('/matchs-en-direct')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-medium group"
      >
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 group-hover:shadow-sm transition-all">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Tous les matchs
      </button>

      {/* Scoreboard Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
        {/* Subtle background pattern/color based on status */}
        <div className={cn(
          "absolute inset-0 opacity-10 pointer-events-none",
          isLive ? "bg-gradient-to-br from-red-500 to-transparent" : "bg-slate-50"
        )} />

        <div className="relative p-8 md:p-12">
          {/* Competition Header */}
          <div className="flex flex-col items-center justify-center mb-10 gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full text-sm font-bold text-slate-700">
              {match.competition.logo ? (
                <img src={match.competition.logo} alt="" className="w-5 h-5 object-contain" />
              ) : (
                <Trophy className="w-4 h-4" />
              )}
              {match.competition.name}
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(match.date).toLocaleDateString('fr-FR')}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {match.startTime}</span>
            </div>
          </div>

          {/* Teams & Score Layout */}
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-4 flex-1 w-1/3">
              <TeamLogo src={match.homeTeam.logo} name={match.homeTeam.name} size="lg" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 text-center">
                {match.homeTeam.name}
              </h2>
            </div>
            
            {/* Score Center */}
            <div className="flex flex-col items-center justify-center flex-1 shrink-0 px-4">
              {(isLive || isFinished) ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-4 md:gap-8 text-5xl md:text-7xl font-black font-serif tracking-tighter text-slate-900">
                    <span>{match.homeScore ?? '-'}</span>
                    <span className="text-slate-300 text-4xl font-sans font-light">-</span>
                    <span>{match.awayScore ?? '-'}</span>
                  </div>
                  {isLive && (
                    <div className="mt-4 flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1 rounded-full font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      {match.statusText} {match.minute ? `${match.minute}'` : ''}
                    </div>
                  )}
                  {isFinished && (
                    <div className="mt-4 text-slate-500 font-bold bg-slate-100 px-4 py-1 rounded-full text-sm">
                      {match.statusText}
                    </div>
                  )}
                </div>
              ) : match.status === 'postponed' || match.status === 'cancelled' || match.status === 'abandoned' ? (
                <div className="text-3xl font-black text-slate-400">
                  {match.statusText.toUpperCase()}
                </div>
              ) : (
                <div className="text-2xl md:text-3xl font-bold text-slate-300 bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center border border-slate-100">
                  VS
                </div>
              )}
            </div>
            
            {/* Away Team */}
            <div className="flex flex-col items-center gap-4 flex-1 w-1/3">
              <TeamLogo src={match.awayTeam.logo} name={match.awayTeam.name} size="lg" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 text-center">
                {match.awayTeam.name}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Future features like events could go here */}
      <div className="mt-8 text-center text-slate-500 text-sm bg-slate-50 rounded-2xl p-6 border border-slate-100 border-dashed">
        <Activity className="w-6 h-6 mx-auto mb-2 text-slate-400" />
        <p>Plus de détails (événements, statistiques) seront disponibles prochainement.</p>
      </div>
    </div>
  );
}

function TeamLogo({ src, name, size = "md" }: { src?: string, name: string, size?: "md" | "lg" }) {
  const [error, setError] = useState(false);
  
  const sizeClasses = size === "lg" ? "w-24 h-24 md:w-32 md:h-32 text-3xl" : "w-12 h-12 text-lg";
  
  if (!src || error) {
    return (
      <div className={cn("rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 drop-shadow-sm", sizeClasses)}>
        <span className="font-bold uppercase">{name.substring(0, 2)}</span>
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={name} 
      className={cn("object-contain drop-shadow-md", sizeClasses)}
      onError={() => setError(true)}
    />
  );
}
