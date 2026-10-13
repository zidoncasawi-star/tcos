import { Program } from '../types';

/**
 * Enhanced Server-Side TMDB Enrichment Service
 * 
 * 3-TIER MATCHING SYSTEM FOR FILMS, TÉLÉFILMS, AND TV SERIES:
 * 
 * NIVEAU 1 : Recherche exacte
 * - Query TMDB search/movie ou search/tv avec titre complet et année optionnelle.
 * 
 * NIVEAU 2 : Recherche normalisée + Titres alternatifs TMDB
 * - Nettoyage des balises, badges de diffusion ([INÉDIT], (HD)), préfixes de chaînes (TF1 - ...),
 *   et sous-titres/épisodes (Capitaine Marleau : L'arbre aux esclaves -> Capitaine Marleau).
 * - Comparaison avec title, original_title, et alternative_titles TMDB.
 * - Gestion intelligente des anthologies françaises (ex: collection TV "Meurtres à..." pour "Meurtres à Colmar", etc.).
 * 
 * NIVEAU 3 : Recherche par mots-clés + Lieu + Description sémantique + Année + Runtime
 * - Extraction des mots significatifs et toponymes (Saint-Affrique, Colmar, etc.).
 * - Recherche par lieu / mots clés (ex: "Crime à Saint-Affrique" -> trouve "Crime dans le Larzac" grâce à la commune de Saint-Affrique dans le synopsis).
 * - Multi-factor scoring (titre alternatif +0.35, mot clé/lieu +0.40, synopsis +0.15, année +0.10, durée +0.05, seuil >= 0.65).
 * 
 * STRICT RULES:
 * - Le titre EPG reste la source de vérité pour l'affichage de diffusion dans la grille.
 * - TMDB fournit le poster, le backdrop, le synopsis, les genres, l'année, le trailer et la note.
 * - TMDB_API_KEY reste 100% côté serveur, jamais exposé.
 */

export interface TmdbEnrichmentData {
  tmdb_id: number;
  tmdb_media_type: 'movie' | 'tv';
  tmdb_title: string;
  tmdb_original_title?: string;
  tmdb_overview?: string;
  tmdb_poster_path?: string;
  tmdb_backdrop_path?: string;
  tmdb_release_date?: string;
  tmdb_year?: number;
  tmdb_genres?: string[];
  tmdb_runtime?: number;
  tmdb_vote_average?: number;
  tmdb_trailer_key?: string;
  tmdb_match_confidence: number;
  tmdb_match_method: 'exact' | 'normalized_alternative' | 'semantic_keyword' | 'anthology_collection';
}

type CacheStatus = 'FOUND' | 'NOT_FOUND' | 'ERROR';

interface CacheEntry {
  status: CacheStatus;
  data: TmdbEnrichmentData | null;
  expiresAt: number;
}

// In-memory server-side cache for TMDB results
const tmdbCache = new Map<string, CacheEntry>();
const POSITIVE_CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours for verified content
const NEGATIVE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;  // 6 hours for verified not-found
const ERROR_CACHE_TTL_MS = 60 * 1000;              // 1 minute retry window for network/API errors

// French Stop Words for Keyword Extraction
const FRENCH_STOP_WORDS = new Set([
  'a', 'au', 'aux', 'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'd', 'l',
  'dans', 'en', 'sur', 'sous', 'par', 'pour', 'avec', 'sans', 'chez', 'vers',
  'ce', 'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'notre', 'votre', 'leur',
  'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'que', 'qui', 'quoi', 'dont',
  'hd', 'fhd', '4k', 'uhd', 'vf', 'vo', 'vost', 'vostfr', 'inedit', 'inedite',
  'saison', 'season', 'episode', 'partie', 'part', 'livre', 'volume'
]);

// Concurrency limiter for outgoing TMDB API requests
class ConcurrencyLimiter {
  private activeCount = 0;
  private queue: Array<() => void> = [];

  constructor(private maxConcurrent: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.maxConcurrent) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    this.activeCount++;
    try {
      return await fn();
    } finally {
      this.activeCount--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next?.();
      }
    }
  }
}

const limiter = new ConcurrencyLimiter(6);

/**
 * Robust title normalization for EPG items
 */
