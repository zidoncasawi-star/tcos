import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { CHANNELS, MOCK_PROGRAMS, getDateString } from './src/data/mockEpg';
import { IPTV_PLANS } from './src/data/iptvPlans';
import { Order, OrderStatus } from './src/types';
import { epgProvider } from './src/services/epgProvider';
import { batchEnrichPrograms, enrichProgram, isMovieEligible, isEligibleForTmdb } from './src/services/tmdbService';
import { SmartProgramImageResolver, applySmartImageToProgram } from './src/services/smartImageResolver';
import { slugifyTitle } from './src/pages/MovieDetailPage';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for orders and catalog
let ordersStore: Order[] = [
  {
    id: 'ord-demo-1',
    planId: 'plan-12-mois',
    planName: 'Formule Annuelle VIP',
    durationMonths: 12,
    amount: 36.99,
    currency: 'EUR',
    customerName: 'Marc Lefebvre',
    customerEmail: 'm.lefebvre@example.fr',
    customerPhone: '+33612345678',
    deviceType: 'Smart TV LG (webOS)',
    paymentMethod: 'whatsapp',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    notes: 'Identifiants envoyés par email.'
  },
  {
    id: 'ord-demo-2',
    planId: 'plan-3-mois',
    planName: 'Formule Découverte',
    durationMonths: 3,
    amount: 16.99,
    currency: 'EUR',
    customerName: 'Sophie Bernard',
    customerEmail: 'sophie.b@example.fr',
    customerPhone: '+33698765432',
    deviceType: 'TiviMate (Fire TV Stick)',
    paymentMethod: 'whatsapp',
    status: 'processing',
    createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    notes: 'En attente de validation du code de test.'
  }
];

let customChannels = [...CHANNELS];
let customPrograms = [...MOCK_PROGRAMS];

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    site: 'programmetv.site',
    version: '1.0.0'
  });
});

import { footballService } from './src/services/footballService';

// Football API - Matches list
app.get('/api/football/matches', async (req, res) => {
  try {
    const { date, status, competition } = req.query;
    const matches = await footballService.getMatches({
      date: date as string | undefined,
      status: status as string | undefined,
      competition: competition as string | undefined
    });
    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des matchs' });
  }
});

// Football API - Single match
app.get('/api/football/matches/:id', async (req, res) => {
  try {
    const match = await footballService.getMatchById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match non trouvé' });
    }
    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du match' });
  }
});

// Channels list
app.get('/api/channels', (req, res) => {
  const logos = epgProvider.getChannelLogos();
  const channelsWithLogos = customChannels.map(c => {
    let logo = c.logoUrl;
    const customLogo = logos[c.id];
    // Only use customLogo if it's reachable and not pointing to known unreachable IP
    if (customLogo && !customLogo.includes('51.158.145.100') && !customLogo.includes('103.176.')) {
      logo = customLogo.startsWith('http://')
        ? `/api/image-proxy?url=${encodeURIComponent(customLogo)}`
        : customLogo;
    }
    return {
      ...c,
      logoUrl: logo
    };
  });

  res.json({
    channels: channelsWithLogos,
    total: channelsWithLogos.length
  });
});

// Image Proxy to avoid Mixed Content (HTTP images on HTTPS site)
app.get('/api/image-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return res.status(400).send('Invalid image URL');
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    clearTimeout(timeout);
    if (!response.ok) return res.status(response.status).send('Failed to fetch image');
    const contentType = response.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    res.status(502).send('Image proxy error');
  }
});

// Single channel
app.get('/api/channels/:slug', async (req, res) => {
  const channel = customChannels.find(c => c.slug === req.params.slug || c.id === req.params.slug);
  if (!channel) {
    return res.status(404).json({ error: 'Chaîne non trouvée' });
  }
  const logos = epgProvider.getChannelLogos();
  let logo = logos[channel.id] || channel.logoUrl;
  if (logo && logo.startsWith('http://')) {
    logo = `/api/image-proxy?url=${encodeURIComponent(logo)}`;
  }
  const enrichedChannel = {
    ...channel,
    logoUrl: logo
  };
  const rawPrograms = epgProvider.getPrograms({ channelId: channel.id });
  const enrichedPrograms = await batchEnrichPrograms(rawPrograms);
  const programs = SmartProgramImageResolver.resolveBatch(enrichedPrograms);
  res.json({ channel: enrichedChannel, programs });
});

