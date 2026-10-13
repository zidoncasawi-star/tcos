import React, { useState, useEffect } from 'react';
import { Channel, Program } from '../types';
import { ChannelBadge } from '../components/ChannelBadge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { Clock, Calendar, Film, Star, Play, X, ShieldAlert, ArrowLeft, Tv, Info, User, Tag } from 'lucide-react';

interface Props {
  slug: string;
  channels: Channel[];
  programs: Program[];
  onNavigate: (path: string) => void;
  onSelectProgram?: (program: Program) => void;
}

// Slug generator helper
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const MovieDetailPage: React.FC<Props> = ({
  slug,
  channels,
  programs,
  onNavigate,
  onSelectProgram
}) => {
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [localProgram, setLocalProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Find movie by slug in existing programs or fetch from API
  useEffect(() => {
    // Match by slugified title or program id
    const found = programs.find(p => {
      const pSlug = slugifyTitle(p.title);
      return pSlug === slug || p.id === slug || p.id === `prog-${slug}`;
    });

    if (found) {
      setLocalProgram(found);
    } else {
      // Fetch from API
      setIsLoading(true);
      fetch(`/api/programs/movie/${encodeURIComponent(slug)}`)
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (data && data.program) {
            setLocalProgram(data.program);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [slug, programs]);

  const program = localProgram;
  const channel = program ? channels.find(c => c.id === program.channelId) : undefined;

  // Update HTML document title and meta description dynamically
  useEffect(() => {
    if (program) {
      const channelName = channel ? channel.name : 'la TNT';
      const pageTitle = `${program.title} : programme TV et synopsis | ProgrammeTV`;
      const pageDesc = `Découvrez ${program.title} : synopsis, informations, durée et diffusion sur ${channelName} à ${program.startTime}.`;
      
      document.title = pageTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', pageDesc);
      }
    }
  }, [program, channel]);

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">Chargement de la fiche film & diffusion...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Film className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-serif">Film non trouvé</h1>
        <p className="text-slate-600 text-sm">
          Le film ou téléfilm demandé n&apos;est pas actuellement répertorié dans la grille des programmes.
        </p>
        <button
          onClick={() => onNavigate('/films')}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Voir tous les films ce soir
        </button>
      </div>
    );
  }

  const hasTmdb = Boolean(program.tmdb_id);
  const backdropUrl = program.tmdb_backdrop_path || program.imageUrl;
  const posterUrl = program.tmdb_poster_path || program.imageUrl;

  // Schema.org Structured Data
  const schemaOrgData: any = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Accueil',
          'item': 'https://programmetv.site/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Programme TV',
          'item': 'https://programmetv.site/programme-tv'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Films',
          'item': 'https://programmetv.site/films'
        },
        {
          '@type': 'ListItem',
          'position': 4,
          'name': program.title,
          'item': `https://programmetv.site/programme-tv/film/${slugifyTitle(program.title)}`
        }
      ]
    }
  ];

  if (hasTmdb) {
    schemaOrgData.push({
      '@context': 'https://schema.org',
      '@type': 'Movie',
      'name': program.tmdb_title || program.title,
      'alternateName': program.tmdb_original_title,
      'description': program.tmdb_overview || program.synopsis,
      'image': posterUrl,
      'datePublished': program.tmdb_release_date,
      'genre': program.tmdb_genres || [program.genre],
      ...(program.tmdb_vote_average ? {
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': program.tmdb_vote_average,
          'bestRating': 10,
          'worstRating': 1,
          'ratingCount': 10
        }
      } : {}),
      ...(program.director ? {
        'director': {
          '@type': 'Person',
          'name': program.director
        }
      } : {}),
      ...(program.actors && program.actors.length > 0 ? {
        'actor': program.actors.map(actor => ({
          '@type': 'Person',
          'name': actor
        }))
      } : {})
    });
  }

  return (
    <div className="space-y-8 pb-12">
      <SeoJsonLd schema={schemaOrgData} />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Accueil', path: '/' },
          { label: 'Programme TV', path: '/programme-tv' },
          { label: 'Films & Téléfilms', path: '/films' },
          { label: program.title }
        ]}
        onNavigate={onNavigate}
      />

      {/* Hero Movie Header Banner */}
      <div className="relative rounded-3xl bg-slate-950 text-white overflow-hidden shadow-xl border border-slate-800">
        {/* Backdrop Background Image */}
        {backdropUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={backdropUrl}
              alt={program.title}
              className="w-full h-full object-cover opacity-25 filter blur-xs scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
          </div>
        )}

        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
          {/* Movie Poster */}
          <div className="w-44 sm:w-56 md:w-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 aspect-2/3 mx-auto md:mx-0">
            <img
              src={posterUrl}
              alt={program.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Movie Details Column */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                {program.genre || 'Film / Téléfilm'}
              </span>
              {program.year && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {program.year}
                </span>
              )}
              {program.tmdb_vote_average && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {program.tmdb_vote_average} / 10
                </span>
              )}
              {program.rating && program.rating !== 'Tous publics' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-900/60 text-amber-200 border border-amber-700/50">
                  <ShieldAlert className="w-3 h-3" />
                  {program.rating}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-serif">
              {program.title}
            </h1>

            {program.tmdb_title && program.tmdb_title.toLowerCase() !== program.title.toLowerCase() && (
              <p className="text-sm text-slate-300">
                Titre référencé TMDB : <span className="font-semibold text-white">{program.tmdb_title}</span>
              </p>
            )}

            {program.tmdb_original_title && program.tmdb_original_title !== program.title && program.tmdb_original_title !== program.tmdb_title && (
              <p className="text-sm text-slate-400 italic">
                Titre original : <span className="text-slate-300">{program.tmdb_original_title}</span>
              </p>
            )}

            {/* Genres pills */}
            {program.tmdb_genres && program.tmdb_genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {program.tmdb_genres.map((g, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Trailer Action Button */}
            {program.tmdb_trailer_key && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowTrailerModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-900/40 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Voir la bande-annonce
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Broadcast Info EPG vs Film Info TMDB) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Synopsis & Movie Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Synopsis Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
              <Film className="w-5 h-5 text-blue-600" />
              Synopsis & Résumé
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {program.synopsis || program.tmdb_overview || 'Aucun résumé détaillé disponible pour ce programme.'}
            </p>
          </div>

          {/* Cast & Technical Info */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Informations & Équipe
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {program.director && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider mb-0.5">Réalisation</span>
                  <span className="text-slate-900 font-bold">{program.director}</span>
                </div>
              )}

              {program.year && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider mb-0.5">Année de sortie</span>
                  <span className="text-slate-900 font-bold">{program.year}</span>
                </div>
              )}

              {program.tmdb_runtime && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider mb-0.5">Durée du film</span>
                  <span className="text-slate-900 font-bold">{program.tmdb_runtime} minutes</span>
                </div>
              )}

              {program.country && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider mb-0.5">Nationalité</span>
                  <span className="text-slate-900 font-bold">{program.country}</span>
                </div>
              )}
            </div>

            {program.actors && program.actors.length > 0 && (
              <div className="pt-2">
                <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider mb-2">Distribution / Acteurs</span>
                <div className="flex flex-wrap gap-2">
                  {program.actors.map((actor, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 rounded-lg text-slate-800 text-xs font-medium">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attribution TMDB Notice */}
            {hasTmdb && (
              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2">
                <span>Informations cinématographiques enrichies via TMDB. Ce service utilise l&apos;API TMDB mais n&apos;est ni certifié ni approuvé par TMDB.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: TV Broadcast Info (EPG Source of Truth) */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-blue-800 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-blue-800/80">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-300">Diffusion Télévisée (EPG)</span>
              <Tv className="w-5 h-5 text-blue-300" />
            </div>

            {channel && (
              <div className="flex items-center gap-3">
                <ChannelBadge channel={channel} size="md" />
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{channel.name}</h3>
                  <p className="text-xs text-blue-200">Canal N°{channel.number} TNT</p>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2 text-sm">
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                <Clock className="w-5 h-5 text-blue-300 shrink-0" />
                <div>
                  <span className="text-xs text-blue-200 block">Horaires de diffusion</span>
                  <span className="font-extrabold text-base text-white">
                    {program.startTime} - {program.endTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                <Calendar className="w-5 h-5 text-blue-300 shrink-0" />
                <div>
                  <span className="text-xs text-blue-200 block">Date de diffusion</span>
                  <span className="font-bold text-white">
                    {program.dateStr}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl text-xs text-blue-200">
                Durée du créneau d&apos;antenne : <strong className="text-white">{program.durationMinutes} min</strong>
              </div>
            </div>

            {channel && (
              <button
                onClick={() => onNavigate(`/programme-tv/chaines/${channel.slug}`)}
                className="w-full py-2.5 px-4 bg-white text-blue-950 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors text-center cursor-pointer shadow-sm"
              >
                Voir toute la grille de {channel.name} &rarr;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && program.tmdb_trailer_key && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-red-500 fill-red-500" />
                <h3 className="text-sm font-bold">{program.title} - Bande-annonce officielle</h3>
              </div>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-16/9 w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${program.tmdb_trailer_key}?autoplay=1`}
                title={`${program.title} Bande-annonce`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