export function normalizeTitle(rawTitle: string, mediaType: 'movie' | 'tv' = 'movie'): string {
  if (!rawTitle) return '';

  let title = rawTitle
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&eacute;/gi, 'é')
    .replace(/&egrave;/gi, 'è')
    .replace(/&ecirc;/gi, 'ê')
    .replace(/&agrave;/gi, 'à')
    .replace(/&icirc;/gi, 'î')
    .replace(/&ocirc;/gi, 'ô')
    .replace(/&ugrave;/gi, 'ù')
    .replace(/&ucirc;/gi, 'û')
    .replace(/&ccedil;/gi, 'ç')
    .replace(/&oelig;/gi, 'oe')
    .replace(/&aelig;/gi, 'ae')
    .trim();

  // Strip leading channel or broadcast indicators (e.g. "TF1 - ", "France 2 : ")
  title = title.replace(/^(TF1|FRANCE\s*\d|M6|ARTE|W9|TMC|TFX|C8|CNEWS|LCP|GULLI|RMC\s*[A-Z]+|CANAL\+?\s*[A-Z]*)\s*[:-]\s*/i, '');

  // Strip broadcast flags in brackets or parentheses e.g. [INÉDIT], (HD), (VF), [VOSTFR], (4K)
  title = title.replace(/\s*[\(\[](inédit|inedit|direct|rediffusion|replay|vf|vo|vost|vostfr|hd|fhd|4k|uhd|vm|téléfilm|telefilm|film|nouveau|inédite|inedite)[\)\]]/gi, '');
  title = title.replace(/\b(inédit|inedit|vostfr|vost|4k|fhd|uhd)\b/gi, '');

  // For series: strip trailing episode descriptions, season numbers
  if (mediaType === 'tv') {
    title = title.replace(/\s*[-:–]\s*(saison\s*\d+[\s,]*ép(isode)?\s*\d+|s\d+[\s.]*e\d+|ép(isode)?\s*\d+|partie\s*\d+|part\s*\d+|vol(ume)?\s*\d+|livre\s*[ivxldcm\d]+).*$/i, '');
    title = title.replace(/\s*[\(\[](saison\s*\d+[\s,]*ép(isode)?\s*\d+|s\d+[\s.]*e\d+|ép(isode)?\s*\d+|saison\s*\d+|season\s*\d+)[\)\]]/gi, '');
  }

  // Strip general episode numbers if any remain
  title = title.replace(/\s*[-:–]?\s*(s\d+[\s.]*e\d+|saison\s*\d+|season\s*\d+).*$/i, '');

  // Strip trailing duration indicator like "(1h40)", "(90 min)", "(105 mn)"
  title = title.replace(/\s*\(\s*\d+\s*(h\s*\d*|min|mn)\s*\)/gi, '');

  // Strip trailing year in parenthesis e.g. "(2024)", "(2025)"
  title = title.replace(/\s*\(\s*(19\d{2}|20\d{2})\s*\)/g, '');

  // Remove trailing colon or dash
  title = title.replace(/[\s\-:–]+$/, '');

  // Remove excess internal whitespace
  title = title.replace(/\s{2,}/g, ' ').trim();

  return title;
}

/**
 * Extract significant search queries, keywords, places, and compound nouns from title
 */
