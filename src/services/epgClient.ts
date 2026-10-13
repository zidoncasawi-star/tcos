import { Program } from '../types';

// Constants
const EPG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL
const LOCAL_STORAGE_PREFIX = 'epg_cache_offset_';

export interface EpgResponse {
  programs: Program[];
  total: number;
  available: boolean;
  message?: string;
  dateStr: string;
}

// In-Memory Cache
const memoryCache = new Map<number, { data: EpgResponse; timestamp: number }>();

// Request Deduplication Store (shares active promises for identical requests)
const activeFetches = new Map<number, Promise<EpgResponse>>();

/**
 * Normalizes and validates EPG API responses to ensure absolute reliability.
 */
function normalizeEpgResponse(raw: any): EpgResponse {
  const programs = Array.isArray(raw) 
    ? raw 
    : (raw && Array.isArray(raw.programs) ? raw.programs : []);
  
  return {
    programs,
    total: programs.length,
    available: programs.length > 0,
    message: raw?.message,
    dateStr: raw?.dateStr || new Date().toISOString().split('T')[0]
  };
}

/**
 * Reads EPG cache from LocalStorage for durable cross-session speed.
 */
function getLocalStorageCache(offset: number): { data: EpgResponse; timestamp: number } | null {
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${offset}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    const parsed = JSON.parse(raw);
    if (parsed && parsed.data && typeof parsed.timestamp === 'number') {
      return parsed;
    }
  } catch (e) {
    console.warn(`[EPG Local Cache] Erreur de lecture pour l'offset ${offset}:`, e);
  }
  return null;
}

/**
 * Writes EPG cache to LocalStorage.
 */
function setLocalStorageCache(offset: number, data: EpgResponse, timestamp: number) {
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${offset}`;
    localStorage.setItem(key, JSON.stringify({ data, timestamp }));
  } catch (e) {
    console.warn(`[EPG Local Cache] Erreur d'écriture pour l'offset ${offset}:`, e);
  }
}

/**
 * Returns cached data immediately if it exists and is fresh (within 5 minutes).
 */
export function getFreshCache(offset: number): EpgResponse | null {
  const now = Date.now();
  
  // Try memory first
  const memCached = memoryCache.get(offset);
  if (memCached && (now - memCached.timestamp < EPG_CACHE_TTL)) {
    return memCached.data;
  }
  
  // Try localStorage
  const lsCached = getLocalStorageCache(offset);
  if (lsCached && (now - lsCached.timestamp < EPG_CACHE_TTL)) {
    // Populate memory cache for faster subsequent lookups
    memoryCache.set(offset, lsCached);
    return lsCached.data;
  }
  
  return null;
}

/**
 * Fetches EPG data using Stale-While-Revalidate (SWR) logic.
 * 
 * 1. If fresh cache is available: serves it instantly, triggers background validation silently.
 * 2. If stale cache is available (expired or older): serves it instantly (preventing loading screens/skeletons)
 *    and launches a background request to fetch fresh data.
 * 3. If no cache exists: triggers loading state, shows skeletons, fetches fresh data.
 * 
 * Automatically deduplicates identical network requests.
 */
export async function getEpgData(
  offset: number,
  onUpdate?: (data: EpgResponse, source: 'cache' | 'network') => void
): Promise<EpgResponse> {
  const now = Date.now();
  
  // Retrieve cache entries
  const memCached = memoryCache.get(offset);
  const lsCached = memCached || getLocalStorageCache(offset);
  
  // If we have stale or fresh cache, deliver it instantly to avoid layout flashes
  if (lsCached) {
    if (memCached) {
      onUpdate?.(memCached.data, 'cache');
    } else if (lsCached) {
      memoryCache.set(offset, lsCached);
      onUpdate?.(lsCached.data, 'cache');
    }
    
    // If it is completely fresh (less than 5 minutes old), we do not need to fetch again
    if (now - lsCached.timestamp < EPG_CACHE_TTL) {
      return lsCached.data;
    }
  }

  // Deduplicate network request
  let fetchPromise = activeFetches.get(offset);
  if (!fetchPromise) {
    fetchPromise = fetch(`/api/epg?dateOffset=${offset}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const rawJson = await res.json();
        const normalized = normalizeEpgResponse(rawJson);
        
        // Save to caches
        const entry = { data: normalized, timestamp: Date.now() };
        memoryCache.set(offset, entry);
        setLocalStorageCache(offset, normalized, entry.timestamp);
        
        return normalized;
      })
      .finally(() => {
        activeFetches.delete(offset);
      });
      
    activeFetches.set(offset, fetchPromise);
  }

  try {
    const freshData = await fetchPromise;
    onUpdate?.(freshData, 'network');
    return freshData;
  } catch (error) {
    console.error(`[EPG Network Fetch] Failed to fetch offset ${offset}:`, error);
    
    // In case of error, if we have stale cache, return it so the app is still functional (offline-first resilience)
    if (lsCached) {
      console.log(`[EPG Network Fetch] Servir les données expirées en cache de secours suite à une erreur réseau.`);
      return lsCached.data;
    }
    throw error;
  }
}

/**
 * Preloads EPG data for a list of offsets in the background without blocking render.
 */
export function preloadOffsets(offsets: number[]) {
  offsets.forEach(offset => {
    // Only fetch if we don't already have a fresh cache
    if (!getFreshCache(offset)) {
      getEpgData(offset).catch(() => {});
    }
  });
}
