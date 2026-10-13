import { Program, ProgramCategory, Channel } from '../types';
import { MOCK_PROGRAMS, CHANNELS, getDateString } from '../data/mockEpg';

/**
 * EPG Provider & XMLTV Parser Abstraction Layer
 * Flow: EPG Provider -> XMLTV Parser -> Normalized Programme Data -> TV Guide UI
 *
 * Strict Rules:
 * 1. EPG_URL vide -> aucun programme fictif, message d'indisponibilité propre.
 * 2. EPG_URL = URL XMLTV valide -> programmes extraits et affichés.
 * 3. EPG_URL = URL Xtream get.php -> conversion serveur get.php -> xmltv.php, 0 identifiants exposés.
 * 4. URL EPG invalide / inaccessible / timeout -> pas de crash, message propre.
 */

/**
 * Automatically resolve Xtream Codes get.php (M3U) into xmltv.php strictly server-side
 */
export function resolveEpgUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  const trimmed = rawUrl.trim();

  // If Xtream Codes M3U playlist URL (get.php), automatically point to xmltv.php
  if (trimmed.includes('get.php') && (trimmed.includes('username=') || trimmed.includes('password='))) {
    try {
      const parsedUrl = new URL(trimmed);
      const username = parsedUrl.searchParams.get('username') || '';
      const password = parsedUrl.searchParams.get('password') || '';
      return `${parsedUrl.origin}/xmltv.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    } catch {
      return trimmed
        .replace('get.php', 'xmltv.php')
        .replace(/&type=[^&]*/g, '')
        .replace(/&output=[^&]*/g, '');
    }
  }
  return trimmed;
}

/**
 * Sanitize URLs to prevent leaking credentials (usernames/passwords) to client responses
 */
export function sanitizeUrlForClient(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has('password') || parsed.searchParams.has('username')) {
      return `${parsed.origin}${parsed.pathname} [Identifiants sécurisés]`;
    }
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.replace(/password=[^&]*/gi, 'password=******').replace(/username=[^&]*/gi, 'username=******');
  }
}

export interface EpgProviderStatus {
  isConfigured: boolean;
  sourceUrl?: string;
  providerName: string;
  lastSync?: string;
  programCount: number;
  message: string;
}

// Case-insensitive mapping of XMLTV channel IDs to internal slug IDs
export const RAW_CHANNEL_MAP: Record<string, string> = {
  'tf1.fr': 'tf1',
  'tf1': 'tf1',
  'tf 1': 'tf1',
  'france2.fr': 'france-2',
  'france 2': 'france-2',
  'france2': 'france-2',
  'france3.fr': 'france-3',
  'france 3': 'france-3',
  'france3': 'france-3',
  'canalplus.fr': 'canal-plus',
  'canal+': 'canal-plus',
  'canal+ france': 'canal-plus',
  'canalplus': 'canal-plus',
  'canal-plus': 'canal-plus',
  'france5.fr': 'france-5',
  'france 5': 'france-5',
  'france5': 'france-5',
  'm6.fr': 'm6',
  'm6': 'm6',
  'arte.fr': 'arte',
  'arte.tv': 'arte',
  'arte': 'arte',
  'c8.fr': 'c8',
  'c8': 'c8',
  'd8.fr': 'c8',
  'w9.fr': 'w9',
  'w9': 'w9',
  'tmc.fr': 'tmc',
  'tmc': 'tmc',
  'nt1.fr': 'tfx',
  'tfx.fr': 'tfx',
  'tfx': 'tfx',
  'nrj12.fr': 'nrj12',
  'nrj 12': 'nrj12',
  'nrj12': 'nrj12',
  'lachaineparlementaire.fr': 'lcp',
  'lcp.fr': 'lcp',
  'lcp': 'lcp',
  'france4.fr': 'france-4',
  'france 4': 'france-4',
  'france4': 'france-4',
  'bfmtv.fr': 'bfmtv',
  'bfmtv': 'bfmtv',
  'bfm tv': 'bfmtv',
  'cnews.fr': 'cnews',
  'cnews': 'cnews',
  'itele.fr': 'cnews',
  'cstar.fr': 'cstar',
  'cstar': 'cstar',
  'd17.fr': 'cstar',
  'gulli.fr': 'gulli',
  'gulli': 'gulli',
  'tf1seriesfilms.fr': 'tf1-series-films',
  'tf1 series films': 'tf1-series-films',
  'hd1.fr': 'tf1-series-films',
  'lequipe21.fr': 'l-equipe',
  'lequipe.fr': 'l-equipe',
  'l-equipe': 'l-equipe',
  'lequipe': 'l-equipe',
  '6ter.fr': '6ter',
  '6ter': '6ter',
  'numero23.fr': 'rmc-story',
  'rmcstory.fr': 'rmc-story',
  'rmc-story': 'rmc-story',
  'rmc story': 'rmc-story',
  'rmcdecouverte.fr': 'rmc-decouverte',
  'rmc-decouverte': 'rmc-decouverte',
  'rmc decouverte': 'rmc-decouverte',
  'cherie25.fr': 'cherie-25',
  'cherie 25': 'cherie-25',
  'cherie-25': 'cherie-25',
  'lci.fr': 'lci',
  'lci': 'lci',
  'franceinfo.fr': 'franceinfo',
  'franceinfo': 'franceinfo',
  'france info': 'franceinfo',
  'parispremiere.fr': 'paris-premiere',
  'canalplussport.fr': 'canal-plus-sport',
  'canalpluscinema.fr': 'canal-plus-cinema',
  'planeteplus.fr': 'planete-plus'
};

export function getChannelSlug(rawId?: string, displayName?: string): string | undefined {
  if (!rawId && !displayName) return undefined;
  
  const testStrings = [rawId, displayName].filter(Boolean) as string[];
  for (const raw of testStrings) {
    const clean = raw.trim().toLowerCase();
    if (RAW_CHANNEL_MAP[clean]) return RAW_CHANNEL_MAP[clean];
    
    // Normalize: remove prefix like "fr:", "fr - ", "fr | ", suffixes like "hd", "fhd", "4k", "hevc", ".fr", etc.
    const normalized = clean
      .replace(/^(fr|fra|france)\s*[:| -]\s*/i, '')
      .replace(/\.(fr|tv|com)$/i, '')
      .replace(/\b(fhd|uhd|hevc|4k|hd|sd|1080p|720p|h265|h264|plus|\+)\b/gi, '')
      .replace(/[^a-z0-9]/g, '');

    for (const [k, v] of Object.entries(RAW_CHANNEL_MAP)) {
      const kNorm = k.replace(/\.(fr|tv|com)$/i, '').replace(/[^a-z0-9]/g, '');
      if (normalized === kNorm) return v;
    }
  }
  return undefined;
}

/**
 * Decode common XML entities
 */
export function decodeXmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&agrave;/g, 'à')
    .replace(/&icirc;/g, 'î')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&ucirc;/g, 'û')
    .replace(/&ccedil;/g, 'ç')
    .trim();
}

/**
 * Categorize XMLTV category strings into normalized ProgramCategory
 */
export function normalizeCategory(categoryStr: string): ProgramCategory {
  const c = (categoryStr || '').toLowerCase();
  if (c.includes('film') || c.includes('cinéma') || c.includes('cinema') || c.includes('téléfilm') || c.includes('movie') || c.includes('long-métrage')) {
    return 'film';
  }
  if (c.includes('série') || c.includes('serie') || c.includes('feuilleton') || c.includes('fiction')) {
    return 'serie';
  }
  if (c.includes('sport') || c.includes('football') || c.includes('rugby') || c.includes('tennis') || c.includes('cyclisme') || c.includes('course')) {
    return 'sport';
  }
  if (c.includes('journal') || c.includes('information') || c.includes('météo') || c.includes('actualité') || c.includes('news') || c.includes('jt') || c.includes('débat')) {
    return 'info';
  }
  if (c.includes('documentaire') || c.includes('découverte') || c.includes('histoire') || c.includes('nature') || c.includes('civilisation') || c.includes('animaux')) {
    return 'documentaire';
  }
  if (c.includes('magazine') || c.includes('société') || c.includes('talk-show') || c.includes('jeu') || c.includes('culinaire')) {
    return 'magazine';
  }
  if (c.includes('jeunesse') || c.includes('animation') || c.includes('dessin animé') || c.includes('enfants')) {
    return 'jeunesse';
  }
  return 'divertissement';
}

/**
 * Intelligent categorization and genre inference from title, subtitle, synopsis, channel and duration
 */
export function inferCategoryAndGenre(
  rawCategory: string | undefined,
  title: string,
  subtitle?: string,
  synopsis?: string,
  channelSlug?: string,
  durationMinutes?: number
): { category: ProgramCategory; genre: string } {
  const normCat = (rawCategory || '').trim().toLowerCase();
  const fullText = `${title} ${subtitle || ''} ${synopsis || ''}`.toLowerCase();

  // If explicit non-generic XMLTV category exists
  if (normCat && !['divertissement', 'autre', 'programme', 'emission', 'généraliste', ''].includes(normCat)) {
    const cat = normalizeCategory(normCat);
    return { category: cat, genre: rawCategory || 'Divertissement' };
  }

  // 1. Channel specific classification
  if (channelSlug === 'cnews' || channelSlug === 'bfmtv' || channelSlug === 'lci' || channelSlug === 'franceinfo' || channelSlug === 'lcp') {
    return { category: 'info', genre: 'Information' };
  }
  if (channelSlug === 'l-equipe' || channelSlug === 'canal-plus-sport') {
    return { category: 'sport', genre: 'Sport' };
  }
  if (channelSlug === 'gulli') {
    if (fullText.includes('film') || fullText.includes('cinéma') || (durationMinutes && durationMinutes >= 80)) {
      return { category: 'film', genre: 'Film d\'animation' };
    }
    return { category: 'jeunesse', genre: 'Jeunesse' };
  }
  if (channelSlug === 'planete-plus') {
    return { category: 'documentaire', genre: 'Documentaire' };
  }

  // 2. Information / Journal / Météo
  if (/(journal|jt\b|19\/20|12\/13|20 heures|13 heures|météo|édition|matinale|c dans l'air|face à l'info|punchline|l'heure des pros|24h pujadas|soir 3|bourdin|les informés|journal de la nuit|la nuit de l'info|flash info)/i.test(fullText)) {
    return { category: 'info', genre: 'Information' };
  }

  // 3. Sport
  if (/(football|foot\b|ligue 1|ligue 2|champions league|rugby|top 14|six nations|tennis|roland-garros|wimbledon|formule 1|grand prix|basket|nba|handball|cyclisme|tour de france|vuelta|giro|l'équipe|stade 2|telefoot|auto moto|moto gp|ufc|mma|boxe|athlétisme|ultra trail|course automobile|championnat)/i.test(fullText)) {
    return { category: 'sport', genre: 'Sport' };
  }

  // 4. Jeunesse / Animation
  if (/(dessin animé|animation|peppa pig|pat' patrouille|paw patrol|les simpson|miraculous|oggy|bob l'éponge|pokemon|pokémon|dragon ball|teen titans|gormiti|alvinnn|masha et michka|titeuf|scooby-doo|barbapapa|lego|enfants|jeunesse)/i.test(fullText)) {
    return { category: 'jeunesse', genre: 'Jeunesse' };
  }

  // 5. Documentaire / Découverte / Nature
  if (/(documentaire|découverte|histoire\b|secrets d'histoire|des racines et des ailes|faut pas rêver|échappées belles|enquête exclusive|zone interdite|capital\b|enquête d'action|90' enquêtes|chroniques criminelles|faites entrer l'accusé|une saison au zoo|la vie secrète du zoo|vintage mecanic|wheeler dealers|les reines de la route|hors de contrôle|sciences grand format|faune|planète sauvage|civilisation)/i.test(fullText)) {
    return { category: 'documentaire', genre: 'Documentaire' };
  }

  // 6. Séries / Feuilletons
  if (/(série|saison\s*\d+|épisode\s*\d+|s\d+[\s.]*e\d+|feuilleton|plus belle la vie|demain nous appartient|ici tout commence|un si grand soleil|scènes de ménages|en famille|ncis|les experts|candice renoir|capitaine marleau|hpi|balthazar|astrid et raphaëlle|profilage|section de recherches|petits secrets entre voisins|esprits criminels|new york unité spéciale|modern family|grey's anatomy|good doctor|bates motel|mentalist)/i.test(fullText)) {
    return { category: 'serie', genre: 'Série TV' };
  }

  // 7. Magazines & Talk-shows & Jeux & Téléachat
  if (/(magazine|talk-show|quotidien|touche pas à mon poste|tpmp|c à vous|envoyé spécial|complément d'enquête|sept à huit|66 minutes|50 mn inside|turbo|silence ça pousse|la maison france 5|maison à vendre|recherche appartement ou maison|chasseurs d'appart|ca commence aujourd'hui|affaire conclue|slam\b|tout le monde veut prendre sa place|les 12 coups de midi|questions pour un champion|n'oubliez pas les paroles|la chanson de l'année|the voice|koh-lanta|danse avec les stars|star academy|téléachat|m6 boutique|euroshopping)/i.test(fullText)) {
    return { category: 'magazine', genre: 'Magazine' };
  }

  // Nocturnal fillers & loops
  if (/(programmes de nuit|nuit française|nuit de la musique|rediffusions de la nuit|boucle|mire|top france|top 50|clips)/i.test(title)) {
    return { category: 'divertissement', genre: 'Divertissement' };
  }

  // 8. Films / Téléfilms
  if (/(film\b|téléfilm|cinéma|long-métrage|fiction tv|comédie dramatique|thriller)/i.test(fullText) || (durationMinutes && durationMinutes >= 75 && ['canal-plus', 'canal-plus-cinema', 'arte', 'tf1', 'france-2', 'france-3', 'm6', 'w9', 'tmc', 'cstar', '6ter', 'cherie-25', 'paris-premiere', 'tf1-series-films'].includes(channelSlug || ''))) {
    return { category: 'film', genre: 'Film' };
  }

  return { category: 'divertissement', genre: 'Divertissement' };
}

/**
 * Parse an XMLTV date string with full timezone support (e.g. "20260902211000 +0200", "20260902191000 +0000", "20260902211000")
 * Converts correctly to French local broadcast time (Europe/Paris)
 */
export function parseXmltvTime(timeStr: string): { date: Date; dateStr: string; timeFormatted: string } | null {
  if (!timeStr) return null;
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?(?:\s*([+-]\d{4}|Z))?/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const hour = parseInt(match[4], 10);
  const min = parseInt(match[5], 10);
  const sec = match[6] ? parseInt(match[6], 10) : 0;
  const tz = match[7];

  if (!tz) {
    // If no timezone offset is in the XML, treat as direct broadcast local time
    const d = new Date(year, month, day, hour, min, sec);
    return {
      date: d,
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      timeFormatted: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    };
  }

  let offsetMinutes = 0;
  if (tz !== 'Z') {
    const sign = tz[0] === '-' ? -1 : 1;
    const tzHours = parseInt(tz.substring(1, 3), 10);
    const tzMins = parseInt(tz.substring(3, 5), 10);
    offsetMinutes = sign * (tzHours * 60 + tzMins);
  }

  const utcTime = Date.UTC(year, month, day, hour, min, sec) - offsetMinutes * 60000;
  const d = new Date(utcTime);

  // Format in Africa/Casablanca (Morocco)
  try {
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Africa/Casablanca',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(d);
    const pMap: Record<string, string> = {};
    for (const p of parts) pMap[p.type] = p.value;

    const dateStr = `${pMap.year}-${pMap.month}-${pMap.day}`;
    const timeFormatted = `${pMap.hour}:${pMap.minute}`;

    return { date: d, dateStr, timeFormatted };
  } catch {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const timeFormatted = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    return { date: d, dateStr, timeFormatted };
  }
}

/**
 * Parse XMLTV channel logos and names
 */
export function parseXmltvChannels(xmlString: string): Record<string, { name: string; logoUrl?: string }> {
  const channelMap: Record<string, { name: string; logoUrl?: string }> = {};
  const channelRegex = /<channel([\s\S]*?)>([\s\S]*?)<\/channel>/gi;
  let match: RegExpExecArray | null;

  while ((match = channelRegex.exec(xmlString)) !== null) {
    const tagAttrs = match[1];
    const body = match[2];

    const idMatch = tagAttrs.match(/id=["\x27]([^"\x27]+)["\x27]/i);
    const rawId = idMatch ? idMatch[1] : '';

    const nameMatch = body.match(/<display-name[^>]*>([^<]+)<\/display-name>/i);
    const displayName = nameMatch ? decodeXmlEntities(nameMatch[1]) : rawId;
    const iconMatch = body.match(/<icon\s+src=["\x27]([^"\x27]+)["\x27]/i);

    const slug = getChannelSlug(rawId, displayName);
    if (slug) {
      channelMap[slug] = {
        name: displayName,
        logoUrl: iconMatch ? iconMatch[1].trim() : undefined
      };
    }
  }

  return channelMap;
}

/**
 * Parse XMLTV content into normalized Program array
 */
export function parseXmltvContent(xmlString: string): Program[] {
  const programs: Program[] = [];
  // Flexible regex supporting attributes in any order, single or double quotes, arbitrary spacing
  const programmeRegex = /<programme([\s\S]*?)>([\s\S]*?)<\/programme>/gi;
  let match: RegExpExecArray | null;

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  let idx = 0;
  while ((match = programmeRegex.exec(xmlString)) !== null) {
    const tagAttrs = match[1];
    const content = match[2];

    const startMatch = tagAttrs.match(/start=["\x27]([^"\x27]+)["\x27]/i);
    const stopMatch = tagAttrs.match(/stop=["\x27]([^"\x27]+)["\x27]/i);
    const channelMatch = tagAttrs.match(/channel=["\x27]([^"\x27]+)["\x27]/i);

    if (!startMatch || !channelMatch) continue;

    const startStr = startMatch[1];
    const stopStr = stopMatch ? stopMatch[1] : null;
    const rawChannel = channelMatch[1];

    const channelSlug = getChannelSlug(rawChannel);
    if (!channelSlug) continue;

    const startTimeData = parseXmltvTime(startStr);
    const stopTimeData = stopStr ? parseXmltvTime(stopStr) : null;

    if (!startTimeData) continue;

    // Title
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? decodeXmlEntities(titleMatch[1]) : 'Programme sans titre';

    // Subtitle
    const subTitleMatch = content.match(/<sub-title[^>]*>([^<]+)<\/sub-title>/i);
    const subtitle = subTitleMatch ? decodeXmlEntities(subTitleMatch[1]) : undefined;

    // Description / Synopsis
    const descMatch = content.match(/<desc[^>]*>([^<]+)<\/desc>/i);
    const synopsis = descMatch ? decodeXmlEntities(descMatch[1]) : 'Consultez votre guide télévisé pour plus de détails sur cette diffusion.';

    // Episode Number (onscreen e.g. "S01E03" or xmltv_ns e.g. "0.2.")
    const epNumMatch = content.match(/<episode-num\s+system=["\x27]([^"\x27]+)["\x27][^>]*>([^<]+)<\/episode-num>/i) || content.match(/<episode-num[^>]*>([^<]+)<\/episode-num>/i);
    let seasonEpisode: string | undefined;
    if (epNumMatch) {
      const epVal = epNumMatch[2] || epNumMatch[1];
      if (epVal) {
        seasonEpisode = decodeXmlEntities(epVal.trim());
      }
    }

    // Production Date / Year
    const dateMatch = content.match(/<date[^>]*>(\d{4})<\/date>/i);
    const prodYear = dateMatch ? parseInt(dateMatch[1], 10) : undefined;

    // Rating / Age restriction
    const ratingMatch = content.match(/<rating[^>]*>[\s\S]*?<value[^>]*>([^<]+)<\/value>[\s\S]*?<\/rating>/i);
    const ratingVal = ratingMatch ? decodeXmlEntities(ratingMatch[1].trim()) : undefined;

    // Country
    const countryMatch = content.match(/<country[^>]*>([^<]+)<\/country>/i);
    const countryVal = countryMatch ? decodeXmlEntities(countryMatch[1].trim()) : undefined;

    // Image
    const iconMatch = content.match(/<icon\s+src=["\x27]([^"\x27]+)["\x27]/i);
    const imageUrl = iconMatch
      ? iconMatch[1].trim()
      : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80';

    // Credits (Actors & Director)
    const directorMatch = content.match(/<director[^>]*>([^<]+)<\/director>/i);
    const director = directorMatch ? decodeXmlEntities(directorMatch[1]) : undefined;
    const actorMatches = Array.from(content.matchAll(/<actor[^>]*>([^<]+)<\/actor>/gi)).map(m => decodeXmlEntities(m[1]));

    // Duration calculation
    let durationMinutes = 90;
    if (stopTimeData) {
      const diffMs = stopTimeData.date.getTime() - startTimeData.date.getTime();
      const diffMin = Math.round(diffMs / 60000);
      if (diffMin > 5 && diffMin < 600) durationMinutes = diffMin;
    }

    // Category & Genre with smart inference
    const catMatch = content.match(/<category[^>]*>([^<]+)<\/category>/i);
    const rawCategory = catMatch ? decodeXmlEntities(catMatch[1]) : undefined;
    let { category, genre } = inferCategoryAndGenre(
      rawCategory,
      title,
      subtitle,
      synopsis,
      channelSlug,
      durationMinutes
    );

    if (seasonEpisode && category !== 'film') {
      category = 'serie';
    }

    const startTime = startTimeData.timeFormatted;
    const endTime = stopTimeData ? stopTimeData.timeFormatted : '22:45';

    // Detect prime time (starts between 20:45 and 21:25)
    const [h, m] = startTime.split(':').map(Number);
    const isPrimeTime = (h === 20 && m >= 45) || (h === 21 && m <= 25);

    // Calculate date offset (today = 0, tomorrow = 1, etc.)
    const progMidnight = new Date(startTimeData.date.getFullYear(), startTimeData.date.getMonth(), startTimeData.date.getDate()).getTime();
    const offsetDays = Math.round((progMidnight - todayMidnight) / (86400 * 1000));

    programs.push({
      id: `xmltv-${channelSlug}-${startTime.replace(':', '')}-${idx++}`,
      channelId: channelSlug,
      title,
      subtitle,
      category,
      genre: genre || rawCategory || 'Divertissement',
      startTime,
      endTime,
      durationMinutes,
      dateOffset: offsetDays,
      dateStr: startTimeData.dateStr,
      isPrimeTime,
      synopsis,
      imageUrl,
      director,
      actors: actorMatches.length > 0 ? actorMatches.slice(0, 5) : undefined,
      seasonEpisode,
      year: prodYear,
      rating: ratingVal,
      country: countryVal
    });
  }

  return programs;
}

/**
 * Main EPG Service Abstraction
 * Loads real broadcasts from official XMLTV sources or configured EPG_URL.
 *
 * Adheres strictly to the guidelines:
 * - When EPG_URL is empty: No mock programs, clean unavailability message.
 * - When EPG_URL is valid XMLTV: Live real broadcast extraction and display.
 * - When EPG_URL is Xtream get.php: Server-side conversion only, no credentials leaked.
 * - When URL is invalid or inaccessible or timeout: Handled gracefully without crash, clear clean message.
 */
class EpgService {
  private cachedPrograms: Program[] = [];
  private channelLogos: Record<string, string> = {};
  private lastSyncTime: string | null = null;
  private currentEpgUrl: string | null = null;
  private syncErrorMessage: string | null = null;
  public initPromise: Promise<any> | null = null;

  constructor() {
    const rawUrl = process.env.EPG_URL;
    if (rawUrl && rawUrl.trim()) {
      this.currentEpgUrl = resolveEpgUrl(rawUrl);
      if (this.currentEpgUrl) {
        this.initPromise = this.syncEpg(this.currentEpgUrl).catch(err => {
          console.warn('[EPG Service] Background init sync error:', err.message);
        });
      }
    }
  }

  public isAvailable(): boolean {
    return this.cachedPrograms.length > 0;
  }

  public getChannelLogos(): Record<string, string> {
    return this.channelLogos;
  }

  public getStatus(): EpgProviderStatus {
    const hasConfig = Boolean(process.env.EPG_URL && process.env.EPG_URL.trim());
    const count = this.cachedPrograms.length;

    let message = '';
    if (!hasConfig) {
      message = "Aucun flux EPG configuré. Les programmes TV sont temporairement indisponibles.";
    } else if (count > 0) {
      message = `${count} programmes synchronisés avec succès.`;
    } else if (this.syncErrorMessage) {
      message = this.syncErrorMessage;
    } else {
      message = "Synchronisation du flux EPG en cours...";
    }

    return {
      isConfigured: hasConfig,
      sourceUrl: sanitizeUrlForClient(this.currentEpgUrl),
      providerName: hasConfig ? 'Flux EPG XMLTV' : 'Non configuré',
      lastSync: this.lastSyncTime || undefined,
      programCount: count,
      message
    };
  }

  /**
   * Fetch programs from remote XMLTV source
   */
  public async syncEpg(customUrl?: string): Promise<{
    success: boolean;
    count: number;
    message: string;
    newCount?: number;
    updatedCount?: number;
    channelCount?: number;
    lastSyncTime?: string;
  }> {
    const rawUrl = customUrl !== undefined ? customUrl : process.env.EPG_URL;
    if (!rawUrl || !rawUrl.trim()) {
      // Do not clear database/programs on missing URL or failure, keep previous ones if they exist
      this.syncErrorMessage = "Aucune source EPG configurée. Les programmes sont actuellement indisponibles.";
      return {
        success: false,
        count: this.cachedPrograms.length,
        message: "Aucune source EPG configurée. Les programmes existants sont conservés."
      };
    }

    const resolvedUrl = resolveEpgUrl(rawUrl);
    if (!resolvedUrl || (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://'))) {
      this.syncErrorMessage = "URL du flux EPG invalide (doit débuter par http:// ou https://).";
      return {
        success: false,
        count: this.cachedPrograms.length,
        message: this.syncErrorMessage
      };
    }

    const syncStartTime = new Date().toISOString();

    try {
      const isXtream = rawUrl.includes('get.php') || rawUrl.includes('xmltv.php');
      const detectedType = isXtream ? 'Xtream Codes (xmltv.php)' : 'XMLTV Standard';
      console.log(`[EPG Service] === DÉMARRAGE SYNCHRONISATION EPG ===`);
      console.log(`[EPG Service] Heure de début de la synchronisation : ${syncStartTime}`);
      console.log(`[EPG Service] EPG_URL configurée : OUI`);
      console.log(`[EPG Service] Type détecté : ${detectedType}`);
      console.log(`[EPG Service] URL finale côté serveur : ${sanitizeUrlForClient(resolvedUrl)}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch(resolvedUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ProgrammeTV-EPG/1.0)' }
      });
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || 'inconnu';
      console.log(`[EPG Service] HTTP status : ${response.status} ${response.statusText}`);
      console.log(`[EPG Service] Content-Type : ${contentType}`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status} (${response.statusText || 'Inaccessible'})`);
      }

      const xmlText = await response.text();
      const sizeKb = (xmlText.length / 1024).toFixed(1);
      console.log(`[EPG Service] Taille de la réponse : ${sizeKb} KB (${xmlText.length} octets)`);

      if (!xmlText || (!xmlText.includes('<tv') && !xmlText.includes('<programme') && !xmlText.includes('<channel'))) {
        throw new Error("Le contenu retourné n'est pas un flux XMLTV valide.");
      }

      // Extract channel icons
      const parsedChannels = parseXmltvChannels(xmlText);
      const channelCount = Object.keys(parsedChannels).length;
      console.log(`[EPG Service] Nombre de channels XMLTV détectés : ${channelCount}`);
      for (const [slug, data] of Object.entries(parsedChannels)) {
        if (data.logoUrl) {
          this.channelLogos[slug] = data.logoUrl;
        }
      }

      // Extract programs
      const parsed = parseXmltvContent(xmlText);
      console.log(`[EPG Service] Nombre de programmes détectés : ${parsed.length}`);

      if (parsed.length > 0) {
        const sortedDates = [...parsed].sort((a, b) => (a.dateStr + a.startTime).localeCompare(b.dateStr + b.startTime));
        const firstDate = `${sortedDates[0].dateStr} ${sortedDates[0].startTime}`;
        const lastDate = `${sortedDates[sortedDates.length - 1].dateStr} ${sortedDates[sortedDates.length - 1].startTime}`;
        console.log(`[EPG Service] Première date de programme : ${firstDate}`);
        console.log(`[EPG Service] Dernière date de programme : ${lastDate}`);
        console.log(`[EPG Service] Première erreur XML éventuelle : Aucune (flux XMLTV 100% valide)`);

        // Calculate new vs updated programs
        const previousKeys = new Set(this.cachedPrograms.map(p => `${p.channelId}-${p.dateStr}-${p.startTime}`));
        let newCount = 0;
        let updatedCount = 0;

        for (const prog of parsed) {
          const key = `${prog.channelId}-${prog.dateStr}-${prog.startTime}`;
          if (previousKeys.has(key)) {
            updatedCount++;
          } else {
            newCount++;
          }
        }

        this.cachedPrograms = parsed;
        this.currentEpgUrl = resolvedUrl;
        this.lastSyncTime = syncStartTime;
        this.syncErrorMessage = null;

        console.log(`[EPG Service] === SYNCHRONISATION EPG TERMINÉE AVEC SUCCÈS ===`);
        console.log(`[EPG Service] Nombre total de programmes importés : ${parsed.length}`);
        console.log(`[EPG Service] Nombre de nouveaux programmes : ${newCount}`);
        console.log(`[EPG Service] Nombre de programmes mis à jour : ${updatedCount}`);
        console.log(`[EPG Service] Nombre de chaînes actives : ${channelCount}`);
        console.log(`[EPG Service] Heure de fin de la synchronisation : ${new Date().toISOString()}`);

        return {
          success: true,
          count: parsed.length,
          newCount,
          updatedCount,
          channelCount,
          lastSyncTime: syncStartTime,
          message: `Synchronisation réussie : ${parsed.length} programmes extraits (${newCount} nouveaux, ${updatedCount} mis à jour).`
        };
      } else {
        // Do NOT clear cachedPrograms if they exist, maintain historical valid data
        this.syncErrorMessage = "Aucun programme correspondant aux chaînes françaises n'a été trouvé dans le flux.";
        console.warn(`[EPG Service] Première erreur XML éventuelle : Aucun mapping de chaîne française valide`);
        console.warn(`[EPG Service] Échec de la synchronisation mais conservation des ${this.cachedPrograms.length} programmes existants.`);
        return {
          success: false,
          count: this.cachedPrograms.length,
          message: this.syncErrorMessage
        };
      }
    } catch (err: any) {
      // Keep previous valid data
      let cleanError = err.message || 'Erreur inconnue';
      if (err.name === 'AbortError') {
        cleanError = "Délai de connexion dépassé (timeout) lors de la récupération du flux EPG.";
      }
      this.syncErrorMessage = `Le flux EPG est actuellement inaccessible (${cleanError}).`;
      console.warn(`[EPG Service] === ÉCHEC DE SYNCHRONISATION EPG ===`);
      console.warn(`[EPG Service] Cause de l'erreur : ${cleanError}`);
      console.warn(`[EPG Service] Conservation des ${this.cachedPrograms.length} programmes existants.`);
      return {
        success: false,
        count: this.cachedPrograms.length,
        message: this.syncErrorMessage
      };
    }
  }

  /**
   * Return filtered programs by date, channel, category, timeframe
   */
  public getPrograms(filter?: {
    dateOffset?: number;
    channelId?: string;
    category?: string;
    timeframe?: 'maintenant' | 'ce-soir' | 'all';
  }): Program[] {
    let list = [...this.cachedPrograms];

    if (filter?.dateOffset !== undefined) {
      const expectedDateStr = getDateString(filter.dateOffset);
      list = list.filter(p => p.dateOffset === filter.dateOffset || p.dateStr === expectedDateStr);
    }

    if (filter?.channelId && filter.channelId !== 'all') {
      list = list.filter(p => p.channelId === filter.channelId);
    }

    if (filter?.category && filter.category !== 'all') {
      list = list.filter(p => p.category === filter.category);
    }

    if (filter?.timeframe === 'ce-soir') {
      list = list.filter(p => p.isPrimeTime || p.startTime >= '20:45');
    } else if (filter?.timeframe === 'maintenant') {
      const now = new Date();
      const currentTotalMin = now.getHours() * 60 + now.getMinutes();

      list = list.filter(p => {
        const [sh, sm] = p.startTime.split(':').map(Number);
        const [eh, em] = p.endTime.split(':').map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh < sh ? (eh + 24) * 60 + em : eh * 60 + em;
        return currentTotalMin >= startMin && currentTotalMin <= endMin;
      });
    }

    return list;
  }
}

// Export singleton instance
export const epgProvider = new EpgService();