export function extractSignificantKeywords(title: string): string[] {
  const rawClean = title.trim();
  const results = new Set<string>();

  // 1. Extract hyphenated words (e.g. "Saint-Affrique", "Brides-les-Bains", "Aigues-Mortes")
  const hyphenMatches = rawClean.match(/[A-ZÀ-Ÿa-zà-ÿ0-9]+(-[A-ZÀ-Ÿa-zà-ÿ0-9]+)+/g);
  if (hyphenMatches) {
    hyphenMatches.forEach(m => results.add(m));
  }

  // 2. Extract words
  const words = rawClean.split(/[\s,–:;/'"-]+/);
  for (const w of words) {
    const wClean = w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    if (wClean.length >= 3 && !FRENCH_STOP_WORDS.has(wClean)) {
      results.add(w);
    }
  }

  // 3. Combined significant tokens (e.g. "Crime Saint-Affrique")
  const significantTokens = words
    .map(w => w.trim())
    .filter(w => {
      const c = w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return c.length >= 2 && !FRENCH_STOP_WORDS.has(c);
    });

  if (significantTokens.length >= 2 && significantTokens.length < words.length) {
    results.add(significantTokens.join(' '));
  }

  return Array.from(results);
}

/**
 * Extract candidate year from title if present
 */
export function extractYearFromTitle(title: string): number | undefined {
  const match = title.match(/\b(19\d{2}|20\d{2})\b/);
  if (match) {
    const y = parseInt(match[1], 10);
    if (y >= 1920 && y <= 2030) return y;
  }
  return undefined;
}

export interface EligibilityResult {
  eligible: boolean;
  mediaType: 'movie' | 'tv';
  normalizedTitle: string;
  year?: number;
  rawProgramContext?: {
    synopsis?: string;
    durationMinutes?: number;
  };
}

/**
 * Determine if a programme is eligible for TMDB enrichment
 */
export function isEligibleForTmdb(program: {
  category?: string;
  genre?: string;
  title?: string;
  subtitle?: string;
  durationMinutes?: number;
  channelId?: string;
  synopsis?: string;
  seasonEpisode?: string;
  year?: number;
}): EligibilityResult {
  const cat = (program.category || '').toLowerCase();
  const genre = (program.genre || '').toLowerCase();
  const title = (program.title || '').toLowerCase();
  const sub = (program.subtitle || '').toLowerCase();
  const syn = (program.synopsis || '').toLowerCase();
  const fullText = `${title} ${sub} ${genre} ${cat} ${syn}`;
  const duration = program.durationMinutes || 0;

  // 1. Strict skip for non-fiction (News, Sports, Weather, Talk shows, Reality TV, Games)
  const nonFictionRegex = /(journal\b|19\/20|20h\b|13h\b|12\/13|jt\b|météo|meteo|édition spéciale|matinale|c dans l'air|face à l'info|punchline|l'heure des pros|24h pujadas|soir 3|bourdin|les informés|journal de la nuit|flash info|quotidien|touche pas à mon poste|tpmp|c à vous|sept à huit|66 minutes|50 mn inside|turbo|tout le monde veut prendre sa place|les 12 coups de midi|questions pour un champion|n'oubliez pas les paroles|la chanson de l'année|the voice|koh-lanta|danse avec les stars|star academy|football|foot\b|ligue 1|ligue 2|champions league|rugby|top 14|roland-garros|formule 1|grand prix|basket|handball|cyclisme|tour de france|stade 2|telefoot|auto moto|moto gp|ufc\b|mma\b|boxe|athlétisme|téléachat|m6 boutique|euroshopping|programmes de nuit|nuit française|top france|top 50|tirage du loto|euromillions)/i;
  
  if (nonFictionRegex.test(title) || (nonFictionRegex.test(fullText) && !fullText.includes('film') && !fullText.includes('série') && !fullText.includes('serie'))) {
    return {
      eligible: false,
      mediaType: 'movie',
      normalizedTitle: normalizeTitle(program.title || '', 'movie')
    };
  }

  // 2. SERIES DETECTION
  const isExplicitSeriesCat = cat === 'serie';
  const hasSeriesKeyword = /(série|serie|feuilleton|mini[- ]série|fiction tv|série policière|série dramatique|série d'animation)/i.test(genre) || /(série|serie|feuilleton|saison\s*\d+|épisode\s*\d+|s\d+[\s.]*e\d+)/i.test(cat);
  const hasSeasonEpisodeInfo = Boolean(program.seasonEpisode) || /\b(s\d+[\s.]*e\d+|saison\s*\d+|season\s*\d+|épisode\s*\d+|episode\s*\d+)\b/i.test(fullText);
  
  // Known TV Series in French EPG
  const knownSeries = /(plus belle la vie|demain nous appartient|ici tout commence|un si grand soleil|scènes de ménages|en famille|ncis|les experts|candice renoir|capitaine marleau|hpi|balthazar|astrid et raphaëlle|profilage|section de recherches|petits secrets entre voisins|esprits criminels|new york unité spéciale|modern family|grey's anatomy|good doctor|bates motel|mentalist|kaamelott|the last of us|game of thrones|house of the dragon|fargo|true detective|stranger things|peaky blinders|clem|fais pas ci fais pas ça|le bureau des légendes|baron noir|engrenages|dix pour cent|lupin|tapie|heartstopper|succession|breaking bad|better call saul|vikings|the crown|sherlock|dexter|dr house|monk|columbo|hercule poirot|inspecteur barnaby|commissaire montalbano|cassandre|alex hugo|le voyageur|mongeville|tata gaby|polar park|zorro)/i;

  if (isExplicitSeriesCat || hasSeasonEpisodeInfo || (hasSeriesKeyword && !fullText.includes('film')) || knownSeries.test(title)) {
    const clean = normalizeTitle(program.title || '', 'tv');
    if (clean.length >= 2) {
      return {
        eligible: true,
        mediaType: 'tv',
        normalizedTitle: clean,
        year: program.year || extractYearFromTitle(program.title || ''),
        rawProgramContext: {
          synopsis: program.synopsis,
          durationMinutes: program.durationMinutes
        }
      };
    }
  }

  // 3. MOVIE / TÉLÉFILM DETECTION
  const isExplicitMovieCat = cat === 'film' || /^(film|movie|cin[ée]ma|t[ée]l[ée]film|long[- ]m[ée]trage)$/i.test(cat);
  const movieGenreRegex = /(film|téléfilm|telefilm|movie|long[- ]métrage|cinéma|cinema|tv movie|drame|comédie|thriller|action|science[- ]fiction|sf|western|horreur|policier|fantastique|aventure|romance|biopic|guerre|animation|court[- ]métrage)/i;
  const hasMovieKeyword = movieGenreRegex.test(genre) || movieGenreRegex.test(cat) || /(téléfilm|telefilm|long[- ]métrage|film d'|film de)/i.test(syn);
  
  const cinemaChannels = ['canal-plus', 'canal-plus-cinema', 'tf1-series-films', 'arte', 'cstar', '6ter', 'w9', 'tmc', 'tfx', 'cherie-25', 'paris-premiere', 'tf1', 'france-2', 'france-3', 'm6'];
  const isCinemaChannelLong = cinemaChannels.includes(program.channelId || '') && duration >= 70;

  if (isExplicitMovieCat || hasMovieKeyword || isCinemaChannelLong) {
    const clean = normalizeTitle(program.title || '', 'movie');
    if (clean.length >= 2) {
      return {
        eligible: true,
        mediaType: 'movie',
        normalizedTitle: clean,
        year: program.year || extractYearFromTitle(program.title || ''),
        rawProgramContext: {
          synopsis: program.synopsis,
          durationMinutes: program.durationMinutes
        }
      };
    }
  }

  return {
    eligible: false,
    mediaType: 'movie',
    normalizedTitle: normalizeTitle(program.title || '', 'movie')
  };
}

export function isMovieEligible(program: any): boolean {
  const result = isEligibleForTmdb(program);
  return result.eligible && result.mediaType === 'movie';
}

/**
 * Bigram & token similarity metric
 */
export function calculateTitleSimilarity(s1: string, s2: string): number {
  const clean1 = s1.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const clean2 = s2.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  if (clean1 === clean2) return 1.0;
  if (!clean1 || !clean2) return 0.0;

  // Exact prefix match
  if (clean2.startsWith(clean1 + ' ') || clean1.startsWith(clean2 + ' ')) {
    return 0.95;
  }

  // Substring match
  if (clean1.length >= 3 && clean2.length >= 3) {
    if (clean1.includes(clean2) || clean2.includes(clean1)) {
      const ratio = Math.min(clean1.length, clean2.length) / Math.max(clean1.length, clean2.length);
      return Math.max(0.85, ratio);
    }
  }

  // Token set matching
  const tokens1 = new Set(clean1.split(' ').filter(t => t.length > 1));
  const tokens2 = new Set(clean2.split(' ').filter(t => t.length > 1));
  if (tokens1.size > 0 && tokens2.size > 0) {
    let overlap = 0;
    for (const t of tokens1) {
      if (tokens2.has(t)) overlap++;
    }
    const tokenScore = (2 * overlap) / (tokens1.size + tokens2.size);
    if (tokenScore >= 0.8) return Math.max(0.88, tokenScore);
  }

  // Bigrams calculation
  const getBigrams = (str: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const b1 = getBigrams(clean1);
  const b2 = getBigrams(clean2);

  if (b1.size === 0 || b2.size === 0) return 0.0;

  let intersection = 0;
  for (const item of b1) {
    if (b2.has(item)) intersection++;
  }

  return (2 * intersection) / (b1.size + b2.size);
}

/**
 * Execute basic search on TMDB
 */
async function searchTmdbCandidates(
  mediaType: 'movie' | 'tv',
  query: string,
  year?: number,
  apiKey?: string,
  lang: 'fr-FR' | 'en-US' = 'fr-FR'
): Promise<{ results: any[]; status: 'OK' | 'ERROR' }> {
  const searchParams = new URLSearchParams({
    api_key: apiKey || '',
    query,
    language: lang,
    include_adult: 'false'
  });

  if (year && year >= 1900 && year <= 2030) {
    if (mediaType === 'movie') {
      searchParams.set('year', String(year));
    } else {
      searchParams.set('first_air_date_year', String(year));
    }
  }

  const endpoint = mediaType === 'movie' ? 'search/movie' : 'search/tv';
  const url = `https://api.themoviedb.org/3/${endpoint}?${searchParams.toString()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn('[TMDB Service] Clé API TMDB non autorisée ou expirée.');
      } else if (response.status === 429) {
        console.warn('[TMDB Service] Limite de requêtes TMDB atteinte.');
      }
      return { results: [], status: 'ERROR' };
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    return { results, status: 'OK' };
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name !== 'AbortError') {
      console.warn(`[TMDB Service] Erreur réseau TMDB (${mediaType}): ${err.message || err}`);
    }
    return { results: [], status: 'ERROR' };
  }
}

/**
 * Look up French anthology collections (e.g. "Meurtres à..." TV Series 66627)
 */
async function checkFrenchAnthologyCollection(
  title: string,
  apiKey: string
): Promise<TmdbEnrichmentData | null> {
  const norm = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. "Meurtres à..." / "Meurtres en..." collection
  if (norm.startsWith('meurtres a') || norm.startsWith('meurtres en')) {
    const location = norm.replace(/^meurtres (a|en)\s+/i, '').trim();
    if (location.length >= 3) {
      try {
        const seriesId = 66627; // "Meurtres à..." official TMDB TV series
        const rSeries = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}&language=fr-FR`);
        if (rSeries.ok) {
          const dSeries = await rSeries.json();
          for (const season of (dSeries.seasons || [])) {
            if (season.season_number === 0) continue;
            const rSeason = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/season/${season.season_number}?api_key=${apiKey}&language=fr-FR`);
            if (rSeason.ok) {
              const dSeason = await rSeason.json();
              for (const ep of (dSeason.episodes || [])) {
                const epNorm = (ep.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const epOverviewNorm = (ep.overview || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (epNorm.includes(location) || epOverviewNorm.includes(location)) {
                  console.log(`[TMDB] Title: "${title}" | Type: tv (Anthology) | Search: ACCEPTED | Candidate: "${ep.name}" (Show: ${dSeries.name}) | Score: 0.95`);
                  const dateStr = ep.air_date || dSeries.first_air_date;
                  const releaseYear = dateStr ? parseInt(dateStr.substring(0, 4), 10) : undefined;
                  const genresList = Array.isArray(dSeries.genres) ? dSeries.genres.map((g: any) => g.name).filter(Boolean) : ['Drame', 'Policier', 'Téléfilm'];

                  return {
                    tmdb_id: ep.id || dSeries.id,
                    tmdb_media_type: 'tv',
                    tmdb_title: ep.name || dSeries.name,
                    tmdb_original_title: ep.name !== title ? ep.name : undefined,
                    tmdb_overview: ep.overview || dSeries.overview || undefined,
                    tmdb_poster_path: dSeries.poster_path ? `https://image.tmdb.org/t/p/w500${dSeries.poster_path}` : (ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : undefined),
                    tmdb_backdrop_path: ep.still_path ? `https://image.tmdb.org/t/p/w1280${ep.still_path}` : (dSeries.backdrop_path ? `https://image.tmdb.org/t/p/w1280${dSeries.backdrop_path}` : undefined),
                    tmdb_release_date: dateStr || undefined,
                    tmdb_year: releaseYear,
                    tmdb_genres: genresList,
                    tmdb_runtime: typeof ep.runtime === 'number' && ep.runtime > 0 ? ep.runtime : 90,
                    tmdb_vote_average: typeof ep.vote_average === 'number' && ep.vote_average > 0 ? Math.round(ep.vote_average * 10) / 10 : (typeof dSeries.vote_average === 'number' ? Math.round(dSeries.vote_average * 10) / 10 : undefined),
                    tmdb_match_confidence: 0.95,
                    tmdb_match_method: 'anthology_collection'
                  };
                }
              }
            }
          }
        }
      } catch (err) {
        // Continue to other matching tiers
      }
    }
  }

  return null;
}

