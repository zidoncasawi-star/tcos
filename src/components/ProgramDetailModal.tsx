import React, { useState } from 'react';
import { Program, Channel } from '../types';
import { ChannelBadge } from './ChannelBadge';
import { slugifyTitle } from '../pages/MovieDetailPage';
import { X, Clock, Calendar, ShieldAlert, Film, User, Tag, Play, Star, ExternalLink } from 'lucide-react';

interface Props {
  program: Program | null;
  channel?: Channel;
  onClose: () => void;
  onNavigateChannel?: (slug: string) => void;
  onNavigateMovie?: (slug: string) => void;
}

export const ProgramDetailModal: React.FC<Props> = ({
  program,
  channel,
  onClose,
  onNavigateChannel,
  onNavigateMovie
}) => {
  const [showTrailer, setShowTrailer] = useState(false);

  if (!program) return null;

  const isMovie = program.category === 'film' || Boolean(program.tmdb_id);
  const movieSlug = slugifyTitle(program.title);
  const hasTmdb = Boolean(program.tmdb_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image / Poster Banner */}
        <div className="relative h-56 sm:h-64 bg-slate-900 shrink-0">
          <img
            src={program.tmdb_backdrop_path || program.imageUrl}
            alt={program.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {channel && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateChannel?.(channel.slug);
                  }}
                  className="hover:opacity-90"
                >
                  <ChannelBadge channel={channel} size="sm" />
                </button>
              )}
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/20 backdrop-blur-xs">
                {program.genre}
              </span>
              {program.year && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800/80 backdrop-blur-xs">
                  {program.year}
                </span>
              )}
              {program.tmdb_vote_average && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500/90 text-slate-950">
                  <Star className="w-3 h-3 fill-slate-950" />
                  {program.tmdb_vote_average} / 10
                </span>
              )}
              {program.rating && program.rating !== 'Tous publics' && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/80">
                  {program.rating}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-serif">
              {program.title}
            </h2>
            {program.subtitle && (
              <p className="text-sm text-slate-300 font-medium">{program.subtitle}</p>
            )}
            {program.tmdb_title && program.tmdb_title.toLowerCase() !== program.title.toLowerCase() && (
              <p className="text-xs text-slate-300/90 font-normal mt-0.5">
                Titre référencé TMDB : <span className="font-semibold text-white">{program.tmdb_title}</span>
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
          {/* Timing & Broadcast Bar (EPG Source of Truth) */}
          <div className="flex items-center justify-between flex-wrap gap-2 py-2.5 px-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>{program.startTime} - {program.endTime}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="text-slate-600">
                Durée : <strong>{program.durationMinutes} min</strong>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{program.dateStr}</span>
            </div>
          </div>

          {/* Trailer CTA Button if available */}
          {program.tmdb_trailer_key && !showTrailer && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-900">
                <Film className="w-4 h-4 text-red-600" />
                <span>Bande-annonce disponible</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTrailer(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Voir la bande-annonce
              </button>
            </div>
          )}

          {/* Embedded Trailer Player */}
          {showTrailer && program.tmdb_trailer_key && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                  Bande-annonce officielle
                </span>
                <button
                  type="button"
                  onClick={() => setShowTrailer(false)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium underline"
                >
                  Masquer la vidéo
                </button>
              </div>
              <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-black shadow-md">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${program.tmdb_trailer_key}?autoplay=1`}
                  title={`${program.title} Bande-annonce`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* TMDB Genres Pills */}
          {program.tmdb_genres && program.tmdb_genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {program.tmdb_genres.map((g, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-medium">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">
              Synopsis & Résumé
            </h3>
            <p className="leading-relaxed text-slate-700 text-sm sm:text-base">
              {program.synopsis}
            </p>
          </div>

          {/* Cast & Crew */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs sm:text-sm">
            {program.director && (
              <div>
                <span className="text-slate-400 block text-xs">Réalisateur :</span>
                <span className="font-semibold text-slate-800">{program.director}</span>
              </div>
            )}
            {program.presenter && (
              <div>
                <span className="text-slate-400 block text-xs">Présentation :</span>
                <span className="font-semibold text-slate-800">{program.presenter}</span>
              </div>
            )}
            {program.actors && program.actors.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-xs mb-1">Distribution :</span>
                <div className="flex flex-wrap gap-1.5">
                  {program.actors.map((actor, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium text-xs">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {program.year && (
              <div>
                <span className="text-slate-400 block text-xs">Année de production :</span>
                <span className="font-semibold text-slate-800">{program.year}</span>
              </div>
            )}
            {program.country && (
              <div>
                <span className="text-slate-400 block text-xs">Pays :</span>
                <span className="font-semibold text-slate-800">{program.country}</span>
              </div>
            )}
          </div>

          {/* Attribution Notice */}
          {hasTmdb && (
            <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100">
              Données et visuels complémentaires fournis par TMDB. Ce produit utilise l&apos;API TMDB mais n&apos;est ni certifié ni approuvé par TMDB.
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {isMovie && onNavigateMovie && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateMovie(movieSlug);
                }}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                Fiche complète du film &rarr;
              </button>
            )}
            {channel && !isMovie && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateChannel?.(channel.slug);
                }}
                className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Grille de {channel?.name} &rarr;
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
