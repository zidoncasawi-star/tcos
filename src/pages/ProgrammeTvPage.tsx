import React, { useState } from 'react';
import { Channel, Program, ProgramCategory } from '../types';
import { ProgramCard } from '../components/ProgramCard';
import { DateSelector } from '../components/DateSelector';
import { ChannelBadge } from '../components/ChannelBadge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { Filter, Tv, Clock, Film, Trophy, Sparkles, Radio } from 'lucide-react';
import { ProgramCardSkeleton } from '../components/ProgramCardSkeleton';

interface Props {
  subview?: 'all' | 'ce-soir' | 'maintenant' | 'tnt' | 'films' | 'sport';
  channels: Channel[];
  programs: Program[];
  selectedDateOffset: number;
  onDateChange: (offset: number) => void;
  onNavigate: (path: string) => void;
  onSelectProgram: (program: Program) => void;
  isEpgLoading?: boolean;
  isEpgError?: boolean;
}

export const ProgrammeTvPage: React.FC<Props> = ({
  subview = 'all',
  channels,
  programs,
  selectedDateOffset,
  onDateChange,
  onNavigate,
  onSelectProgram,
  isEpgLoading = false,
  isEpgError = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    subview === 'films' ? 'film' : subview === 'sport' ? 'sport' : 'all'
  );
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [timeSlot, setTimeSlot] = useState<string>(
    subview === 'ce-soir' ? 'soiree' : subview === 'maintenant' ? 'maintenant' : 'all'
  );

  // Synchronize state when subview changes via navigation
  React.useEffect(() => {
    if (subview === 'films') {
      setSelectedCategory('film');
    } else if (subview === 'sport') {
      setSelectedCategory('sport');
    } else {
      setSelectedCategory('all');
    }

    if (subview === 'ce-soir') {
      setTimeSlot('soiree');
    } else if (subview === 'maintenant') {
      setTimeSlot('maintenant');
    } else {
      setTimeSlot('all');
    }
  }, [subview]);

  // Filter programs (resilient to pre-filtered API responses)
  let list = programs.length > 0 && programs.some(p => p.dateOffset === selectedDateOffset)
    ? programs.filter(p => p.dateOffset === selectedDateOffset)
    : [...programs];

  // TNT filter
  if (subview === 'tnt') {
    const tntIds = channels.filter(c => c.isTnt).map(c => c.id);
    list = list.filter(p => tntIds.includes(p.channelId));
  }

  // Channel filter
  if (selectedChannelId !== 'all') {
    list = list.filter(p => p.channelId === selectedChannelId);
  }

  // Category filter
  if (selectedCategory !== 'all') {
    list = list.filter(p => p.category === selectedCategory);
  }

  // Time slot filter
  if (timeSlot === 'soiree' || subview === 'ce-soir') {
    list = list.filter(p => p.isPrimeTime || p.startTime >= '20:00');
  } else if (timeSlot === 'maintenant' || subview === 'maintenant') {
    const now = new Date();
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();
    list = list.filter(p => {
      const [sh, sm] = p.startTime.split(':').map(Number);
      const [eh, em] = p.endTime.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh < sh ? (eh + 24) * 60 + em : eh * 60 + em;
      return currentTotalMin >= startMin && currentTotalMin <= endMin;
    });
  } else if (timeSlot === 'matin') {
    list = list.filter(p => p.startTime < '12:00');
  } else if (timeSlot === 'aprem') {
    list = list.filter(p => p.startTime >= '12:00' && p.startTime < '20:00');
  }

  // Sort chronologically by channel number and startTime
  list.sort((a, b) => {
    const chA = channels.find(c => c.id === a.channelId)?.number || 99;
    const chB = channels.find(c => c.id === b.channelId)?.number || 99;
    if (chA !== chB) return chA - chB;
    return a.startTime.localeCompare(b.startTime);
  });

  const getChannel = (channelId: string) => channels.find(c => c.id === channelId);

  // Dynamic titles and breadcrumbs according to subview
  const getPageMeta = () => {
    switch (subview) {
      case 'ce-soir':
        return {
          title: 'TV ce soir : Programme TV du soir et Programme Télé | TNT',
          h1: 'TV ce soir : Votre Programme Télé Complet',
          desc: 'Retrouvez tout votre programme tv pour la tv ce soir. Consultez la grille complète de votre programme télé en première partie de soirée (21h10) sur toutes les chaînes de la TNT.',
          breadcrumbLabel: 'Ce soir'
        };
      case 'maintenant':
        return {
          title: 'TV en direct maintenant : Programme TV et télé en ce moment',
          h1: 'Programme TV en ce moment à la télé',
          desc: 'Découvrez ce qui est diffusé en ce moment même sur TF1, France 2, M6, Arte et l\'ensemble des chaînes pour votre tv ce soir.',
          breadcrumbLabel: 'En ce moment'
        };
      case 'tnt':
        return {
          title: 'Programme TNT : Votre TV ce soir sur les 27 chaînes de la TNT',
          h1: 'Programme Télé des 27 chaînes de la TNT',
          desc: 'Grille horaire officielle pour le programme tv des chaînes gratuites de la TNT métropolitaine, pour savoir quoi regarder à la tv ce soir.',
          breadcrumbLabel: 'TNT'
        };
      case 'toutes-les-chaines':
        return {
          title: 'Programme TV et TV ce soir de toutes les chaînes françaises',
          h1: 'Programme TV de toutes les chaînes',
          desc: 'Grille complète de diffusion pour l\'ensemble des chaînes de télévision françaises métropolitaines, idéal pour votre tv ce soir.',
          breadcrumbLabel: 'Toutes les chaînes'
        };
      case 'films':
      case 'films-ce-soir':
        return {
          title: 'Films à la tv ce soir : votre programme télé cinéma',
          h1: 'Films à voir à la tv ce soir',
          desc: 'Tous les longs-métrages diffusés à la tv ce soir sur le bouquet télévisé français. Votre programme tv cinéma complet.',
          breadcrumbLabel: 'Films ce soir'
        };
      case 'sport':
      case 'sport-ce-soir':
        return {
          title: 'Sport à la tv ce soir : programme tv direct football, rugby',
          h1: 'Programme Télé Sport à la tv ce soir',
          desc: 'Retransmissions sportives pour votre programme tv, matchs de football, pour ne rien rater à la tv ce soir.',
          breadcrumbLabel: 'Sport'
        };
      default:
        return {
          title: 'TV ce soir : Programme TV complet et Programme Télé français',
          h1: 'TV ce soir : Votre Programme TV Complet',
          desc: 'Horaires, résumés et sélections de l\'ensemble des programmes diffusés pour votre tv ce soir. Le meilleur du programme télé.',
          breadcrumbLabel: 'Grille TV'
        };
    }
  };

  const meta = getPageMeta();
  const isEpgUnavailable = programs.length === 0;

  return (
    <div className="space-y-8 pb-16">
      <SeoJsonLd
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': 'https://programmetv.site' },
            { '@type': 'ListItem', 'position': 2, 'name': meta.breadcrumbLabel, 'item': `https://programmetv.site/programme-tv/${subview}` }
          ]
        }}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Programme TV', path: '/programme-tv' },
          ...(subview !== 'all' ? [{ label: meta.breadcrumbLabel, path: `/programme-tv/${subview}` }] : [])
        ]}
        onNavigate={onNavigate}
      />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
              {meta.h1}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {meta.desc}
            </p>
          </div>

          {!isEpgUnavailable && (
            <DateSelector
              selectedOffset={selectedDateOffset}
              onChange={onDateChange}
            />
          )}
        </div>

        {/* Quick View Subview Tabs */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: 'Toutes les chaînes', path: '/programme-tv/toutes-les-chaines' },
            { id: 'ce-soir', label: 'Ce soir (21h10)', path: '/programme-tv/ce-soir' },
            { id: 'maintenant', label: 'En direct maintenant', path: '/programme-tv/maintenant' },
            { id: 'tnt', label: 'Chaînes TNT', path: '/programme-tv/tnt' },
            { id: 'films', label: 'Films ce soir', path: '/programme-tv/films-ce-soir' },
            { id: 'sport', label: 'Sport ce soir', path: '/programme-tv/sport-ce-soir' }
          ].map(tab => {
            const isActive = subview === tab.id ||
              (tab.id === 'all' && (subview === 'all' || subview === 'toutes-les-chaines')) ||
              (tab.id === 'films' && subview === 'films-ce-soir') ||
              (tab.id === 'sport' && subview === 'sport-ce-soir');
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.path)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Time slot & channel filters (active only if EPG data is available) */}
        {!isEpgUnavailable && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {[
                { id: 'all', label: 'Toute la journée' },
                { id: 'matin', label: 'Matin' },
                { id: 'aprem', label: 'Après-midi' },
                { id: 'soiree', label: 'Soirée (21h10)' },
                { id: 'maintenant', label: 'En ce moment' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTimeSlot(tab.id)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    timeSlot === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium hidden sm:inline">Chaîne :</span>
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Toutes les chaînes ({channels.length})</option>
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    Canal {ch.number} — {ch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isEpgUnavailable ? (
        /* Honest, Google-compliant message when no EPG is configured */
        <div className="space-y-8">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
              <Tv className="w-6 h-6" />
            </div>
            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                Les programmes TV sont temporairement indisponibles.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Le flux officiel de synchronisation du guide des programmes (XMLTV) est en attente d&apos;actualisation. Afin de préserver l&apos;exactitude des horaires et la conformité des données pour nos visiteurs et les moteurs de recherche, aucun horaire fictif n&apos;est généré.
              </p>
              <p className="text-xs text-slate-500">
                Vous pouvez néanmoins consulter ci-dessous la liste officielle des 27 chaînes de la TNT métropolitaine et leurs fiches détaillées.
              </p>
            </div>
          </div>

          {/* Genuine TNT Channels Directory */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif">
              Les 27 chaînes de la TNT métropolitaine
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {channels.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => onNavigate(`/programme-tv/chaines/${ch.slug}`)}
                  className="bg-white border border-slate-200/80 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <ChannelBadge channel={ch} size="md" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {ch.name}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {ch.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Results Count & Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Affichage de <strong>{list.length}</strong> programme{list.length > 1 ? 's' : ''}
            </span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {isEpgLoading && list.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <ProgramCardSkeleton variant="compact" count={8} />
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <Tv className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">Aucun programme trouvé avec ces filtres</p>
              <p className="text-xs text-slate-500">Essayez de modifier la date ou de réinitialiser le filtre horaire.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedChannelId('all');
                  setTimeSlot('all');
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Voir tous les programmes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {list.map(prg => (
                <ProgramCard
                  key={prg.id}
                  program={prg}
                  channel={getChannel(prg.channelId)}
                  onSelectChannel={(slug) => onNavigate(`/programme-tv/chaines/${slug}`)}
                  onSelectProgram={onSelectProgram}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Semantic Editorial Content targeting natural French search patterns (pg tv ce soir, prg tv, etc.) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-slate-700 text-sm leading-relaxed shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
          Comment consulter et choisir votre programme TV ce soir ?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800">
              Guide pratique pour la soirée (Prime-Time à 21h10)
            </h3>
            <p>
              Que vous recherchiez sur votre smartphone les requêtes courantes comme <em>&quot;pg tv ce soir&quot;</em>, <em>&quot;pgm tv ce soir&quot;</em>, <em>&quot;prg tv ce soir&quot;</em>, <em>&quot;télé ce soir&quot;</em> ou simplement <em>&quot;tv ce soir&quot;</em>, notre guide répertorie avec clarté les premières parties de soirée débutant entre 21h05 et 21h15 sur les chaînes de la TNT métropolitaine et du câble.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800">
              Sélection par genre : Films, Séries, Sport et Documentaires
            </h3>
            <p>
              Accédez directement aux sélections thématiques : grands films du soir, retransmissions sportives en direct, magazines d&apos;information et documentaires culturels. Consultez la fiche détaillée de chaque émission pour découvrir le résumé complet, le casting d&apos;acteurs et la classification CSA.
            </p>
          </div>
        </div>
      </section>

      {/* Discrete, intelligent contextual CTA to IPTV section (subtle, NOT like an aggressive sales page) */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1 max-w-2xl">
          <span className="font-bold text-slate-800 text-sm block">
            Vous regardez la télévision sur Smart TV ou boîtier connecté ?
          </span>
          <p className="text-slate-500 leading-relaxed">
            Consultez nos tutoriels de configuration (Smart TV, Smarters Pro, TiviMate) et découvrez nos formules d&apos;accès fluide avec guide EPG synchronisé.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/iptv')}
          className="shrink-0 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
        >
          Découvrir l&apos;espace IPTV &rarr;
        </button>
      </section>
    </div>
  );
};