/**
 * Fetch detailed metadata including alternative titles, videos, and backdrop
 */
async function fetchFullDetails(
  candidateId: number,
  effectiveType: 'movie' | 'tv',
  apiKey: string
): Promise<any | null> {
  const endpoint = effectiveType === 'movie' ? `movie/${candidateId}` : `tv/${candidateId}`;
  const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&language=fr-FR&append_to_response=videos,images,alternative_titles`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Multi-Factor Candidate Evaluator
 * Combines Title exactness, Alternative Titles, Significant Keywords/Location, Semantic Overview, Year & Runtime
 */
function evaluateCandidate(
  query: string,
  candidate: any,
  effectiveType: 'movie' | 'tv',
  context?: {
    year?: number;
    synopsis?: string;
    durationMinutes?: number;
    details?: any;
  }
): { score: number; matchMethod: 'exact' | 'normalized_alternative' | 'semantic_keyword' } {
  const titleFr = (effectiveType === 'movie' ? candidate.title : candidate.name) || '';
  const titleOrig = (effectiveType === 'movie' ? candidate.original_title : candidate.original_name) || '';
  const overview = (candidate.overview || (context?.details?.overview) || '').toLowerCase();
  const epgSynopsis = (context?.synopsis || '').toLowerCase();

  let score = 0;
  let matchMethod: 'exact' | 'normalized_alternative' | 'semantic_keyword' = 'normalized_alternative';

  // 1. Direct Title & Original Title Match
  const scoreFr = calculateTitleSimilarity(query, titleFr);
  const scoreOrig = calculateTitleSimilarity(query, titleOrig);
  const titleSim = Math.max(scoreFr, scoreOrig);

  if (titleSim >= 0.90) {
    score += 0.50;
    matchMethod = 'exact';
  } else if (titleSim >= 0.70) {
    score += 0.35 * titleSim;
  }

  // 2. Alternative Titles Check (if details loaded)
  if (context?.details?.alternative_titles) {
    const altList = effectiveType === 'movie' 
      ? (context.details.alternative_titles.titles || [])
      : (context.details.alternative_titles.results || []);

    for (const alt of altList) {
      const altScore = calculateTitleSimilarity(query, alt.title || '');
      if (altScore >= 0.85) {
        score = Math.max(score, 0.35 + (altScore * 0.35));
        matchMethod = 'normalized_alternative';
        break;
      }
    }
  }

  // 3. Collection / Thematic Prefix Matching (e.g. "Crime à..." vs "Crime dans...", "Meurtres à..." vs "Meurtres en...")
  const queryFirstWord = query.trim().split(/[\s:–-]+/)[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const candFirstWord = titleFr.trim().split(/[\s:–-]+/)[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const commonThematicPrefix = ['crime', 'meurtres', 'mystere', 'mysteres', 'disparition', 'disparitions', 'menace', 'peril', 'pont', 'capitaine', 'inspecteur', 'commissaire'];
  const hasMatchingPrefix = commonThematicPrefix.includes(queryFirstWord) && queryFirstWord === candFirstWord;

  if (hasMatchingPrefix) {
    score += 0.35;
  }

  // 4. Significant Keywords & Location Overlap in Overview or Title
  const queryKeywords = extractSignificantKeywords(query);
  let keywordOverlapInTitle = false;
  let locationMentionedInOverview = false;

  for (const kw of queryKeywords) {
    const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (kwNorm.length < 3 || FRENCH_STOP_WORDS.has(kwNorm)) continue;

    const titleNorm = titleFr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const overviewNorm = overview.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (titleNorm.includes(kwNorm)) {
      keywordOverlapInTitle = true;
    }
    if (overviewNorm.includes(kwNorm)) {
      locationMentionedInOverview = true;
    }
  }

  if (keywordOverlapInTitle) {
    score += 0.25;
  }
  if (locationMentionedInOverview) {
    score += 0.40;
    matchMethod = 'semantic_keyword';
  }

  // 5. Semantic Synopsis Overlap
  if (epgSynopsis && overview && epgSynopsis.length > 20) {
    const epgWords = extractSignificantKeywords(epgSynopsis);
    let synMatchCount = 0;
    for (const w of epgWords.slice(0, 15)) {
      const wClean = w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (overview.includes(wClean)) synMatchCount++;
    }
    if (epgWords.length > 0) {
      const synRatio = Math.min(1.0, synMatchCount / Math.min(epgWords.length, 8));
      score += synRatio * 0.15;
    }
  }

  // 6. Year Evaluation
  const dateStr = effectiveType === 'movie' ? candidate.release_date : candidate.first_air_date;
  if (context?.year && dateStr) {
    const candYear = parseInt(dateStr.substring(0, 4), 10);
    if (candYear === context.year) {
      score += 0.10;
    } else if (Math.abs(candYear - context.year) <= 1) {
      score += 0.05;
    } else if (Math.abs(candYear - context.year) > 6) {
      score -= 0.15;
    }
  }

  // 7. Runtime Evaluation
  const candRuntime = context?.details?.runtime || (Array.isArray(context?.details?.episode_run_time) && context?.details?.episode_run_time[0]);
  if (context?.durationMinutes && candRuntime && typeof candRuntime === 'number') {
    const diff = Math.abs(context.durationMinutes - candRuntime);
    if (diff <= 15) {
      score += 0.05;
    } else if (diff > 45) {
      score -= 0.05;
    }
  }

  return {
    score: Math.min(1.0, Math.max(0.0, score)),
    matchMethod
  };
}

/**
 * 3-Tier Search Execution Engine
 */
async function perform3TierSearch(
  mediaType: 'movie' | 'tv',
  query: string,
  year?: number,
  apiKey?: string,
  context?: { synopsis?: string; durationMinutes?: number }
): Promise<{ candidate: any | null; effectiveType: 'movie' | 'tv'; confidence: number; matchMethod: 'exact' | 'normalized_alternative' | 'semantic_keyword' | 'anthology_collection' }> {
  const key = apiKey || process.env.TMDB_API_KEY || '';
  if (!key) {
    return { candidate: null, effectiveType: mediaType, confidence: 0, matchMethod: 'exact' };
  }

  // Check French Anthology Collection first (e.g. "Meurtres à Colmar" in "Meurtres à...")
  const anthologyMatch = await checkFrenchAnthologyCollection(query, key);
  if (anthologyMatch) {
    return {
      candidate: {
        id: anthologyMatch.tmdb_id,
        title: anthologyMatch.tmdb_title,
        name: anthologyMatch.tmdb_title,
        overview: anthologyMatch.tmdb_overview,
        poster_path: anthologyMatch.tmdb_poster_path?.replace('https://image.tmdb.org/t/p/w500', ''),
        backdrop_path: anthologyMatch.tmdb_backdrop_path?.replace('https://image.tmdb.org/t/p/w1280', ''),
        release_date: anthologyMatch.tmdb_release_date,
        first_air_date: anthologyMatch.tmdb_release_date,
        vote_average: anthologyMatch.tmdb_vote_average,
        _prefetched: anthologyMatch
      },
      effectiveType: 'tv',
      confidence: 0.95,
      matchMethod: 'anthology_collection'
    };
  }

  // --- TIER 1: Exact Search ---
  let tier1Res = await searchTmdbCandidates(mediaType, query, year, key, 'fr-FR');
  if (tier1Res.results.length > 0) {
    for (const cand of tier1Res.results.slice(0, 4)) {
      const evalRes = evaluateCandidate(query, cand, mediaType, { year, synopsis: context?.synopsis, durationMinutes: context?.durationMinutes });
      if (evalRes.score >= 0.75) {
        return { candidate: cand, effectiveType: mediaType, confidence: evalRes.score, matchMethod: evalRes.matchMethod };
      }
    }
  }

  // --- TIER 2: Normalized Search + Prefix / Subtitle Splitting + Cross-Media Fallback ---
  // Tier 2a: Search without year if year was provided
  if (year) {
    const noYearRes = await searchTmdbCandidates(mediaType, query, undefined, key, 'fr-FR');
    for (const cand of noYearRes.results.slice(0, 5)) {
      const evalRes = evaluateCandidate(query, cand, mediaType, { year, synopsis: context?.synopsis, durationMinutes: context?.durationMinutes });
      if (evalRes.score >= 0.70) {
        return { candidate: cand, effectiveType: mediaType, confidence: evalRes.score, matchMethod: 'normalized_alternative' };
      }
    }
  }

  // Tier 2b: Prefix splitting (e.g. "Capitaine Marleau : L'arbre aux esclaves" -> "Capitaine Marleau")
  const colonParts = query.split(/[:–-]/);
  if (colonParts.length > 1 && colonParts[0].trim().length >= 3) {
    const basePrefix = colonParts[0].trim();
    const prefixRes = await searchTmdbCandidates(mediaType, basePrefix, undefined, key, 'fr-FR');
    for (const cand of prefixRes.results.slice(0, 5)) {
      const evalRes = evaluateCandidate(query, cand, mediaType, { year, synopsis: context?.synopsis, durationMinutes: context?.durationMinutes });
      if (evalRes.score >= 0.65) {
        return { candidate: cand, effectiveType: mediaType, confidence: evalRes.score, matchMethod: 'normalized_alternative' };
      }
    }
  }

  // Tier 2c: Cross-media fallback (Movie <-> TV)
  const oppType = mediaType === 'movie' ? 'tv' : 'movie';
  const oppRes = await searchTmdbCandidates(oppType, query, undefined, key, 'fr-FR');
  for (const cand of oppRes.results.slice(0, 5)) {
    const evalRes = evaluateCandidate(query, cand, oppType, { year, synopsis: context?.synopsis, durationMinutes: context?.durationMinutes });
    if (evalRes.score >= 0.65) {
      return { candidate: cand, effectiveType: oppType, confidence: evalRes.score, matchMethod: 'normalized_alternative' };
    }
  }

  // --- TIER 3: Keyword Search + Location / Semantic Description Overlap ---
  const searchKeywords = extractSignificantKeywords(query);
  if (searchKeywords.length > 0) {
    for (const kw of searchKeywords) {
      if (kw.length < 3) continue;
      
      // Search Movie candidates with keyword/toponym
      const kwMovieRes = await searchTmdbCandidates('movie', kw, undefined, key, 'fr-FR');
      for (const cand of kwMovieRes.results.slice(0, 6)) {
        const evalRes = evaluateCandidate(query, cand, 'movie', { year, synopsis: context?.synopsis, durationMinutes: context?.durationMinutes });
        if (evalRes.score >= 0.65) {
          return { candidate: cand, effectiveType: 'movie', confidence: evalRes.score, matchMethod: 'semantic_keyword' };
        }
      }

      // Search TV candidates with keyword/toponym
      const kwTvRes = await searchTmdbCandidates('tv', kw, undefined, key, 'fr-FR');
      for (const cand of kwTvRes.results.slice(0, 6)) {
        const evalRes = evaluateCandidate(query, cand, 'tv', { year, synopsis: context?.synopsis, durationMinutes: context?.durationMinutes });
        if (evalRes.score >= 0.65) {
          return { candidate: cand, effectiveType: 'tv', confidence: evalRes.score, matchMethod: 'semantic_keyword' };
        }
      }
    }
  }

  return { candidate: null, effectiveType: mediaType, confidence: 0, matchMethod: 'exact' };
}

/**
 * Main function to fetch enriched TMDB data for a title
 */
async function fetchTmdbMediaData(
  mediaType: 'movie' | 'tv',
  title: string,
  year?: number,
  apiKey?: string,
  context?: { synopsis?: string; durationMinutes?: number }
): Promise<{ data: TmdbEnrichmentData | null; status: CacheStatus }> {
  const key = apiKey || process.env.TMDB_API_KEY;
  if (!key || !key.trim()) {
    return { data: null, status: 'NOT_FOUND' };
  }

  const normalized = normalizeTitle(title, mediaType);
  if (!normalized || normalized.length < 2) {
    return { data: null, status: 'NOT_FOUND' };
  }

  return limiter.run(async () => {
    try {
      const searchResult = await perform3TierSearch(mediaType, normalized, year, key, context);
      const { candidate, effectiveType, confidence, matchMethod } = searchResult;

      if (!candidate || confidence < 0.65) {
        console.log(`[TMDB] Title: "${title}" | Type: ${mediaType} | Search: NOT_FOUND | Score: 0.00 | Poster: false | Backdrop: false | Trailer: false`);
        return { data: null, status: 'NOT_FOUND' };
      }

      // If already prefetched from anthology collection, return directly
      if (candidate._prefetched) {
        return { data: candidate._prefetched, status: 'FOUND' };
      }

      // Fetch complete details with trailers & alternative titles
      const media = await fetchFullDetails(candidate.id, effectiveType, key);
      if (!media) {
        return { data: null, status: 'ERROR' };
      }

      // Extract official trailer
      let trailerKey: string | undefined;
      if (media.videos && Array.isArray(media.videos.results)) {
        const youtubeVideos = media.videos.results.filter(
          (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        const frenchTrailer = youtubeVideos.find((v: any) => v.iso_639_1 === 'fr');
        const officialTrailer = youtubeVideos.find((v: any) => v.official);
        const selectedVideo = frenchTrailer || officialTrailer || youtubeVideos[0];
        if (selectedVideo && selectedVideo.key) {
          trailerKey = selectedVideo.key;
        }
      }

      const dateStr = effectiveType === 'movie' ? media.release_date : media.first_air_date;
      const releaseYear = dateStr ? parseInt(dateStr.substring(0, 4), 10) : undefined;
      const genresList = Array.isArray(media.genres) ? media.genres.map((g: any) => g.name).filter(Boolean) : undefined;
      const mainTitle = effectiveType === 'movie' ? (media.title || candidate.title) : (media.name || candidate.name);
      const origTitle = effectiveType === 'movie' ? media.original_title : media.original_name;

      const hasPoster = Boolean(media.poster_path);
      const hasBackdrop = Boolean(media.backdrop_path);
      const hasTrailer = Boolean(trailerKey);

      console.log(`[TMDB] Title: "${title}" | TMDB: "${mainTitle}" | ID: ${media.id} | Type: ${effectiveType} | Method: ${matchMethod} | Score: ${confidence.toFixed(2)} | Poster: ${hasPoster} | Backdrop: ${hasBackdrop} | Trailer: ${hasTrailer}`);

      const enrichment: TmdbEnrichmentData = {
        tmdb_id: media.id,
        tmdb_media_type: effectiveType,
        tmdb_title: mainTitle,
        tmdb_original_title: origTitle !== mainTitle ? origTitle : undefined,
        tmdb_overview: media.overview && media.overview.trim() ? media.overview.trim() : undefined,
        tmdb_poster_path: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : undefined,
        tmdb_backdrop_path: media.backdrop_path ? `https://image.tmdb.org/t/p/w1280${media.backdrop_path}` : undefined,
        tmdb_release_date: dateStr || undefined,
        tmdb_year: releaseYear,
        tmdb_genres: genresList && genresList.length > 0 ? genresList : undefined,
        tmdb_runtime: typeof media.runtime === 'number' && media.runtime > 0 ? media.runtime : (Array.isArray(media.episode_run_time) && media.episode_run_time[0] ? media.episode_run_time[0] : undefined),
        tmdb_vote_average: typeof media.vote_average === 'number' && media.vote_average > 0 ? Math.round(media.vote_average * 10) / 10 : undefined,
        tmdb_trailer_key: trailerKey,
        tmdb_match_confidence: Math.round(confidence * 100) / 100,
        tmdb_match_method: matchMethod
      };

      return { data: enrichment, status: 'FOUND' };
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn(`[TMDB Service] Exception TMDB : ${err.message || err}`);
      }
      return { data: null, status: 'ERROR' };
    }
  });
}

