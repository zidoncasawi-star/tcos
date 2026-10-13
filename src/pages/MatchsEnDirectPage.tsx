import React, { useState, useEffect, useRef } from 'react';
import { FootballMatch } from '../services/footballService';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, Search, Activity, Trophy, Clock, CheckCircle2 } from 'lucide-react';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

interface Props {
  onNavigate: (path: string) => void;
}

export function MatchsEnDirectPage({ onNavigate }: Props) {
  useEffect(() => {
    document.title = "TV ce soir - Matchs en direct, programme tv et résultats football";
    // Also update meta description for SEO dynamically
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Suivez le meilleur de la tv ce soir : matchs de football en direct, résultats, horaires et le programme télé des prochaines rencontres.");
    }
  }, []);

  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all');
  
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchMatches = async (date: string, isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true);
    setError(null);
    try {
      // If we are looking for purely live matches across any date, 
      // we could pass status=live, but here we'll just fetch by date and filter client-side for ease
      const res = await fetch(`/api/football/matches?date=${date}`);
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches);
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      console.error(err);
      if (!isAutoRefresh) setError('⚠️ Les données des matchs sont temporairement indisponibles.');
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(selectedDate);
    
    // Auto-refresh for live matches every 30 seconds
    autoRefreshInterval.current = setInterval(() => {
      // Only auto-refresh if there are live matches or if looking at today
      const today = new Date().toISOString().split('T')[0];
      if (selectedDate === today) {
        fetchMatches(selectedDate, true);
      }
    }, 30000);

    return () => {
      if (autoRefreshInterval.current) clearInterval(autoRefreshInterval.current);
    };
  }, [selectedDate]);

  // Derived state
  const getFilteredMatches = () => {
    return matches.filter(match => {
      // Status filter
      if (activeFilter === 'live' && match.status !== 'live' && match.status !== 'halftime') return false;
      if (activeFilter === 'upcoming' && match.status !== 'scheduled') return false;
      if (activeFilter === 'finished' && match.status !== 'finished') return false;
      
      // Competition filter
      if (selectedCompetition !== 'all' && match.competition.id !== selectedCompetition) return false;
      
      return true;
    }).sort((a, b) => {
      // Sort LIVE first, then upcoming by time, then finished by time
      const statusWeight = { live: 1, halftime: 1, scheduled: 2, finished: 3, postponed: 4, cancelled: 4, abandoned: 4 };
      const weightA = statusWeight[a.status] || 99;
      const weightB = statusWeight[b.status] || 99;
      
      if (weightA !== weightB) return weightA - weightB;
      
      // Sort by time
      return a.startTime.localeCompare(b.startTime);
    });
  };

  const filteredMatches = getFilteredMatches();
  
  // Extract unique competitions for the filter
  const availableCompetitions = Array.from(new Set(matches.map(m => m.competition.id)))
    .map(id => {
      const match = matches.find(m => m.competition.id === id);
      return { id: id as string, name: match?.competition.name || 'Inconnue' };
    })
    .sort((a, b) => {
      // Prioritize some leagues
      const priority = ['Ligue 1', 'Ligue 2', 'Coupe de France', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League', 'Europa League'];
      const indexA = priority.indexOf(a.name);
      const indexB = priority.indexOf(b.name);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

  // Date navigation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };
  
  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (dateStr === todayStr) return "Aujourd'hui";
    const dObj = new Date(); dObj.setDate(dObj.getDate() + 1);
    if (dateStr === dObj.toISOString().split('T')[0]) return 'Demain';
    dObj.setDate(dObj.getDate() - 2);
    if (dateStr === dObj.toISOString().split('T')[0]) return 'Hier';
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black font-serif text-slate-900 flex items-center gap-3">
              <span className="text-blue-600">⚽</span> Matchs en direct & TV ce soir
            </h1>
            <p className="text-slate-500 font-medium">Résultats, matchs en direct pour votre tv ce soir, et programme télé complet</p>
          </div>
          
          {/* Date Navigation */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-full self-start md:self-auto">
            <button 
              onClick={handlePrevDay}
              className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-600"
              aria-label="Jour précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleToday}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                isToday ? "bg-blue-600 text-white shadow-sm" : "bg-transparent text-slate-700 hover:bg-white"
              )}
            >
              <Calendar className="w-4 h-4" />
              {formatDateLabel(selectedDate)}
            </button>
            
            <button 
              onClick={handleNextDay}
              className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-600"
              aria-label="Jour suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton 
            active={activeFilter === 'all'} 
            onClick={() => setActiveFilter('all')}
            icon={<Search className="w-4 h-4" />}
          >
            Tous
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'live'} 
            onClick={() => setActiveFilter('live')}
            icon={<Activity className="w-4 h-4" />}
            className="data-[active=true]:bg-red-500 data-[active=true]:text-white"
          >
            🔴 En direct
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'upcoming'} 
            onClick={() => setActiveFilter('upcoming')}
            icon={<Clock className="w-4 h-4" />}
          >
            À venir
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'finished'} 
            onClick={() => setActiveFilter('finished')}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Résultats
          </FilterButton>
        </div>
        
        {availableCompetitions.length > 0 && (
          <div className="w-full md:w-auto relative">
            <select
              value={selectedCompetition}
              onChange={(e) => setSelectedCompetition(e.target.value)}
              className="w-full md:w-64 appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-10 pr-8 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="all">Toutes les compétitions</option>
              {availableCompetitions.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.name}</option>
              ))}
            </select>
            <Trophy className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl text-center font-medium">
          {error}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun match disponible</h3>
          <p className="text-slate-500">
            Aucun match ne correspond à vos critères pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMatches.map(match => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={match.id}
                onClick={() => onNavigate(`/matchs-en-direct/${match.id}`)}
                className="cursor-pointer group"
              >
                <MatchCard match={match} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: FootballMatch }) {
  const isLive = match.status === 'live' || match.status === 'halftime';
  const isFinished = match.status === 'finished';
  const isUpcoming = match.status === 'scheduled';
  const isPostponed = match.status === 'postponed';
  const isCancelled = match.status === 'cancelled';
  
  return (
    <div className={cn(
      "bg-white rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm group-hover:shadow-md",
      isLive ? "border-red-200 ring-1 ring-red-100" : "border-slate-200 group-hover:border-blue-200"
    )}>
      {/* Top bar: Competition & Status */}
      <div className={cn(
        "px-4 py-2.5 flex items-center justify-between text-xs font-bold border-b",
        isLive ? "bg-red-50 border-red-100 text-red-600" : "bg-slate-50 border-slate-100 text-slate-600"
      )}>
        <div className="flex items-center gap-2 truncate">
          {match.competition.logo ? (
            <img src={match.competition.logo} alt="" className="w-4 h-4 object-contain" loading="lazy" />
          ) : (
            <Trophy className="w-3.5 h-3.5" />
          )}
          <span className="truncate">{match.competition.name}</span>
        </div>
        
        <div className="shrink-0 ml-2">
          {isLive && (
            <span className="flex items-center gap-1.5 bg-red-100 text-red-700 px-2 py-0.5 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {match.statusText} {match.minute ? `${match.minute}'` : ''}
            </span>
          )}
          {isFinished && <span className="text-slate-500">{match.statusText}</span>}
          {isUpcoming && <span className="text-blue-600">{match.startTime}</span>}
          {isPostponed && <span className="text-amber-600">{match.statusText}</span>}
          {isCancelled && <span className="text-slate-500">{match.statusText}</span>}
        </div>
      </div>
      
      {/* Teams & Score */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2 flex-1 w-1/3">
            <TeamLogo src={match.homeTeam.logo} name={match.homeTeam.name} />
            <span className="text-sm font-bold text-slate-900 text-center line-clamp-2">
              {match.homeTeam.name}
            </span>
          </div>
          
          {/* Score Area */}
          <div className="flex flex-col items-center justify-center flex-1 shrink-0 px-2">
            {(isLive || isFinished) ? (
              <div className="flex items-center gap-3 text-3xl font-black font-serif tracking-tight text-slate-900">
                <span>{match.homeScore ?? '-'}</span>
                <span className="text-slate-300 text-xl font-sans font-normal">-</span>
                <span>{match.awayScore ?? '-'}</span>
              </div>
            ) : isPostponed || isCancelled ? (
              <div className="text-2xl font-black text-slate-300">-</div>
            ) : (
              <div className="text-lg font-bold text-slate-400">VS</div>
            )}
          </div>
          
          {/* Away Team */}
          <div className="flex flex-col items-center gap-2 flex-1 w-1/3">
            <TeamLogo src={match.awayTeam.logo} name={match.awayTeam.name} />
            <span className="text-sm font-bold text-slate-900 text-center line-clamp-2">
              {match.awayTeam.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamLogo({ src, name }: { src?: string, name: string }) {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return (
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
        <span className="text-lg font-bold uppercase">{name.substring(0, 2)}</span>
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={name} 
      className="w-12 h-12 object-contain drop-shadow-sm"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

function FilterButton({ active, children, onClick, icon, className }: { active: boolean, children: React.ReactNode, onClick: () => void, icon?: React.ReactNode, className?: string }) {
  return (
    <button
      onClick={onClick}
      data-active={active}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 border",
        active 
          ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
