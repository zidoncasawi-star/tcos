import React from 'react';
import { Channel, Program } from '../types';
import { ChannelBadge } from '../components/ChannelBadge';
import { ProgramCard } from '../components/ProgramCard';
import { DateSelector } from '../components/DateSelector';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { ExternalLink, Tv, Radio } from 'lucide-react';
import { ProgramCardSkeleton } from '../components/ProgramCardSkeleton';

interface Props {
  channelSlug: string;
  channels: Channel[];
  programs: Program[];
  selectedDateOffset: number;
  onDateChange: (offset: number) => void;
  onNavigate: (path: string) => void;
  onSelectProgram: (program: Program) => void;
  isEpgLoading?: boolean;
  isEpgError?: boolean;
}

export const ChannelDetailPage: React.FC<Props> = ({
  channelSlug,
  channels,
  programs,
  selectedDateOffset,
  onDateChange,
  onNavigate,
  onSelectProgram,
  isEpgLoading = false,
  isEpgError = false
}) => {
  // If slug is 'chaines' or empty, show all channels directory
  if (!channelSlug || channelSlug === 'chaines') {
    return (
      <div className="space-y-8 pb-16">
        <Breadcrumbs
          items={[
            { label: 'Programme TV', path: '/programme-tv' },
            { label: 'Toutes les Chaînes', path: '/programme-tv/chaines' }
          ]}
          onNavigate={onNavigate}
        />

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            Annuaire de toutes les chaînes de télévision françaises
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Accédez à la programmation détaillée heure par heure de chaque chaîne nationale de la TNT et du câble : TF1, France 2, France 3, Canal+, France 5, M6, Arte, W9, TMC et plus encore.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map(ch => {
            const chPrograms = programs.filter(p => p.channelId === ch.id && p.dateOffset === selectedDateOffset);
            const prime = chPrograms.find(p => p.isPrimeTime || p.startTime >= '20:00');
            return (
              <div
                key={ch.id}
                onClick={() => onNavigate(`/programme-tv/chaines/${ch.slug}`)}
                className="group bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <ChannelBadge channel={ch} size="md" />
                    <span className="text-xs font-bold text-slate-400">
                      Canal {ch.number}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors mb-1">
                    {ch.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {ch.description}
                  </p>
                </div>

                {prime && (
                  <div className="pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Ce soir à 21:10 :
                    </span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {prime.title}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Find target channel
  const channel = channels.find(c => c.slug === channelSlug || c.id === channelSlug);

  if (!channel) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Chaîne non trouvée</h2>
        <p className="text-sm text-slate-600">La chaîne demandée n&apos;existe pas ou a été déplacée.</p>
        <button
          onClick={() => onNavigate('/programme-tv/chaines')}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs"
        >
          Voir toutes les chaînes
        </button>
      </div>
    );
  }

  // Filter channel's programs for day
  const channelDayPrograms = programs
    .filter(p => p.channelId === channel.id && p.dateOffset === selectedDateOffset)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-8 pb-16">
      <SeoJsonLd
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': 'https://programmetv.site' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Chaînes', 'item': 'https://programmetv.site/programme-tv/chaines' },
            { '@type': 'ListItem', 'position': 3, 'name': channel.name, 'item': `https://programmetv.site/programme-tv/chaines/${channel.slug}` }
          ]
        }}
      />

      <Breadcrumbs
        items={[
          { label: 'Programme TV', path: '/programme-tv' },
          { label: 'Chaînes', path: '/programme-tv/chaines' },
          { label: channel.name, path: `/programme-tv/chaines/${channel.slug}` }
        ]}
        onNavigate={onNavigate}
      />

      {/* Channel Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shrink-0"
            style={{ backgroundColor: channel.badgeColor }}
          >
            {channel.logo}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                Canal TNT n°{channel.number}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700">
                {channel.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
              Programme {channel.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              {channel.description}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
          <DateSelector
            selectedOffset={selectedDateOffset}
            onChange={onDateChange}
          />
          {channel.websiteUrl && (
            <a
              href={channel.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              <span>Site officiel {channel.name}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Daily Schedule List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-slate-900">
          Grille des diffusions ({channelDayPrograms.length} programmes)
        </h2>

        {isEpgLoading && channelDayPrograms.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <ProgramCardSkeleton variant="compact" count={8} />
          </div>
        ) : channelDayPrograms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 space-y-2">
            <Tv className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">Aucun programme pour cette journée</p>
            <p className="text-xs text-slate-500">Sélectionnez une autre date ci-dessus pour afficher la grille horaire.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {channelDayPrograms.map(prg => (
              <ProgramCard
                key={prg.id}
                program={prg}
                channel={channel}
                onSelectProgram={onSelectProgram}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