/**
 * Get TMDB enrichment for a title with smart cache
 */
export async function getTmdbEnrichment(
  title: string,
  mediaType: 'movie' | 'tv' = 'movie',
  year?: number,
  apiKey?: string,
  context?: { synopsis?: string; durationMinutes?: number }
): Promise<TmdbEnrichmentData | null> {
  const normTitle = normalizeTitle(title, mediaType);
  if (!normTitle) return null;

  const cacheKey = `tmdb:${mediaType}:${normTitle.toLowerCase()}:${year || ''}`;
  const now = Date.now();

  const cached = tmdbCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    if (cached.status === 'FOUND') {
      return cached.data;
    }
    if (cached.status === 'NOT_FOUND') {
      return null;
    }
  }

  const { data, status } = await fetchTmdbMediaData(mediaType, normTitle, year, apiKey, context);

  let ttl = ERROR_CACHE_TTL_MS;
  if (status === 'FOUND') ttl = POSITIVE_CACHE_TTL_MS;
  else if (status === 'NOT_FOUND') ttl = NEGATIVE_CACHE_TTL_MS;

  tmdbCache.set(cacheKey, {
    status,
    data,
    expiresAt: now + ttl
  });

  return data;
}

/**
 * Enrich a single program object with TMDB metadata
 */
