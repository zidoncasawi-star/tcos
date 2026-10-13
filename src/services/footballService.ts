export interface FootballTeam {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
}

export interface FootballCompetition {
  id?: string;
  name: string;
  logo?: string;
}

export interface FootballMatch {
  id: string;
  competition: FootballCompetition;
  homeTeam: FootballTeam;
  awayTeam: FootballTeam;
  date: string;
  startTime: string;
  status: "scheduled" | "live" | "halftime" | "finished" | "postponed" | "cancelled" | "abandoned";
  statusText: string;
  minute?: number;
  homeScore?: number;
  awayScore?: number;
}

// Simple in-memory cache
const cache: Record<string, { data: FootballMatch[]; expiresAt: number }> = {};
const LIVE_CACHE_TTL = 30 * 1000; // 30 seconds for live
const DAY_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for normal daily fixtures

function parseApiSportsStatus(short: string): FootballMatch['status'] {
  switch (short) {
    case 'TBD':
    case 'NS':
      return 'scheduled';
    case '1H':
    case '2H':
    case 'ET':
    case 'P':
      return 'live';
    case 'HT':
      return 'halftime';
    case 'FT':
    case 'AET':
    case 'PEN':
      return 'finished';
    case 'PST':
      return 'postponed';
    case 'CANC':
      return 'cancelled';
    case 'ABD':
    case 'AWD':
    case 'WO':
      return 'abandoned';
    case 'INT':
    case 'LIVE':
      return 'live';
    default:
      return 'scheduled';
  }
}

function getStatusText(short: string): string {
  const map: Record<string, string> = {
    'TBD': 'À définir',
    'NS': 'À venir',
    '1H': '1ère mi-temps',
    'HT': 'Mi-temps',
    '2H': '2ème mi-temps',
    'ET': 'Prolongation',
    'P': 'Tirs au but',
    'FT': 'Terminé',
    'AET': 'Term. après prol.',
    'PEN': 'Term. aux tirs au but',
    'PST': 'Reporté',
    'CANC': 'Annulé',
    'ABD': 'Abandonné',
    'AWD': 'Forfait',
    'WO': 'Forfait',
    'INT': 'Interrompu',
    'LIVE': 'En direct'
  };
  return map[short] || short;
}

function normalizeApiSportsResponse(item: any): FootballMatch {
  const fixture = item.fixture;
  const league = item.league;
  const teams = item.teams;
  const goals = item.goals;

  const status = parseApiSportsStatus(fixture.status.short);
  const statusText = getStatusText(fixture.status.short);

  // Extract time from ISO 8601 string using specific timezone Africa/Casablanca
  const dateObj = new Date(fixture.date);
  const startTime = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Africa/Casablanca',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
  
  const dateString = new Intl.DateTimeFormat('fr-CA', { // YYYY-MM-DD
    timeZone: 'Africa/Casablanca',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);

  return {
    id: fixture.id.toString(),
    competition: {
      id: league.id.toString(),
      name: league.name,
      logo: league.logo,
    },
    homeTeam: {
      id: teams.home.id.toString(),
      name: teams.home.name,
      logo: teams.home.logo,
    },
    awayTeam: {
      id: teams.away.id.toString(),
      name: teams.away.name,
      logo: teams.away.logo,
    },
    date: dateString,
    startTime: startTime,
    status: status,
    statusText: statusText,
    minute: status === 'live' && fixture.status.elapsed ? fixture.status.elapsed : undefined,
    homeScore: goals.home !== null ? goals.home : undefined,
    awayScore: goals.away !== null ? goals.away : undefined,
  };
}

export const footballService = {
  getMatches: async (params: { date?: string; status?: string; competition?: string }): Promise<FootballMatch[]> => {
    const apiKey = process.env.FOOTBALL_API_KEY;
    const apiUrl = process.env.FOOTBALL_API_URL || 'https://v3.football.api-sports.io';
    
    // Si pas de clé, on retourne une liste vide gracieusement.
    if (!apiKey) {
      console.warn('[FootballService] FOOTBALL_API_KEY is not set. Football data is unavailable.');
      return [];
    }

    const today = new Date().toISOString().split('T')[0];
    const isLive = params.status === 'live';
    const dateParam = params.date || today;

    const cacheKey = `matches_${dateParam}_${params.status || 'all'}_${params.competition || 'all'}`;
    const now = Date.now();

    if (cache[cacheKey] && cache[cacheKey].expiresAt > now) {
      return cache[cacheKey].data;
    }

    try {
      const axiosParams: Record<string, string> = {
        timezone: 'Africa/Casablanca'
      };
      
      if (isLive) {
        axiosParams.live = 'all';
      } else {
        axiosParams.date = dateParam;
      }

      if (params.competition) {
        axiosParams.league = params.competition;
      }

      const queryParams = new URLSearchParams(axiosParams).toString();
      const response = await fetch(`${apiUrl}/fixtures?${queryParams}`, {
        headers: {
          'x-apisports-key': apiKey
        }
      });
      
      const data = await response.json();

      if (!data || !data.response) {
        throw new Error('Invalid response from football API');
      }

      let matches = data.response.map(normalizeApiSportsResponse);

      // Si le paramètre status=live est demandé mais qu'on a fait une requête par date,
      // on peut filtrer localement (bien que l'API le gère via live=all).
      if (params.status && !isLive) {
          matches = matches.filter((m: FootballMatch) => m.status === params.status);
      }
      
      // Update cache
      const ttl = isLive ? LIVE_CACHE_TTL : DAY_CACHE_TTL;
      cache[cacheKey] = {
        data: matches,
        expiresAt: now + ttl
      };

      return matches;
    } catch (error) {
      console.error('[FootballService] Error fetching matches:', error instanceof Error ? error.message : error);
      // Return stale cache if available
      if (cache[cacheKey]) {
        return cache[cacheKey].data;
      }
      // Ou throw si besoin d'afficher l'erreur
      return [];
    }
  },
  
  getMatchById: async (id: string): Promise<FootballMatch | null> => {
    const apiKey = process.env.FOOTBALL_API_KEY;
    const apiUrl = process.env.FOOTBALL_API_URL || 'https://v3.football.api-sports.io';
    
    if (!apiKey) {
      return null;
    }

    const cacheKey = `match_${id}`;
    const now = Date.now();

    if (cache[cacheKey] && cache[cacheKey].expiresAt > now) {
      return cache[cacheKey].data[0] || null;
    }

    try {
      const response = await fetch(`${apiUrl}/fixtures?id=${id}&timezone=Africa/Casablanca`, {
        headers: {
          'x-apisports-key': apiKey
        }
      });
      
      const data = await response.json();

      if (!data || !data.response || data.response.length === 0) {
        return null;
      }

      const match = normalizeApiSportsResponse(data.response[0]);

      // Cache this single match
      const ttl = match.status === 'live' ? LIVE_CACHE_TTL : DAY_CACHE_TTL;
      cache[cacheKey] = {
        data: [match],
        expiresAt: now + ttl
      };

      return match;
    } catch (error) {
      console.error(`[FootballService] Error fetching match ${id}:`, error instanceof Error ? error.message : error);
      if (cache[cacheKey] && cache[cacheKey].data.length > 0) {
        return cache[cacheKey].data[0];
      }
      return null;
    }
  }
};
