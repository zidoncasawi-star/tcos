import React, { useState, useEffect } from 'react';
import { Channel, Program, IptvPlan } from './types';
import { CHANNELS, MOCK_PROGRAMS } from './data/mockEpg';
import { IPTV_PLANS } from './data/iptvPlans';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProgramDetailModal } from './components/ProgramDetailModal';
import { CookieBanner } from './components/CookieBanner';
import { WhatsAppButton } from './components/WhatsAppButton';
import { IptvPlansSection } from './components/IptvPlansSection';

import { HomePage } from './pages/HomePage';
import { ProgrammeTvPage } from './pages/ProgrammeTvPage';
import { ChannelDetailPage } from './pages/ChannelDetailPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { IptvPage } from './pages/IptvPage';
import { IptvDetailPage } from './pages/IptvDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LegalPage } from './pages/LegalPage';
import { AdminPage } from './pages/AdminPage';
import { MatchsEnDirectPage } from './pages/MatchsEnDirectPage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { getEpgData, preloadOffsets } from './services/epgClient';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [channels, setChannels] = useState<Channel[]>(CHANNELS);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [iptvPlans, setIptvPlans] = useState<IptvPlan[]>(IPTV_PLANS);
  const [isEpgLoading, setIsEpgLoading] = useState<boolean>(true);
  const [isEpgError, setIsEpgError] = useState<boolean>(false);

  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [openCookieSettings, setOpenCookieSettings] = useState<boolean>(false);

  // Sync state from server API
  const refreshData = async () => {
    setIsEpgLoading(true);
    setIsEpgError(false);
    try {
      const [resCh, resPlans] = await Promise.all([
        fetch('/api/channels').then(r => r.ok ? r.json() : null),
        fetch('/api/iptv/plans').then(r => r.ok ? r.json() : null)
      ]);

      if (resCh) {
        const channelList = Array.isArray(resCh) ? resCh : resCh.channels;
        if (Array.isArray(channelList) && channelList.length > 0) setChannels(channelList);
      }
      if (resPlans) {
        const planList = Array.isArray(resPlans) ? resPlans : resPlans.plans;
        if (Array.isArray(planList) && planList.length > 0) setIptvPlans(planList);
      }

      // Fetch EPG via the custom frontend SWR caching client
      await getEpgData(selectedDateOffset, (resEpg) => {
        if (resEpg && Array.isArray(resEpg.programs)) {
          setPrograms(resEpg.programs);
          setIsEpgLoading(false);
        }
      });
    } catch (e) {
      console.error('[EPG Load Error]:', e);
      setIsEpgError(true);
      setIsEpgLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedDateOffset]);

  // Proactive background preloading of adjacent EPG days
  useEffect(() => {
    preloadOffsets([selectedDateOffset - 1, selectedDateOffset + 1, selectedDateOffset + 2, selectedDateOffset + 3]);
  }, [selectedDateOffset]);

  // Track page views in Google Analytics on route changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: currentPath,
        page_location: window.location.href,
        page_title: document.title
      });
    }
  }, [currentPath]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  // Helper to extract search param if any
  const getSearchParam = (param: string) => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    return params.get(param);
  };

  // Router renderer
  const renderCurrentView = () => {
    const path = currentPath;

    // Homepage
    if (path === '/' || path === '') {
      return (
        <HomePage
          channels={channels}
          programs={programs}
          iptvPlans={iptvPlans}
          selectedDateOffset={selectedDateOffset}
          onDateChange={setSelectedDateOffset}
          onNavigate={navigate}
          onSelectProgram={setSelectedProgram}
          isEpgLoading={isEpgLoading}
          isEpgError={isEpgError}
        />
      );
    }

    // Matchs en direct
    if (path === '/matchs-en-direct') {
      return <MatchsEnDirectPage onNavigate={navigate} />;
    }
    if (path.startsWith('/matchs-en-direct/')) {
      const matchId = path.replace('/matchs-en-direct/', '');
      return <MatchDetailPage matchId={matchId} onNavigate={navigate} />;
    }

    // Programme TV subviews
    if (path === '/programme-tv' || path === '/programme-tv/toutes-les-chaines') {
      return (
        <ProgrammeTvPage
          subview={path === '/programme-tv/toutes-les-chaines' ? 'toutes-les-chaines' : 'all'}
          channels={channels}
          programs={programs}
          selectedDateOffset={selectedDateOffset}
          onDateChange={setSelectedDateOffset}
          onNavigate={navigate}
          onSelectProgram={setSelectedProgram}
          isEpgLoading={isEpgLoading}
          isEpgError={isEpgError}
        />
      );
    }

    if (path === '/programme-tv/ce-soir') {
      return (
        <ProgrammeTvPage
          subview="ce-soir"
          channels={channels}
          programs={programs}
          selectedDateOffset={selectedDateOffset}
          onDateChange={setSelectedDateOffset}
          onNavigate={navigate}
          onSelectProgram={setSelectedProgram}
          isEpgLoading={isEpgLoading}
          isEpgError={isEpgError}
        />
      );
    }

    if (path === '/programme-tv/maintenant') {
      return (
        <ProgrammeTvPage
          subview="maintenant"
          channels={channels}
          programs={programs}
          selectedDateOffset={selectedDateOffset}
          onDateChange={setSelectedDateOffset}
          onNavigate={navigate}
          onSelectProgram={setSelectedProgram}
          isEpgLoading={isEpgLoading}
          isEpgError={isEpgError}
        />
      );
    }

    if (path === '/programme-tv/tnt') {
      return (
        <ProgrammeTvPage
          subview="tnt"
          channels={channels}
          programs={programs}
          selectedDateOffset={selectedDateOffset}
          onDateChange={setSelectedDateOffset}
          onNavigate={navigate}
          onSelectProgram={setSelectedProgram}
          isEpgLoading={isEpgLoading}
          isEpgError={isEpgError}
        />
      );
    }

    if (path === '/films' || path === '/programme-tv/films-ce-soir') {
      return (
        <ProgrammeTvPage
          subview="films"
          channels={channels}
          programs={programs}
          selectedDateOffset={selectedDateOffset}
          onDateChange={setSelectedDateOffset}
          onNavigate={navigate}
          onSelectProgram={setSelectedProgram}
          isEpgLoading={isEpgLoading}
          isEpgError={isEpgError}
        />
      );
    }

    if (path === '/sport' || path === '/programme-tv/sport-ce-soir') {
      return (
        <ProgrammeTvPage
          subview="sport"
          channels={channels}
          programs={programs}
          selectedDateOffset={selectedDateOffset}
          onDateChange={setSelectedDateOffset}
          onNavigate={navigate}
          onSelectProgram={setSelectedProgram}
          isEpgLoading={isEpgLoading}
          isEpgError={isEpgError}
        />
      );
    }

    // Channels
    if (path === '/programme-tv/chaines') {
      return (
        <ChannelDetailPage
          channelSlug="chaines"
          channels={channels}
          programs={programs}
          selectedDateOffset={selectedDateOffset}
          onDateChange={setSelectedDateOffset}
          onNavigate={navigate}
          onSelectProgram={setSelectedProgram}
          isEpgLoading={isEpgLoading}
          isEpgError={isEpgError}
        />
      );
    }

    if (path.startsWith('/programme-tv/chaines/')) {
      const slug = path.replace('/programme-tv/chaines/', '');
      return (
        <ChannelDetailPage
          channelSlug={slug}
          channels={channels}
          programs={programs}
          selectedDateOffset={selectedDateOffset}
          onDateChange={setSelectedDateOffset}
          onNavigate={navigate}
          onSelectProgram={setSelectedProgram}
          isEpgLoading={isEpgLoading}
          isEpgError={isEpgError}
        />
      );
    }

    // Movie Detail Page (TMDB Enriched)
    if (path.startsWith('/programme-tv/film/') || path.startsWith('/film/')) {
      const slug = path.startsWith('/programme-tv/film/')
        ? path.replace('/programme-tv/film/', '')
        : path.replace('/film/', '');
      return (
        <MovieDetailPage
          slug={slug}
          channels={channels}
          programs={programs}
          onNavigate={navigate}
          onSelectProgram={setSelectedProgram}
        />
      );
    }

    // Commercial IPTV
    if (path === '/iptv') {
      return (
        <IptvPage
          plans={iptvPlans}
          onNavigate={navigate}
        />
      );
    }

    if (path.startsWith('/iptv/')) {
      const slug = path.replace('/iptv/', '');
      return (
        <IptvDetailPage
          slug={slug}
          onNavigate={navigate}
        />
      );
    }

    // Checkout
    if (path === '/commander' || path.startsWith('/commander?')) {
      const initialPlan = getSearchParam('plan') || '12-mois';
      return (
        <CheckoutPage
          plans={iptvPlans}
          initialPlanSlug={initialPlan}
          onNavigate={navigate}
        />
      );
    }

    // Admin
    if (path === '/admin') {
      return (
        <AdminPage
          channels={channels}
          programs={programs}
          iptvPlans={iptvPlans}
          onNavigate={navigate}
          onRefreshData={refreshData}
        />
      );
    }

    // Legal & Info pages
    const legalPages = [
      'mentions-legales',
      'politique-confidentialite',
      'politique-cookies',
      'conditions-de-vente',
      'remboursement',
      'dmca',
      'avertissement-legal',
      'livraison',
      'a-propos',
      'contact',
      'faq'
    ];

    const matchedLegal = legalPages.find(p => path === `/${p}`);
    if (matchedLegal) {
      return (
        <LegalPage
          pageType={matchedLegal as any}
          onNavigate={navigate}
          onOpenCookieSettings={() => setOpenCookieSettings(true)}
        />
      );
    }

    // Fallback: 404
    return (
      <div className="py-20 text-center space-y-4">
        <h1 className="text-4xl font-black font-serif text-slate-900">404 - Page non trouvée</h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-200 cursor-pointer"
        >
          Retourner au guide TV
        </button>
      </div>
    );
  };

  const selectedChannel = selectedProgram
    ? channels.find(c => c.id === selectedProgram.channelId)
    : undefined;

  const showIptvSection = !currentPath.startsWith('/admin') && 
                          !currentPath.startsWith('/commander') && 
                          currentPath !== '/iptv';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Global Header */}
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        channels={channels}
        programs={programs}
        onSelectProgram={setSelectedProgram}
      />

      {/* Main Layout Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {renderCurrentView()}
        {showIptvSection && (
          <IptvPlansSection plans={iptvPlans} onNavigate={navigate} />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={navigate}
        onOpenCookieSettings={() => setOpenCookieSettings(true)}
      />

      {/* Program Quick Detail Modal */}
      <ProgramDetailModal
        program={selectedProgram}
        channel={selectedChannel}
        onClose={() => setSelectedProgram(null)}
        onNavigateChannel={(slug) => navigate(`/programme-tv/chaines/${slug}`)}
        onNavigateMovie={(slug) => navigate(`/programme-tv/film/${slug}`)}
      />

      {/* Floating WhatsApp Quick Contact Button */}
      <WhatsAppButton variant="floating" />

      {/* Cookie Consent Banner & Modal */}
      <CookieBanner
        isOpenModalForce={openCookieSettings}
        onCloseModalForce={() => setOpenCookieSettings(false)}
        onNavigate={navigate}
      />
    </div>
  );
}
