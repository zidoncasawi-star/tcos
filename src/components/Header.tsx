import React, { useState } from 'react';
import { Tv, Search, Menu, X, Sparkles, ChevronRight, Film, Trophy, Radio, Clock } from 'lucide-react';
import { Channel, Program } from '../types';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
  channels: Channel[];
  programs: Program[];
  onSelectProgram: (program: Program) => void;
}

export const Header: React.FC<Props> = ({
  currentPath,
  onNavigate,
  channels,
  programs,
  onSelectProgram
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const navLinks = [
    { label: 'Programme TV (EPG)', path: '/programme-tv' },
    { label: 'Ce soir', path: '/programme-tv/ce-soir' },
    { label: 'Direct', path: '/programme-tv/maintenant' },
    { label: 'Matchs', path: '/matchs-en-direct' },
    { label: 'TNT', path: '/programme-tv/tnt' },
    { label: 'Chaînes', path: '/programme-tv/chaines' },
    { label: 'Films', path: '/films' },
    { label: 'Sport', path: '/sport' },
    { label: 'IPTV', path: '/iptv' }
  ];

  // Real-time search filter
  const filteredPrograms = searchQuery.trim().length > 1
    ? programs.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.actors && p.actors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())))
      ).slice(0, 5)
    : [];

  const filteredChannels = searchQuery.trim().length > 1
    ? channels.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setSearchQuery('');
    setSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Editorial Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Guide TV en direct
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">France & TNT métropolitaine</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Édition {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <button onClick={() => onNavigate('/faq')} className="hover:text-white transition-colors cursor-pointer">
              Aide & FAQ
            </button>
            <span className="text-slate-600">•</span>
            <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Brand Logo & Desktop Nav */}
          <div className="flex items-center gap-8 shrink-0">
            <button
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              <div className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-base tracking-tighter shadow-xs group-hover:bg-blue-700 transition-colors">
                IPTV
              </div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-800">
                cesoir.live
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
                const isIptv = link.path === '/iptv';
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`transition-colors cursor-pointer ${
                      isActive
                        ? 'text-blue-600 border-b-2 border-blue-600 pb-1 font-bold'
                        : isIptv
                        ? 'text-blue-600 hover:text-blue-700 font-semibold'
                        : 'hover:text-blue-600'
                    }`}
                  >
                    {link.label}
                    {isIptv && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        Offres
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search bar & CTA */}
          <div className="flex items-center gap-4">
            {/* Live Search Input */}
            <div className="relative hidden sm:block w-48 md:w-60">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher film, série..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800 placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {searchFocused && (filteredPrograms.length > 0 || filteredChannels.length > 0) && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSearchFocused(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden text-xs">
                    {filteredChannels.length > 0 && (
                      <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-2 block mb-1">
                          Chaînes
                        </span>
                        {filteredChannels.map(ch => (
                          <button
                            key={ch.id}
                            onClick={() => handleNavClick(`/programme-tv/chaines/${ch.slug}`)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-semibold text-slate-800">{ch.name} (Canal {ch.number})</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    )}
                    {filteredPrograms.length > 0 && (
                      <div className="p-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-2 block mb-1">
                          Programmes TV
                        </span>
                        {filteredPrograms.map(prg => (
                          <button
                            key={prg.id}
                            onClick={() => {
                              onSelectProgram(prg);
                              setSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center justify-between group cursor-pointer"
                          >
                            <div>
                              <p className="font-semibold text-slate-800 group-hover:text-blue-600 line-clamp-1">
                                {prg.title}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {prg.startTime} • {prg.genre}
                              </p>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                              Détails
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Commercial CTA Button in Clean Minimalism: bg-slate-900 rounded-full */}
            <button
              onClick={() => handleNavClick('/iptv')}
              className="bg-slate-900 text-white text-[10px] xs:text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 shrink-0 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Voir les abonnements IPTV</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une émission..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3 py-2.5 text-sm font-semibold rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => handleNavClick('/iptv')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-slate-900 text-white font-bold text-sm shadow-md cursor-pointer hover:bg-slate-800 transition-all"
            >
              <span>Voir les abonnements IPTV</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
