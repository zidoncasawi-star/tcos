import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';
import { CookiePreferences } from '../types';

interface Props {
  isOpenModalForce?: boolean;
  onCloseModalForce?: () => void;
  onNavigate: (path: string) => void;
}

export const CookieBanner: React.FC<Props> = ({
  isOpenModalForce = false,
  onCloseModalForce,
  onNavigate
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('programme_tv_cookies');
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch (e) {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    if (isOpenModalForce) {
      setShowCustomModal(true);
    }
  }, [isOpenModalForce]);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('programme_tv_cookies', JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowCustomModal(false);
    onCloseModalForce?.();

    // Log to backend API
    fetch('/api/cookies/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: prefs })
    }).catch(() => {});
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    });
  };

  const handleRejectAll = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    });
  };

  const handleSaveCustom = () => {
    savePreferences({
      ...preferences,
      essential: true,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <>
      {/* Banner */}
      {showBanner && !showCustomModal && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 max-w-3xl">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-900 text-sm mb-0.5">
                  Respect de votre vie privée et conformité RGPD
                </p>
                <p>
                  Nous utilisons des cookies essentiels au fonctionnement de la plateforme (sauvegarde de vos filtres, panier de commande sécurisé). Avec votre accord, nous utilisons également des cookies de mesure d&apos;audience anonymisés pour améliorer le guide TV. Vous pouvez accepter, refuser les traceurs optionnels ou personnaliser vos choix à tout moment.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={() => setShowCustomModal(true)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Personnaliser
              </button>
              <button
                onClick={handleRejectAll}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Refuser les cookies non essentiels
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
              >
                Accepter tout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Customization */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>Gestion des préférences cookies</span>
              </div>
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  onCloseModalForce?.();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-4 text-xs">
              {/* Essential */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Cookies strictement nécessaires</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Toujours actifs
                  </span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Indispensables pour naviguer sur le site, retenir votre sélection de date, mémoriser votre panier et sécuriser les paiements.
                </p>
              </div>

              {/* Analytics */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Mesure d&apos;audience (Analytique)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Permet de comptabiliser anonymement les visites et d&apos;analyser les programmes les plus consultés afin d&apos;optimiser nos serveurs.
                </p>
              </div>

              {/* Marketing */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Personnalisation & Contenus tiers</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Utilisé pour adapter la mise en avant de nos tutoriels et offres en fonction de votre appareil de lecture.
                </p>
              </div>

              <div className="text-[11px] text-slate-400">
                Pour en savoir plus sur vos droits d&apos;accès, de rectification et d&apos;effacement, consultez notre{' '}
                <button
                  onClick={() => {
                    setShowCustomModal(false);
                    onNavigate('/politique-confidentialite');
                  }}
                  className="text-blue-600 underline font-medium cursor-pointer"
                >
                  politique de confidentialité
                </button>.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={handleRejectAll}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Tout refuser
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