// Application Config (Safe public parameters, no credentials exposed)
app.get('/api/config', (req, res) => {
  res.json({
    siteUrl: process.env.SITE_URL || 'https://programmetv.site',
    whatsappNumber: process.env.WHATSAPP_NUMBER || '212691606844',
    hasCustomEpgUrl: Boolean(process.env.EPG_URL),
    hasTmdbConfigured: Boolean(process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.trim())
  });
});

// Advanced Server-Side Cache Layer for EPG API
interface EpgCacheEntry {
  data: any;
  timestamp: number;
}

const epgResponseCache = new Map<string, EpgCacheEntry>();
const activeEpgFetches = new Map<string, Promise<any>>();
const BACKEND_CACHE_TTL = 5 * 60 * 1000;  // 5 minutes completely fresh
const BACKEND_STALE_TTL = 60 * 60 * 1000; // 1 hour stale fallback

export function invalidateEpgResponseCache() {
  console.log('[Cache Server] Invalidating EPG Response Cache due to manual trigger or sync update.');
  epgResponseCache.clear();
}

async function fetchAndCacheEpg(
  offsetNum: number | undefined,
  channelId: string | undefined,
  category: string | undefined,
  timeframe: string | undefined,
  cacheKey: string
): Promise<any> {
  // Await EPG initialization if it is running and we have no cached programs yet
  if (epgProvider.initPromise && epgProvider.getPrograms().length === 0) {
    console.log('[API] EPG is still initializing in background. Awaiting sync before returning results...');
    try {
      await epgProvider.initPromise;
    } catch (e) {
      console.error('[API] Error awaiting EPG initPromise:', e);
    }
  }

  const rawPrograms = epgProvider.getPrograms({
    dateOffset: isNaN(offsetNum as number) ? undefined : offsetNum,
    channelId: channelId,
    category: category,
    timeframe: (timeframe as 'maintenant' | 'ce-soir' | 'all') || undefined
  });

  const tmdbEnriched = await batchEnrichPrograms(rawPrograms);
  const programs = SmartProgramImageResolver.resolveBatch(tmdbEnriched);

  const responseData = {
    programs,
    total: programs.length,
    available: programs.length > 0,
    message: programs.length > 0
      ? undefined
      : 'Les programmes TV sont temporairement indisponibles.',
    dateStr: getDateString(offsetNum || 0)
  };

  // Only cache if we successfully retrieved some programs (prevents caching of empty results during sync glitches)
  if (programs.length > 0) {
    epgResponseCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
  }

  return responseData;
}

// EPG Guide - normalized programme data with TMDB movie enrichment & Smart Image Resolution
app.get(['/api/epg', '/api/programs'], async (req, res) => {
  const { dateOffset, channelId, category, timeframe } = req.query;
  const offsetNum = dateOffset !== undefined && dateOffset !== '' ? parseInt(dateOffset as string, 10) : undefined;

  const cacheKey = `epg:offset_${dateOffset || 0}:chan_${channelId || 'all'}:cat_${category || 'all'}:tf_${timeframe || 'all'}`;
  const now = Date.now();
  const cached = epgResponseCache.get(cacheKey);

  // 1. Return fresh cache immediately
  if (cached && (now - cached.timestamp < BACKEND_CACHE_TTL)) {
    return res.json(cached.data);
  }

  // 2. Return stale cache (Stale-While-Revalidate) and launch background fetch
  if (cached && (now - cached.timestamp < BACKEND_STALE_TTL)) {
    res.json(cached.data);
    
    // Background fetch (if not already fetching)
    if (!activeEpgFetches.has(cacheKey)) {
      const bgPromise = fetchAndCacheEpg(offsetNum, channelId as string, category as string, timeframe as string, cacheKey);
      activeEpgFetches.set(cacheKey, bgPromise);
      bgPromise.finally(() => {
        activeEpgFetches.delete(cacheKey);
      });
    }
    return;
  }

  // 3. Complete Cache Miss: Wait for the promise (or share active promise to prevent duplicate concurrent queries)
  let fetchPromise = activeEpgFetches.get(cacheKey);
  if (!fetchPromise) {
    fetchPromise = fetchAndCacheEpg(offsetNum, channelId as string, category as string, timeframe as string, cacheKey);
    activeEpgFetches.set(cacheKey, fetchPromise);
    fetchPromise.finally(() => {
      activeEpgFetches.delete(cacheKey);
    });
  }

  try {
    const resultData = await fetchPromise;
    res.json(resultData);
  } catch (err: any) {
    console.error(`[API EPG Cache Fetcher] Error fetching EPG:`, err.message || err);
    res.status(500).json({ error: 'Erreur interne lors de la récupération EPG' });
  }
});