export async function enrichProgram(program: Program): Promise<Program> {
  const eligibility = isEligibleForTmdb(program);
  if (!eligibility.eligible) {
    return program;
  }

  const enrichment = await getTmdbEnrichment(
    eligibility.normalizedTitle,
    eligibility.mediaType,
    eligibility.year || program.year,
    undefined,
    {
      synopsis: program.synopsis,
      durationMinutes: program.durationMinutes
    }
  );

  if (!enrichment) {
    return program;
  }

  const updatedCategory = enrichment.tmdb_media_type === 'movie' ? 'film' : 'serie';
  const updatedGenre = (enrichment.tmdb_genres && enrichment.tmdb_genres.length > 0)
    ? enrichment.tmdb_genres[0]
    : (updatedCategory === 'film' ? 'Film' : 'Série TV');

  return {
    ...program,
    ...enrichment,
    category: updatedCategory,
    genre: program.genre && !['Programme', 'Divertissement', 'Autre'].includes(program.genre) ? program.genre : updatedGenre,
    imageUrl: enrichment.tmdb_poster_path || program.imageUrl,
    synopsis: (enrichment.tmdb_overview && (!program.synopsis || program.synopsis.length < 40))
      ? enrichment.tmdb_overview
      : program.synopsis,
    year: enrichment.tmdb_year || program.year
  };
}

