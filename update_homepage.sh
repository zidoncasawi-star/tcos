cat << 'INNEREOF' > src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Channel, Program, IptvPlan, ProgramCategory } from '../types';
import { ProgramCard } from '../components/ProgramCard';
import { ChannelBadge } from '../components/ChannelBadge';
import { DateSelector } from '../components/DateSelector';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { Sparkles, Radio, HelpCircle } from 'lucide-react';
import { HomeSection } from '../components/HomeSection';
import { FootballMatch } from '../services/footballService';

interface Props {
  channels: Channel[];
  programs: Program[];
  iptvPlans: IptvPlan[];
  selectedDateOffset: number;
  onDateChange: (offset: number) => void;
  onNavigate: (path: string) => void;
  onSelectProgram: (program: Program) => void;
}

export const HomePage: React.FC<Props> = ({
  channels,
  programs,
  iptvPlans,
  selectedDateOffset,
  onDateChange,
  onNavigate,
  onSelectProgram
}) => {
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/football/matches?date=${today}`)
      .then(res => res.json())
      .then(data => setMatches(data.matches || []))
      .catch(() => setMatches([]));
  }, []);

  const now = new Date();
  const currentTotalMin = now.getHours() * 60 + now.getMinutes();
  
  // Base day programs
  const dayPrograms = programs.length > 0 && programs.some(p => p.dateOffset === selectedDateOffset)
    ? programs.filter(p => p.dateOffset === selectedDateOffset)
    : programs;

  // 1. Programme TV (General preview)
  const previewPrograms = dayPrograms.slice(0, 8);

  // 2. Ce soir (Prime time) - WITH FILTER
  let primeTimePrograms = dayPrograms
    .filter(p => p.isPrimeTime || (p.startTime >= '20:45' && p.startTime <= '21:30'));
    
  if (selectedCategory !== 'all') {
    if (selectedCategory === 'tnt') {
      primeTimePrograms = primeTimePrograms.filter(p => {
        const c = channels.find(ch => ch.id === p.channelId);
        return c?.isTnt;
      });
    } else {
      primeTimePrograms = primeTimePrograms.filter(p => p.category === selectedCategory);
    }
  }
  primeTimePrograms = primeTimePrograms.slice(0, 8);

  // 3. Direct (Live now)
  const livePrograms = dayPrograms.filter(p => {
    const [sh, sm] = p.startTime.split(':').map(Number);
    const [eh, em] = p.endTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh < sh ? (eh + 24) * 60 + em : eh * 60 + em;
    return currentTotalMin >= startMin && currentTotalMin <= endMin;
  }).slice(0, 6);

  // 4. Matchs
  // Prioritize live, then upcoming, then recent finished
  const sortedMatches = [...matches].sort((a, b) => {
    const getStatusWeight = (status: string) => {
      if (status === 'live' || status === 'halftime') return 3;
      if (status === 'scheduled') return 2;
      return 1;
    };
    const weightA = getStatusWeight(a.status);
    const weightB = getStatusWeight(b.status);
    if (weightA !== weightB) return weightB - weightA;
    return a.startTime.localeCompare(b.startTime);
  }).slice(0, 6);

  // 5. TNT
  const tntChannels = channels.filter(c => c.isTnt).slice(0, 8);

  // 6. Chaînes
  const allChannelsPreview = channels.slice(0, 8);

  // 7. Films
  const films = dayPrograms.filter(p => p.category === 'film' && p.startTime >= '18:00').slice(0, 6);

  // 8. Sport
  const sports = dayPrograms.filter(p => p.category === 'sport').slice(0, 6);

  const getChannel = (channelId: string) => channels.find(c => c.id === channelId);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-16">
      <SeoJsonLd schema={[]} />
      
      {/* Header with Title and Date Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-slate-900 italic tracking-tight leading-tight">
            TV ce soir : Programme TV et télévision en direct
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-3xl">
            Découvrez le meilleur de la tv ce soir. Retrouvez votre programme tv complet, les chaînes de la TNT, et tout votre programme télé (films, séries, sport) à ne pas manquer.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <DateSelector
            selectedOffset={selectedDateOffset}
            onChange={onDateChange}
          />
          <button
            onClick={() => onNavigate('/programme-tv/maintenant')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-colors border border-slate-200 shadow-xs cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>En direct</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: All portal sections */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Main Prime Time Section (Classic layout as requested) */}
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-red-600 font-bold uppercase tracking-wider text-[10px] sm:text-xs font-mono mb-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span>Première partie de soirée • 21:10</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                  Programme TV ce soir
                </h2>
              </div>
              
              {/* Desktop Filters */}
              <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto hide-scrollbar">
                {['all', 'tnt', 'film', 'series', 'sport', 'divertissement', 'info'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {cat === 'all' ? 'Tous' : 
                     cat === 'tnt' ? 'TNT' :
                     cat === 'film' ? 'Films' : 
                     cat === 'series' ? 'Séries' : 
                     cat === 'sport' ? 'Sport' : 
                     cat === 'divertissement' ? 'Divertissement' : 'Info'}
                  </button>
                ))}
              </div>
            </div>

            {primeTimePrograms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                {primeTimePrograms.map(program => (
                  <ProgramCard
                    key={`${program.id}-${program.channelId}`}
                    program={program}
                    channel={getChannel(program.channelId)}
                    onClick={() => onSelectProgram(program)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                <p className="text-slate-500 font-medium">Aucun programme trouvé pour cette catégorie ce soir.</p>
              </div>
            )}
            
            <div className="pt-2 text-right">
              <button
                onClick={() => onNavigate('/programme-tv/ce-soir')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Voir tout le programme de ce soir &rarr;
              </button>
            </div>
          </section>

          {/* 3. Direct */}
          {livePrograms.length > 0 && (
            <HomeSection title="Direct" viewMoreHref="/programme-tv/maintenant" onNavigate={onNavigate}>
              {livePrograms.map(program => (
                <div key={program.id} className="w-64 sm:w-auto shrink-0">
                  <ProgramCard program={program} channel={getChannel(program.channelId)} onClick={() => onSelectProgram(program)} />
                </div>
              ))}
            </HomeSection>
          )}

          {/* 4. Matchs */}
          {sortedMatches.length > 0 && (
            <HomeSection title="Matchs" viewMoreLabel="Voir tous les matchs" viewMoreHref="/matchs-en-direct" onNavigate={onNavigate}>
              {sortedMatches.map(match => {
                const isLive = match.status === 'live' || match.status === 'halftime';
                const isFinished = match.status === 'finished';
                return (
                  <div 
                    key={match.id} 
                    className="w-72 sm:w-auto shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
                    onClick={() => onNavigate(`/matchs-en-direct/${match.id}`)}
                  >
                    <div className="px-3 py-2 flex items-center justify-between text-[10px] font-bold border-b bg-slate-50 border-slate-100 text-slate-600">
                      <span className="truncate pr-2">{match.competition.name}</span>
                      <div className="shrink-0 flex items-center">
                        {isLive && (
                          <span className="flex items-center gap-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            {match.statusText} {match.minute ? `${match.minute}'` : ''}
                          </span>
                        )}
                        {isFinished && <span>{match.statusText}</span>}
                        {match.status === 'scheduled' && <span className="text-blue-600">{match.startTime}</span>}
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex flex-col items-center gap-2 flex-1 w-1/3">
                        {match.homeTeam.logo ? (
                          <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                            {match.homeTeam.name.substring(0,2)}
                          </div>
                        )}
                        <span className="text-xs font-bold text-center line-clamp-1">{match.homeTeam.name}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center flex-1 shrink-0 px-1">
                        {(isLive || isFinished) ? (
                          <div className="text-xl font-black font-serif text-slate-900 tracking-tighter">
                            {match.homeScore ?? '-'}<span className="text-slate-300 font-sans mx-1">-</span>{match.awayScore ?? '-'}
                          </div>
                        ) : (
                          <div className="text-sm font-bold text-slate-400">VS</div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-1 w-1/3">
                        {match.awayTeam.logo ? (
                          <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                            {match.awayTeam.name.substring(0,2)}
                          </div>
                        )}
                        <span className="text-xs font-bold text-center line-clamp-1">{match.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </HomeSection>
          )}

          {/* 5. TNT */}
          {tntChannels.length > 0 && (
            <HomeSection title="TNT" viewMoreLabel="Voir toutes les chaînes TNT" viewMoreHref="/programme-tv/tnt" onNavigate={onNavigate}>
              {tntChannels.map(channel => (
                <div 
                  key={channel.id} 
                  className="w-32 sm:w-auto shrink-0 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                  onClick={() => onNavigate(`/programme-tv/chaines/${channel.slug}`)}
                >
                  <div className="w-12 h-12 flex flex-col items-center justify-center">
                    {channel.logoUrl ? (
                      <img src={channel.logoUrl} alt={channel.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ChannelBadge channel={channel} size="lg" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-700 text-center">{channel.name}</span>
                  {channel.number && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-bold">
                      Canal {channel.number}
                    </span>
                  )}
                </div>
              ))}
            </HomeSection>
          )}

          {/* 6. Chaînes */}
          {allChannelsPreview.length > 0 && (
            <HomeSection title="Chaînes TV" viewMoreLabel="Voir toutes les chaînes" viewMoreHref="/programme-tv/chaines" onNavigate={onNavigate}>
              {allChannelsPreview.map(channel => (
                <div 
                  key={channel.id} 
                  className="w-32 sm:w-auto shrink-0 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                  onClick={() => onNavigate(`/programme-tv/chaines/${channel.slug}`)}
                >
                  <div className="w-12 h-12 flex flex-col items-center justify-center">
                    {channel.logoUrl ? (
                      <img src={channel.logoUrl} alt={channel.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ChannelBadge channel={channel} size="lg" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-700 text-center">{channel.name}</span>
                </div>
              ))}
            </HomeSection>
          )}

          {/* 7. Films */}
          {films.length > 0 && (
            <HomeSection title="Films à la TV" viewMoreLabel="Voir tous les films" viewMoreHref="/films" onNavigate={onNavigate}>
              {films.map(program => (
                <div key={program.id} className="w-64 sm:w-auto shrink-0">
                  <ProgramCard program={program} channel={getChannel(program.channelId)} onClick={() => onSelectProgram(program)} />
                </div>
              ))}
            </HomeSection>
          )}

          {/* 8. Sport */}
          {sports.length > 0 && (
            <HomeSection title="Sport" viewMoreLabel="Voir tout le sport" viewMoreHref="/sport" onNavigate={onNavigate}>
              {sports.map(program => (
                <div key={program.id} className="w-64 sm:w-auto shrink-0">
                  <ProgramCard program={program} channel={getChannel(program.channelId)} onClick={() => onSelectProgram(program)} />
                </div>
              ))}
            </HomeSection>
          )}
        </div>

        {/* Right Column: Clean Minimalism Sidebar (Commercial IPTV & Support) */}
        <div className="space-y-6">
          {/* VIP Box */}
          <div className="bg-slate-900 rounded-3xl p-7 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-500 text-slate-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-tighter">
                  Offre Recommandée
                </span>
                <span className="text-xs text-slate-400">Sans engagement</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-serif font-bold mt-4 leading-tight">
                Abonnement IPTV Premium
              </h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Accédez à plus de 10 000 chaînes en direct et VOD en qualité 4K / FHD avec guide EPG complet.
              </p>
              
              <div className="my-6 p-4 bg-white/10 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-300 font-medium">Formule 12 Mois VIP</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-bold text-white">36,99 €</span>
                    <span className="text-slate-400 text-xs">/ 12 mois</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-4/5 rounded-full" />
                </div>
                <span className="text-[10px] text-emerald-400 font-medium block">
                  Économisez 45% par rapport à l&apos;offre mensuelle
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>+10 000 chaînes HD & 4K</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Guide des programmes (EPG) inclus</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Replay (Catch-up) 7 jours</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Compatible Smart TV, Box & Mobile</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 relative z-10">
              <button
                onClick={() => onNavigate('/commander?plan=12-mois')}
                className="w-full bg-emerald-500 text-slate-900 font-black py-3 rounded-xl text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/20 cursor-pointer"
              >
                Commander maintenant
              </button>
              <button
                onClick={() => onNavigate('/iptv')}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors cursor-pointer block py-1"
              >
                Voir toutes les formules &rarr;
              </button>
              <p className="text-[10px] text-center text-slate-400">
                Activation immédiate après validation • Support 7j/7
              </p>
            </div>
          </div>

          {/* Quick Support & WhatsApp Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
              <span>Aide & Support</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Une question sur votre installation IPTV ou besoin d&apos;un conseil de configuration ? Nos conseillers vous répondent directement sur WhatsApp.
            </p>
            <a
              href="https://wa.me/33612345678?text=Bonjour,%20j'aimerais%20des%20informations%20sur%20les%20abonnements%20IPTV"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 bg-emerald-50 text-emerald-800 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-100"
            >
              <div className="w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                W
              </div>
              <div>
                <span className="text-xs font-bold block text-emerald-950">Support Client Dédié</span>
                <span className="text-[10px] text-emerald-700 block">En ligne 7j/7 sur WhatsApp</span>
              </div>
            </a>
          </div>
          
          {/* Clean Legal & Disclaimer Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-500 space-y-2">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
              Avertissement Légal
            </span>
            <p className="text-[11px] leading-relaxed">
              <strong>cesoir.live</strong> est un guide des programmes télévisés indépendant. Les offres techniques d&apos;accès au flux sont soumises aux conditions d&apos;utilisation des fournisseurs et aux droits audiovisuels locaux.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
INNEREOF
sh update_homepage.sh