// Single Program Detail with TMDB enrichment & Smart Image Resolution
app.get('/api/programs/:id', async (req, res) => {
  const { id } = req.params;
  const allProgs = epgProvider.getPrograms();
  const rawProgram = allProgs.find(p => p.id === id);

  if (!rawProgram) {
    return res.status(404).json({ error: 'Programme non trouvé' });
  }

  const tmdbEnriched = await enrichProgram(rawProgram);
  const program = applySmartImageToProgram(tmdbEnriched, true);
  const channel = customChannels.find(c => c.id === program.channelId);

  res.json({
    program,
    channel
  });
});

// Single Movie Detail by Slug with TMDB enrichment & Smart Image Resolution
app.get('/api/programs/movie/:slug', async (req, res) => {
  const { slug } = req.params;
  const allProgs = epgProvider.getPrograms();

  const rawProgram = allProgs.find(p => {
    const s = slugifyTitle(p.title);
    return s === slug || p.id === slug || p.id === `prog-${slug}`;
  });

  if (!rawProgram) {
    return res.status(404).json({ error: 'Film non trouvé' });
  }

  const tmdbEnriched = await enrichProgram(rawProgram);
  const program = applySmartImageToProgram(tmdbEnriched, true);
  const channel = customChannels.find(c => c.id === program.channelId);

  res.json({
    program,
    channel
  });
});

// EPG Provider Status
app.get('/api/epg/status', (req, res) => {
  res.json(epgProvider.getStatus());
});

// EPG Sync trigger (fetches from EPG_URL or custom XMLTV, with graceful error handling)
app.post('/api/epg/sync', async (req, res) => {
  // Requirement 10: Secure endpoint against unauthorized sync triggers
  const authHeader = req.headers['authorization'];
  const queryToken = req.query.token;
  const bodyToken = req.body && req.body.token;
  
  let suppliedToken = '';
  if (authHeader && authHeader.toString().startsWith('Bearer ')) {
    suppliedToken = authHeader.toString().substring(7).trim();
  } else if (queryToken) {
    suppliedToken = queryToken.toString().trim();
  } else if (bodyToken) {
    suppliedToken = bodyToken.toString().trim();
  } else if (req.headers['x-sync-token']) {
    suppliedToken = req.headers['x-sync-token'].toString().trim();
  }

  const expectedToken = process.env.EPG_SYNC_TOKEN || 'secure-sync-token-2026';

  if (!suppliedToken || suppliedToken !== expectedToken) {
    return res.status(401).json({ 
      error: 'Accès non autorisé. Token de synchronisation manquant ou invalide.',
      tip: 'Veuillez passer le token via le paramètre de requête ?token=... ou le header x-sync-token'
    });
  }

  const targetUrl = req.body && 'sourceUrl' in req.body ? req.body.sourceUrl : process.env.EPG_URL;
  const result = await epgProvider.syncEpg(targetUrl);

  // Pre-warm TMDB cache in background for all eligible movies & series if sync succeeded
  if (result.success) {
    invalidateEpgResponseCache();
    if (process.env.TMDB_API_KEY) {
      const eligibleProgs = epgProvider.getPrograms().filter(p => isEligibleForTmdb(p).eligible);
      if (eligibleProgs.length > 0) {
        console.log(`[TMDB Prewarm] Lancement du pré-chargement pour ${eligibleProgs.length} programmes éligibles (films & séries)...`);
        batchEnrichPrograms(eligibleProgs).catch(err => {
          console.warn('[TMDB Prewarm] Erreur lors du pré-chargement:', err.message || err);
        });
      }
    }
  }

  res.json({
    success: result.success,
    message: result.message,
    sourceConfigured: Boolean(targetUrl && targetUrl.trim()),
    syncedProgramsCount: result.count,
    newProgramsCount: result.newCount || 0,
    updatedProgramsCount: result.updatedCount || 0,
    channelCount: result.channelCount || 0,
    lastSyncTime: result.lastSyncTime || new Date().toISOString(),
    timestamp: new Date().toISOString()
  });
});

// IPTV Plans
app.get(['/api/plans', '/api/iptv/plans'], (req, res) => {
  res.json({
    plans: IPTV_PLANS,
    disclaimer: 'Catalogue disponible selon l\'offre et les droits de diffusion applicables.'
  });
});