/**
 * Deduplicated, high-performance batch enrichment of programs
 */
export async function batchEnrichPrograms(programs: Program[]): Promise<Program[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || !apiKey.trim() || programs.length === 0) {
    return programs;
  }

  // Group unique lookups
  const uniqueLookups = new Map<string, { mediaType: 'movie' | 'tv'; normalizedTitle: string; year?: number; synopsis?: string; durationMinutes?: number }>();

  for (const prog of programs) {
    const eligibility = isEligibleForTmdb(prog);
    if (eligibility.eligible) {
      const key = `${eligibility.mediaType}:${eligibility.normalizedTitle.toLowerCase()}:${eligibility.year || prog.year || ''}`;
      if (!uniqueLookups.has(key)) {
        uniqueLookups.set(key, {
          mediaType: eligibility.mediaType,
          normalizedTitle: eligibility.normalizedTitle,
          year: eligibility.year || prog.year,
          synopsis: prog.synopsis,
          durationMinutes: prog.durationMinutes
        });
      }
    }
  }

  if (uniqueLookups.size === 0) {
    return programs;
  }

  // Fetch unique items in parallel
  const enrichmentResults = new Map<string, TmdbEnrichmentData | null>();
  const lookupPromises = Array.from(uniqueLookups.entries()).map(async ([key, item]) => {
    const data = await getTmdbEnrichment(item.normalizedTitle, item.mediaType, item.year, apiKey, {
      synopsis: item.synopsis,
      durationMinutes: item.durationMinutes
    });
    enrichmentResults.set(key, data);
  });

  await Promise.all(lookupPromises);

  // Map results back onto programs
  return programs.map(prog => {
    const eligibility = isEligibleForTmdb(prog);
    if (!eligibility.eligible) return prog;

    const key = `${eligibility.mediaType}:${eligibility.normalizedTitle.toLowerCase()}:${eligibility.year || prog.year || ''}`;
    const enrichment = enrichmentResults.get(key);

    if (!enrichment) return prog;

    const updatedCategory = enrichment.tmdb_media_type === 'movie' ? 'film' : 'serie';
    const updatedGenre = (enrichment.tmdb_genres && enrichment.tmdb_genres.length > 0)
      ? enrichment.tmdb_genres[0]
      : (updatedCategory === 'film' ? 'Film' : 'Série TV');

    return {
      ...prog,
      ...enrichment,
      category: updatedCategory,
      genre: prog.genre && !['Programme', 'Divertissement', 'Autre'].includes(prog.genre) ? prog.genre : updatedGenre,
      imageUrl: enrichment.tmdb_poster_path || prog.imageUrl,
      synopsis: (enrichment.tmdb_overview && (!prog.synopsis || prog.synopsis.length < 40))
        ? enrichment.tmdb_overview
        : prog.synopsis,
      year: enrichment.tmdb_year || prog.year
    };
  });
}
