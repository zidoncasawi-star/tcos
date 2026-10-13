import { Program, SmartImageResult, SmartImageType } from '../types';
import { BRAND_IMAGES, CATEGORY_IMAGES, selectFromImagePool } from '../data/imageAssets';
import { findKnownProgram } from './knownProgramRegistry';

/**
 * SMART PROGRAM IMAGE ENGINE
 * Multi-Tier Unified Smart Program Image Resolver for TV Guide
 * 
 * Flow:
 * 1. EPG Real Image (Custom XMLTV icon/image, not generic default)
 * 2. TMDB Poster / Backdrop (Films & Series)
 * 3. Known Program / Brand Image (Curated French flagship shows & TV brands)
 * 4. Sports Brands / Competitions (Ligue 1, Champions League, Roland-Garros, F1...)
 * 5. Semantic Topic / Category Image (Weather, Football, News, Cooking, Travel, Documentary, Kids...)
 * 6. Generic Category Fallback
 * 7. None
 */

interface CacheEntry {
  result: SmartImageResult;
  expiresAt: number;
}

const imageResolutionCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 Hours

const DEFAULT_GENERIC_EPG_IMAGE = 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80';

/**
 * Smart Program Text Normalization
 * Removes broadcast tags, technical metadata, resolution flags, and episode details
 */
export function normalizeProgramText(text?: string | null): string {
  if (!text) return '';

  let str = text
    .replace(/<[^>]*>/g, '') // HTML tags
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&eacute;/gi, 'é')
    .replace(/&egrave;/gi, 'è')
    .replace(/&agrave;/gi, 'à')
    .trim();

  // Strip leading broadcast prefixes (e.g. "Live:", "Direct:", "TF1 - ")
  str = str.replace(/^(live\s*:?|direct\s*:?|inédit\s*:?|replay\s*:?)\s*/i, '');
  str = str.replace(/^(TF1|FRANCE\s*\d|M6|ARTE|W9|TMC|TFX|C8|CNEWS|LCP|GULLI|RMC\s*[A-Z]+|CANAL\+?\s*[A-Z]*)\s*[:-]\s*/i, '');

  // Strip technical / broadcast badges
  str = str.replace(/\s*[\(\[](inédit|inedit|direct|rediffusion|replay|vf|vo|vost|vostfr|hd|fhd|4k|uhd|vm|téléfilm|telefilm|film|nouveau|inédite|inedite)[\)\]]/gi, '');
  str = str.replace(/\b(inédit|inedit|vostfr|vost|4k|fhd|uhd|direct|live)\b/gi, '');

  // Strip episode and season patterns (e.g. "S01E03", "Saison 3", "Épisode 5")
  str = str.replace(/\s*[-:–]?\s*(saison\s*\d+[\s,]*ép(isode)?\s*\d+|s\d+[\s.]*e\d+|ép(isode)?\s*\d+|saison\s*\d+|season\s*\d+).*$/i, '');
  str = str.replace(/\s*[\(\[](saison\s*\d+[\s,]*ép(isode)?\s*\d+|s\d+[\s.]*e\d+|ép(isode)?\s*\d+|saison\s*\d+|season\s*\d+)[\)\]]/gi, '');

  // Strip trailing duration indicator like "(1h40)", "(90 min)"
  str = str.replace(/\s*\(\s*\d+\s*(h\s*\d*|min|mn)\s*\)/gi, '');

  // Strip trailing production year in parenthesis "(2024)"
  str = str.replace(/\s*\(\s*(19\d{2}|20\d{2})\s*\)/g, '');

  // Remove trailing colon or dash
  str = str.replace(/[\s\-:–]+$/, '');

  // Convert French accents to ASCII & lowercase for robust keyword analysis
  const normalizedAscii = str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return normalizedAscii;
}

/**
 * Topic & Category Detection with Subcategory and Brand Discovery
 */
export interface TopicClassification {
  category: string;
  subcategory?: string;
  brand?: string;
  matchedKeyword?: string;
  score: number;
}