// Create an order & generate pre-filled WhatsApp message
app.post('/api/orders', (req, res) => {
  const { planId, customerName, customerEmail, customerPhone, deviceType, paymentMethod, notes } = req.body;

  if (!planId || !customerName || !customerEmail) {
    return res.status(400).json({ error: 'Champs obligatoires manquants (offre, nom, email)' });
  }

  const selectedPlan = IPTV_PLANS.find(p => p.id === planId || p.slug === planId);
  if (!selectedPlan) {
    return res.status(404).json({ error: 'Formule d\'abonnement introuvable' });
  }

  const orderNumber = `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    planId: selectedPlan.id,
    planName: selectedPlan.name,
    durationMonths: selectedPlan.durationMonths,
    amount: selectedPlan.price,
    currency: selectedPlan.currency,
    customerName,
    customerEmail,
    customerPhone: customerPhone || '',
    deviceType: deviceType || 'Autre / Non spécifié',
    paymentMethod: paymentMethod || 'whatsapp',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: notes || ''
  };

  ordersStore.unshift(newOrder);

  // Return order with pre-formatted WhatsApp redirect text matching specifications
  const whatsappNum = process.env.WHATSAPP_NUMBER || '212691606844';
  const formattedPrice = `${selectedPlan.price.toFixed(2).replace('.', ',')} €`;
  const whatsappMessage = encodeURIComponent(
    `Bonjour, je souhaite commander l'offre IPTV ${selectedPlan.durationMonths} mois à ${formattedPrice}.\n\n` +
    `Offre : ${selectedPlan.name}\n` +
    `Durée : ${selectedPlan.durationMonths} mois\n` +
    `Prix : ${formattedPrice}\n` +
    `Nombre d'appareils : ${selectedPlan.devices} appareil${selectedPlan.devices > 1 ? 's' : ''}\n` +
    `Référence : ${orderNumber}\n` +
    `Client : ${customerName} (${customerEmail})\n` +
    `Appareil : ${deviceType || 'Smart TV / Box'}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${whatsappMessage}`;

  res.status(201).json({
    success: true,
    order: newOrder,
    orderNumber,
    whatsappUrl
  });
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const order = ordersStore.find(o => o.id === req.params.id || o.id === `ord-${req.params.id}`);
  if (!order) {
    return res.status(404).json({ error: 'Commande introuvable' });
  }
  res.json({ order });
});

// Update order status (Admin / Webhook)
app.post('/api/orders/:id/status', (req, res) => {
  const { status, notes } = req.body;
  const order = ordersStore.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Commande introuvable' });
  }

  const validStatuses: OrderStatus[] = ['pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (notes) order.notes = notes;

  res.json({ success: true, order });
});

