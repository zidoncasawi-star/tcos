import React from 'react';
import { Tv, ShieldCheck, Mail, MessageCircle, ExternalLink, Cookie } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
  onOpenCookieSettings: () => void;
}

export const Footer: React.FC<Props> = ({ onNavigate, onOpenCookieSettings }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-base tracking-tighter shadow-xs">
                IPTV
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                cesoir.live
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Votre guide de référence pour votre programme tv en France : retrouvez le meilleur de la tv ce soir, la programmation de la TNT métropolitaine, grilles en direct, soirées cinéma, et votre programme télé sportif.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> EPG Synchronisé 7j/7
              </span>
              <span className="text-[11px] text-slate-500">
                Domaine : iptvcesoir.live
              </span>
            </div>
          </div>

          {/* Col 2: Navigation TV */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3 font-mono">
              Guide Télévision
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/programme-tv')} className="hover:text-white transition-colors">
                  Programme TV complet
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/matchs-en-direct')} className="hover:text-blue-400 font-bold transition-colors">
                  ⚽ Matchs en direct (Scores)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/programme-tv/ce-soir')} className="hover:text-white transition-colors">
                  Ce soir à la télé (21:10)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/programme-tv/maintenant')} className="hover:text-white transition-colors">
                  En ce moment en direct
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/programme-tv/tnt')} className="hover:text-white transition-colors">
                  Chaînes de la TNT
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/films')} className="hover:text-white transition-colors">
                  Films ce soir
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/sport')} className="hover:text-white transition-colors">
                  Sport & Événements
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/programme-tv/chaines')} className="hover:text-white transition-colors">
                  Annuaire des chaînes
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Offres IPTV */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3 font-mono">
              Espace Commercial IPTV
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/iptv')} className="hover:text-indigo-400 font-medium text-slate-300 transition-colors">
                  Tous les abonnements
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/iptv/prix')} className="hover:text-indigo-400 transition-colors">
                  Grille des tarifs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/iptv/3-mois')} className="hover:text-indigo-400 transition-colors">
                  Formule 3 mois (16,99 €)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/iptv/6-mois')} className="hover:text-indigo-400 transition-colors">
                  Formule 6 mois (21,99 €)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/iptv/12-mois')} className="hover:text-indigo-400 transition-colors">
                  Formule 12 mois VIP (36,99 €)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/iptv/smart-tv')} className="hover:text-indigo-400 transition-colors">
                  Configuration Smart TV
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/iptv/tivimate')} className="hover:text-indigo-400 transition-colors">
                  Notice TiviMate
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/iptv/smarters-pro')} className="hover:text-indigo-400 transition-colors">
                  Notice Smarters Pro
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Légal & Conformité */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3 font-mono">
              Informations & Conformité
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/a-propos')} className="hover:text-white transition-colors">
                  À propos du site
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/mentions-legales')} className="hover:text-white transition-colors">
                  Mentions Légales
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/politique-confidentialite')} className="hover:text-white transition-colors">
                  Politique de Confidentialité (RGPD)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/politique-cookies')} className="hover:text-white transition-colors">
                  Politique relative aux Cookies
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/conditions-de-vente')} className="hover:text-white transition-colors">
                  Conditions Générales de Vente (CGV)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/remboursement')} className="hover:text-white transition-colors">
                  Garantie & Remboursement (7j)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/dmca')} className="hover:text-white transition-colors">
                  Signalement DMCA / Droits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/avertissement-legal')} className="hover:text-white transition-colors">
                  Avertissement légal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/livraison')} className="hover:text-white transition-colors">
                  Modalités de livraison
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/faq')} className="hover:text-white transition-colors">
                  Foire Aux Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="text-slate-500 hover:text-slate-300 transition-colors">
                  Espace Gestion / Admin
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Compliance Notice */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-[11px] text-slate-500 space-y-2 leading-relaxed">
          <p>
            <strong>Avertissement éditorial et commercial :</strong> Le présent site web iptvcesoir.live propose à titre principal un guide télévisé d&apos;information sur les programmes diffusés sur les chaînes de télévision françaises et la TNT. La section commerciale IPTV constitue un service distinct et indépendant. Aucune affiliation officielle n&apos;existe avec les chaînes de télévision citées, les marques d&apos;applications tierces (TiviMate, Smarters Pro) ou les fabricants de téléviseurs (Samsung, LG, Philips), cités exclusivement à des fins de compatibilité technique.
          </p>
          <p>
            <strong>Attribution TMDB :</strong> Les fiches cinématographiques et visuels de films sont enrichis via The Movie Database (TMDB). Ce produit utilise l&apos;API TMDB mais n&apos;est ni certifié ni approuvé par TMDB.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-500">
            &copy; 2026 Programme TV. Tous droits réservés.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenCookieSettings}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <Cookie className="w-3.5 h-3.5" />
              <span>Gérer les préférences cookies</span>
            </button>
            <span className="text-slate-700">|</span>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Sitemap XML
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Robots.txt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