export function classifyProgramTopic(
  title: string,
  subtitle?: string,
  synopsis?: string,
  genre?: string,
  rawCategory?: string
): TopicClassification {
  const normTitle = normalizeProgramText(title);
  const normSub = normalizeProgramText(subtitle);
  const normSynopsis = normalizeProgramText(synopsis);
  const normGenre = normalizeProgramText(genre);
  const normCategory = normalizeProgramText(rawCategory);

  const fullSearch = `${normTitle} ${normSub} ${normGenre} ${normCategory} ${normSynopsis}`;

  // 1. 🌤️ MÉTÉO / CLIMAT
  if (
    normTitle.includes('meteo') ||
    normTitle.includes('climat') ||
    normTitle.includes('bulletin meteo') ||
    normTitle.includes('journal meteo') ||
    normTitle.includes('previsions meteo') ||
    normTitle.includes('previsions') ||
    normTitle.includes('weather') ||
    normTitle.includes('la meteo') ||
    normGenre.includes('meteo')
  ) {
    return {
      category: 'weather',
      subcategory: 'forecast',
      matchedKeyword: 'meteo',
      score: 95
    };
  }

  // 2. ⚽ SPORTS BRANDS & COMPETITIONS
  if (normTitle.includes('ligue 1') || fullSearch.includes('ligue 1')) {
    return { category: 'sport', subcategory: 'football', brand: 'ligue1', matchedKeyword: 'ligue 1', score: 90 };
  }
  if (normTitle.includes('ligue 2') || fullSearch.includes('ligue 2')) {
    return { category: 'sport', subcategory: 'football', brand: 'ligue2', matchedKeyword: 'ligue 2', score: 90 };
  }
  if (fullSearch.includes('champions league') || fullSearch.includes('ligue des champions')) {
    return { category: 'sport', subcategory: 'football', brand: 'championsLeague', matchedKeyword: 'champions league', score: 90 };
  }
  if (fullSearch.includes('europa league') || fullSearch.includes('ligue europa')) {
    return { category: 'sport', subcategory: 'football', brand: 'europaLeague', matchedKeyword: 'europa league', score: 90 };
  }
  if (fullSearch.includes('premier league')) {
    return { category: 'sport', subcategory: 'football', brand: 'premierLeague', matchedKeyword: 'premier league', score: 90 };
  }
  if (fullSearch.includes('la liga') || fullSearch.includes('liga espagnole')) {
    return { category: 'sport', subcategory: 'football', brand: 'laLiga', matchedKeyword: 'la liga', score: 90 };
  }
  if (fullSearch.includes('serie a') || fullSearch.includes('calcio')) {
    return { category: 'sport', subcategory: 'football', brand: 'serieA', matchedKeyword: 'serie a', score: 90 };
  }
  if (fullSearch.includes('bundesliga')) {
    return { category: 'sport', subcategory: 'football', brand: 'bundesliga', matchedKeyword: 'bundesliga', score: 90 };
  }
  if (fullSearch.includes('coupe de france')) {
    return { category: 'sport', subcategory: 'football', brand: 'coupeDeFrance', matchedKeyword: 'coupe de france', score: 90 };
  }
  if (fullSearch.includes('roland garros') || fullSearch.includes('roland-garros')) {
    return { category: 'sport', subcategory: 'tennis', brand: 'rolandGarros', matchedKeyword: 'roland garros', score: 90 };
  }
  if (fullSearch.includes('wimbledon')) {
    return { category: 'sport', subcategory: 'tennis', brand: 'wimbledon', matchedKeyword: 'wimbledon', score: 90 };
  }
  if (fullSearch.includes('us open')) {
    return { category: 'sport', subcategory: 'tennis', brand: 'usOpen', matchedKeyword: 'us open', score: 90 };
  }
  if (fullSearch.includes('formula 1') || fullSearch.includes('formule 1') || fullSearch.includes('f1') || fullSearch.includes('grand prix')) {
    return { category: 'sport', subcategory: 'motorsport', brand: 'formula1', matchedKeyword: 'formula 1', score: 90 };
  }
  if (fullSearch.includes('tour de france')) {
    return { category: 'sport', subcategory: 'cycling', brand: 'tourDeFrance', matchedKeyword: 'tour de france', score: 90 };
  }
  if (fullSearch.includes('top 14') || fullSearch.includes('top14') || fullSearch.includes('six nations') || fullSearch.includes('6 nations')) {
    return { category: 'sport', subcategory: 'rugby', brand: 'top14', matchedKeyword: 'rugby top 14', score: 90 };
  }
  if (fullSearch.includes('nba')) {
    return { category: 'sport', subcategory: 'basketball', brand: 'nba', matchedKeyword: 'nba', score: 90 };
  }
  if (fullSearch.includes('ufc') || fullSearch.includes('mma')) {
    return { category: 'sport', subcategory: 'combat', brand: 'ufc', matchedKeyword: 'ufc', score: 90 };
  }

  // 3. ⚽ GENERAL SPORTS BY DISCIPLINE
  if (fullSearch.includes('football') || fullSearch.includes('foot') || fullSearch.includes('telefoot') || fullSearch.includes('stade 2')) {
    return { category: 'sport', subcategory: 'football', matchedKeyword: 'football', score: 80 };
  }
  if (fullSearch.includes('rugby') || fullSearch.includes('xv de france')) {
    return { category: 'sport', subcategory: 'rugby', matchedKeyword: 'rugby', score: 80 };
  }
  if (fullSearch.includes('tennis') || fullSearch.includes('atp') || fullSearch.includes('wta')) {
    return { category: 'sport', subcategory: 'tennis', matchedKeyword: 'tennis', score: 80 };
  }
  if (fullSearch.includes('cyclisme') || fullSearch.includes('velo') || fullSearch.includes('peloton')) {
    return { category: 'sport', subcategory: 'cycling', matchedKeyword: 'cyclisme', score: 80 };
  }
  if (fullSearch.includes('basket') || fullSearch.includes('basketball')) {
    return { category: 'sport', subcategory: 'basketball', matchedKeyword: 'basketball', score: 80 };
  }
  if (fullSearch.includes('boxe') || fullSearch.includes('judo') || fullSearch.includes('combat')) {
    return { category: 'sport', subcategory: 'combat', matchedKeyword: 'combat', score: 80 };
  }
  if (fullSearch.includes('moto gp') || fullSearch.includes('motogp') || fullSearch.includes('rallye')) {
    return { category: 'sport', subcategory: 'motorsport', matchedKeyword: 'motorsport', score: 80 };
  }

  // 4. 📺 NEWS & JOURNAUX TÉLÉVISÉS
  if (
    normTitle.includes('journal') ||
    normTitle.includes('jt') ||
    normTitle.includes('20 heures') ||
    normTitle.includes('13 heures') ||
    normTitle.includes('19 20') ||
    normTitle.includes('12 13') ||
    normTitle.includes('actualites') ||
    normTitle.includes('informations') ||
    normTitle.includes('edition speciale') ||
    normTitle.includes('soir 3') ||
    normTitle.includes('le 20h') ||
    normTitle.includes('le 13h') ||
    normGenre.includes('journal') ||
    normGenre.includes('information')
  ) {
    let sub = 'general';
    if (normTitle.includes('20') || normTitle.includes('20h')) sub = 'jt20h';
    else if (normTitle.includes('13') || normTitle.includes('13h')) sub = 'jt13h';
    return { category: 'news', subcategory: sub, matchedKeyword: 'journal televisise', score: 85 };
  }

  // 5. 🧑‍🍳 CUISINE & GASTRONOMIE
  if (
    fullSearch.includes('cuisine') ||
    fullSearch.includes('cooking') ||
    fullSearch.includes('recette') ||
    fullSearch.includes('recettes') ||
    fullSearch.includes('chef') ||
    fullSearch.includes('gastronomie') ||
    fullSearch.includes('patisserie') ||
    fullSearch.includes('baking') ||
    fullSearch.includes('meilleur patissier') ||
    fullSearch.includes('cauchemar en cuisine')
  ) {
    return { category: 'cooking', subcategory: 'gastronomy', matchedKeyword: 'cuisine', score: 85 };
  }

  // 6. 🧳 VOYAGE & TOURISME
  if (
    fullSearch.includes('voyage') ||
    fullSearch.includes('voyages') ||
    fullSearch.includes('travel') ||
    fullSearch.includes('destination') ||
    fullSearch.includes('decouverte') ||
    fullSearch.includes('tourisme') ||
    fullSearch.includes('echappees') ||
    fullSearch.includes('faut pas rever') ||
    fullSearch.includes('des racines et des ailes')
  ) {
    return { category: 'travel', subcategory: 'discovery', matchedKeyword: 'voyage', score: 85 };
  }

  // 7. 🌍 DOCUMENTAIRES (Sub-topic detection)
  if (fullSearch.includes('documentaire') || fullSearch.includes('documentaires') || normCategory === 'documentaire') {
    if (fullSearch.includes('nature') || fullSearch.includes('foret') || fullSearch.includes('montagne') || fullSearch.includes('planete')) {
      return { category: 'nature', subcategory: 'nature', matchedKeyword: 'documentaire nature', score: 85 };
    }
    if (fullSearch.includes('histoire') || fullSearch.includes('secrets d histoire') || fullSearch.includes('guerre') || fullSearch.includes('civilisation') || fullSearch.includes('chateau')) {
      return { category: 'history', subcategory: 'history', matchedKeyword: 'documentaire histoire', score: 85 };
    }
    if (fullSearch.includes('science') || fullSearch.includes('sciences') || fullSearch.includes('espace') || fullSearch.includes('astronomie') || fullSearch.includes('ocean')) {
      return { category: 'science', subcategory: 'science', matchedKeyword: 'documentaire sciences', score: 85 };
    }
    if (fullSearch.includes('animaux') || fullSearch.includes('animal') || fullSearch.includes('faune') || fullSearch.includes('safari') || fullSearch.includes('zoo')) {
      return { category: 'wildlife', subcategory: 'wildlife', matchedKeyword: 'documentaire animalier', score: 85 };
    }
    return { category: 'nature', subcategory: 'general-documentary', matchedKeyword: 'documentaire', score: 75 };
  }

  // 8. 👨‍👩‍👧 JEUNESSE & ANIMATION
  if (
    fullSearch.includes('dessin anime') ||
    fullSearch.includes('jeunesse') ||
    fullSearch.includes('enfants') ||
    fullSearch.includes('kids') ||
    fullSearch.includes('cartoon') ||
    fullSearch.includes('animation') ||
    fullSearch.includes('mickey') ||
    fullSearch.includes('disney') ||
    fullSearch.includes('pokemon') ||
    fullSearch.includes('tom et jerry') ||
    fullSearch.includes('peppa pig') ||
    fullSearch.includes('pat patrouille') ||
    fullSearch.includes('paw patrol')
  ) {
    return { category: 'kids', subcategory: 'animation', matchedKeyword: 'jeunesse', score: 85 };
  }

  // 9. 🎵 MUSIQUE & CONCERTS
  if (
    fullSearch.includes('musique') ||
    fullSearch.includes('music') ||
    fullSearch.includes('concert') ||
    fullSearch.includes('concerts') ||
    fullSearch.includes('chanson') ||
    fullSearch.includes('chansons') ||
    fullSearch.includes('clip') ||
    fullSearch.includes('clips') ||
    fullSearch.includes('taratata') ||
    fullSearch.includes('orchestre')
  ) {
    return { category: 'music', subcategory: 'concert', matchedKeyword: 'musique', score: 85 };
  }

  // 10. 🏛️ POLITIQUE & DÉBATS
  if (
    fullSearch.includes('politique') ||
    fullSearch.includes('debat') ||
    fullSearch.includes('societe') ||
    fullSearch.includes('interview politique') ||
    fullSearch.includes('assemblee nationale') ||
    fullSearch.includes('senat')
  ) {
    return { category: 'politics', subcategory: 'debate', matchedKeyword: 'politique', score: 80 };
  }

  // 11. 🎤 DIVERTISSEMENT & TALK-SHOWS
  if (
    fullSearch.includes('divertissement') ||
    fullSearch.includes('entertainment') ||
    fullSearch.includes('spectacle') ||
    fullSearch.includes('varietes') ||
    fullSearch.includes('talk show') ||
    fullSearch.includes('talk-show') ||
    fullSearch.includes('humour') ||
    fullSearch.includes('comedie') ||
    fullSearch.includes('jeu')
  ) {
    return { category: 'entertainment', subcategory: 'show', matchedKeyword: 'divertissement', score: 75 };
  }

  // Fallback category mapping based on high level rawCategory
  if (rawCategory === 'film') return { category: 'cinema', score: 60 };
  if (rawCategory === 'serie') return { category: 'series', score: 60 };
  if (rawCategory === 'sport') return { category: 'football', score: 60 };
  if (rawCategory === 'info') return { category: 'news', score: 60 };
  if (rawCategory === 'divertissement') return { category: 'entertainment', score: 60 };
  if (rawCategory === 'jeunesse') return { category: 'kids', score: 60 };
  if (rawCategory === 'documentaire') return { category: 'nature', score: 60 };
  if (rawCategory === 'magazine') return { category: 'magazine', score: 60 };

  return { category: 'entertainment', score: 40 };
}