// Admin Dashboard stats
app.get('/api/admin/dashboard', (req, res) => {
  const totalRevenue = ordersStore
    .filter(o => o.status === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  res.json({
    totalOrders: ordersStore.length,
    paidOrders: ordersStore.filter(o => o.status === 'paid' || o.status === 'completed').length,
    pendingOrders: ordersStore.filter(o => o.status === 'pending' || o.status === 'processing').length,
    totalRevenue: totalRevenue.toFixed(2),
    channelsCount: customChannels.length,
    programsCount: customPrograms.length,
    orders: ordersStore
  });
});

// Anonymous Cookie Consent Logger (RGPD)
app.post('/api/cookies/consent', (req, res) => {
  const { preferences } = req.body;
  res.json({
    success: true,
    recordedAt: new Date().toISOString(),
    status: 'recorded'
  });
});

// Dynamic XML Sitemap
app.get('/sitemap.xml', (req, res) => {
  const reqHost = req.get('host') || 'iptvcesoir.live';
  const baseUrl = reqHost.includes('localhost') || reqHost.includes('127.0.0.1')
    ? 'https://iptvcesoir.live'
    : `https://${reqHost}`;
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: '/', priority: '1.0', changefreq: 'hourly' },
    { loc: '/programme-tv', priority: '0.9', changefreq: 'hourly' },
    { loc: '/programme-tv/ce-soir', priority: '0.9', changefreq: 'hourly' },
    { loc: '/programme-tv/maintenant', priority: '0.9', changefreq: 'always' },
    { loc: '/programme-tv/tnt', priority: '0.8', changefreq: 'daily' },
    { loc: '/programme-tv/toutes-les-chaines', priority: '0.8', changefreq: 'daily' },
    { loc: '/programme-tv/films-ce-soir', priority: '0.8', changefreq: 'daily' },
    { loc: '/programme-tv/sport-ce-soir', priority: '0.8', changefreq: 'daily' },
    { loc: '/programme-tv/chaines', priority: '0.7', changefreq: 'weekly' },
    { loc: '/films', priority: '0.7', changefreq: 'daily' },
    { loc: '/series', priority: '0.7', changefreq: 'daily' },
    { loc: '/sport', priority: '0.7', changefreq: 'daily' },
    { loc: '/iptv', priority: '0.8', changefreq: 'daily' },
    { loc: '/iptv/abonnement', priority: '0.8', changefreq: 'weekly' },
    { loc: '/iptv/prix', priority: '0.8', changefreq: 'weekly' },
    { loc: '/iptv/1-mois', priority: '0.6', changefreq: 'monthly' },
    { loc: '/iptv/3-mois', priority: '0.7', changefreq: 'monthly' },
    { loc: '/iptv/6-mois', priority: '0.7', changefreq: 'monthly' },
    { loc: '/iptv/12-mois', priority: '0.8', changefreq: 'monthly' },
    { loc: '/iptv/essai', priority: '0.6', changefreq: 'monthly' },
    { loc: '/iptv/smart-tv', priority: '0.7', changefreq: 'monthly' },
    { loc: '/iptv/smarters-pro', priority: '0.7', changefreq: 'monthly' },
    { loc: '/iptv/tivimate', priority: '0.7', changefreq: 'monthly' },
    { loc: '/iptv/guide', priority: '0.6', changefreq: 'monthly' },
    { loc: '/iptv/faq', priority: '0.6', changefreq: 'monthly' },
    { loc: '/faq', priority: '0.5', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.5', changefreq: 'yearly' },
    { loc: '/a-propos', priority: '0.4', changefreq: 'yearly' },
    { loc: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
    { loc: '/politique-confidentialite', priority: '0.3', changefreq: 'yearly' },
    { loc: '/politique-cookies', priority: '0.3', changefreq: 'yearly' },
    { loc: '/conditions-generales', priority: '0.3', changefreq: 'yearly' },
    { loc: '/conditions-de-vente', priority: '0.3', changefreq: 'yearly' },
    { loc: '/remboursement', priority: '0.4', changefreq: 'yearly' },
    { loc: '/dmca', priority: '0.3', changefreq: 'yearly' },
    { loc: '/avertissement-legal', priority: '0.3', changefreq: 'yearly' },
    { loc: '/livraison', priority: '0.3', changefreq: 'yearly' }
  ];

  const channelUrls = customChannels.map(c => ({
    loc: `/programme-tv/chaines/${c.slug}`,
    priority: '0.7',
    changefreq: 'daily'
  }));

  const allUrls = [...staticUrls, ...channelUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  const reqHost = req.get('host') || 'iptvcesoir.live';
  const baseUrl = reqHost.includes('localhost') || reqHost.includes('127.0.0.1')
    ? 'https://iptvcesoir.live'
    : `https://${reqHost}`;
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/
Disallow: /commander

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// -------------------------------------------------------------
// Vite middleware for dev / static for prod
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Programme TV Server] En écoute sur le port ${PORT} (0.0.0.0)`);

    // Requirement 11: Add automatic background synchronization every 15 minutes
    const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
    setInterval(() => {
      console.log('[Scheduler] Déclenchement de la synchronisation automatique de l\'EPG (Toutes les 15 minutes)...');
      epgProvider.syncEpg().then(result => {
        console.log(`[Scheduler] Synchronisation automatique terminée. Succès: ${result.success}, Programmes: ${result.count}`);
        if (result.success) {
          invalidateEpgResponseCache();
        }
      }).catch(err => {
        console.error('[Scheduler] Erreur lors de la synchronisation automatique:', err.message || err);
      });
    }, FIFTEEN_MINUTES_MS);

    // Pre-warm TMDB cache in background on startup
    setTimeout(() => {
      if (process.env.TMDB_API_KEY) {
        const movies = epgProvider.getPrograms().filter(p => isMovieEligible(p));
        if (movies.length > 0) {
          console.log(`[TMDB Service] Pré-chauffage du cache pour ${movies.length} films détectés...`);
          batchEnrichPrograms(movies.slice(0, 40)).catch(() => {});
        }
      }
    }, 3000);
  });
}

startServer();