/**
 * Main Smart Program Image Resolver
 */
export class SmartProgramImageResolver {
  /**
   * Resolve an optimal image for a single program
   */
  static resolve(
    program: Program,
    options?: {
      usedImagesSet?: Set<string>;
      enableLogging?: boolean;
    }
  ): SmartImageResult {
    const { usedImagesSet, enableLogging = true } = options || {};

    const cacheKey = `${normalizeProgramText(program.title)}_${program.category || ''}_${program.genre || ''}_${program.tmdb_id || ''}`;
    const cached = imageResolutionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    const normTitle = normalizeProgramText(program.title);
    const classification = classifyProgramTopic(
      program.title,
      program.subtitle,
      program.synopsis,
      program.genre,
      program.category
    );

    let result: SmartImageResult;

    // -------------------------------------------------------------
    // PRIORITY 1: Real custom EPG Image (non-placeholder, distinct)
    // -------------------------------------------------------------
    const isEpgCustom =
      Boolean(program.imageUrl) &&
      program.imageUrl.startsWith('http') &&
      program.imageUrl !== DEFAULT_GENERIC_EPG_IMAGE &&
      !program.imageUrl.includes('default') &&
      !program.imageUrl.includes('placeholder');

    // If EPG has an explicit verified custom image and it is not a generic stock image
    if (isEpgCustom && (program.imageUrl.includes('programme-tv.net') || program.imageUrl.includes('xmltv') || program.imageUrl.includes('francetv') || program.imageUrl.includes('tf1'))) {
      result = {
        imageUrl: program.imageUrl,
        imageType: 'epg',
        confidence: 1.0,
        category: program.category || classification.category,
        subcategory: classification.subcategory,
        brand: classification.brand,
        matchedKeyword: 'epg_custom_icon'
      };
      if (enableLogging) {
        console.log(`[SMART IMAGE] Title: "${program.title}" | Image Type: epg | Confidence: 1.00`);
      }
      imageResolutionCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });
      return result;
    }

    // -------------------------------------------------------------
    // PRIORITY 2: TMDB Movie / TV Poster & Backdrop
    // High-priority preservation of TMDB enrichments for cinema & series
    // -------------------------------------------------------------
    if (program.tmdb_id && (program.tmdb_poster_path || program.tmdb_backdrop_path)) {
      const tmdbImg = program.tmdb_poster_path || program.tmdb_backdrop_path!;
      result = {
        imageUrl: tmdbImg,
        imageType: 'tmdb',
        confidence: program.tmdb_match_confidence || 0.95,
        category: program.category || (program.tmdb_media_type === 'movie' ? 'film' : 'serie'),
        subcategory: program.tmdb_media_type === 'movie' ? 'movie' : 'tv',
        matchedKeyword: program.tmdb_title || program.title
      };
      if (enableLogging) {
        console.log(`[SMART IMAGE] Title: "${program.title}" | TMDB Match: "${program.tmdb_title}" | Image Type: tmdb | Confidence: ${result.confidence.toFixed(2)}`);
      }
      imageResolutionCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });
      return result;
    }

    // -------------------------------------------------------------
    // PRIORITY 3: Sports Brands & Specific Competitions Image
    // (Ligue 1, Champions League, Roland-Garros, Formula 1...)
    // When a specific competition/brand is present (e.g. "Live: Stade 2 Ligue 1"),
    // the specific competition takes precedence over the general magazine show.
    // -------------------------------------------------------------
    if (classification.brand && BRAND_IMAGES[classification.brand]) {
      const brandPool = BRAND_IMAGES[classification.brand];
      const brandImg = selectFromImagePool(brandPool, program.title, usedImagesSet);
      if (brandImg) {
        result = {
          imageUrl: brandImg,
          imageType: 'brand',
          confidence: 0.96,
          category: classification.category,
          subcategory: classification.subcategory,
          brand: classification.brand,
          matchedKeyword: classification.matchedKeyword
        };
        if (enableLogging) {
          console.log(`[SMART IMAGE] Title: "${program.title}" | Brand: "${classification.brand}" | Image Type: brand | Confidence: 0.96`);
        }
        imageResolutionCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });
        return result;
      }
    }

    // -------------------------------------------------------------
    // PRIORITY 4: Known Program / Identity Image
    // (C à vous, Quotidien, TPMP, Koh-Lanta, Top Chef, The Voice, Stade 2...)
    // -------------------------------------------------------------
    const known = findKnownProgram(normTitle);
    if (known) {
      result = {
        imageUrl: known.imageUrl,
        imageType: 'program',
        confidence: known.confidence,
        category: known.category,
        subcategory: known.subcategory || classification.subcategory,
        brand: classification.brand,
        matchedKeyword: known.name
      };
      if (enableLogging) {
        console.log(`[SMART IMAGE] Title: "${program.title}" | Program Match: "${known.name}" | Image Type: program | Confidence: ${known.confidence.toFixed(2)}`);
      }
      imageResolutionCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });
      return result;
    }

    // -------------------------------------------------------------
    // PRIORITY 5: Topic & Semantic Category Image
    // (Weather, Football, News, Cooking, Travel, Nature, History, Science, Kids, Music...)
    // -------------------------------------------------------------
    const targetPool = CATEGORY_IMAGES[classification.category] || CATEGORY_IMAGES['entertainment'];
    const categoryImg = selectFromImagePool(targetPool, program.title, usedImagesSet);

    if (categoryImg) {
      const isHighConfidence = classification.score >= 80;
      result = {
        imageUrl: categoryImg,
        imageType: isHighConfidence ? 'category' : 'fallback',
        confidence: isHighConfidence ? 0.85 : 0.60,
        category: classification.category,
        subcategory: classification.subcategory,
        brand: classification.brand,
        matchedKeyword: classification.matchedKeyword
      };
      if (enableLogging) {
        console.log(`[SMART IMAGE] Title: "${program.title}" | Category: "${classification.category}" | Subcategory: "${classification.subcategory || 'none'}" | Image Type: ${result.imageType} | Confidence: ${result.confidence.toFixed(2)}`);
      }
      imageResolutionCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });
      return result;
    }

    // -------------------------------------------------------------
    // PRIORITY 6: Generic Category Fallback
    // -------------------------------------------------------------
    const fallbackPool = CATEGORY_IMAGES['entertainment'];
    const fallbackImg = selectFromImagePool(fallbackPool, program.title, usedImagesSet);
    result = {
      imageUrl: fallbackImg || null,
      imageType: fallbackImg ? 'fallback' : 'none',
      confidence: 0.40,
      category: 'divertissement',
      matchedKeyword: 'generic_fallback'
    };
    if (enableLogging) {
      console.log(`[SMART IMAGE] Title: "${program.title}" | Image Type: none | Reason: generic fallback`);
    }
    imageResolutionCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  }

  /**
   * Batch resolve images for an array of programs with anti-repetition tracking
   */
  static resolveBatch(programs: Program[], enableLogging: boolean = false): Program[] {
    const usedImagesSet = new Set<string>();

    return programs.map(prog => {
      const resolved = SmartProgramImageResolver.resolve(prog, {
        usedImagesSet,
        enableLogging
      });

      return {
        ...prog,
        imageUrl: resolved.imageUrl || prog.imageUrl,
        imageType: resolved.imageType,
        imageConfidence: resolved.confidence,
        subcategory: resolved.subcategory,
        brand: resolved.brand
      };
    });
  }
}

/**
 * Convenience helper function to enrich a program with Smart Image Resolution
 */
export function applySmartImageToProgram(program: Program, enableLogging: boolean = false): Program {
  const resolved = SmartProgramImageResolver.resolve(program, { enableLogging });
  return {
    ...program,
    imageUrl: resolved.imageUrl || program.imageUrl,
    imageType: resolved.imageType,
    imageConfidence: resolved.confidence,
    subcategory: resolved.subcategory,
    brand: resolved.brand
  };
}
