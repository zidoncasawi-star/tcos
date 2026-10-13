import React from 'react';
import { EDITORIAL_GUIDES } from '../data/seoContent';
import { IPTV_PLANS } from '../data/iptvPlans';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CheckCircle2, ShieldAlert, ArrowRight, BookOpen, Monitor } from 'lucide-react';

interface Props {
  slug: string;
  onNavigate: (path: string) => void;
}

export const IptvDetailPage: React.FC<Props> = ({ slug, onNavigate }) => {
  // Check if it's one of the plans (3-mois, 6-mois, 12-mois)
  const plan = IPTV_PLANS.find(p => p.slug === slug || p.id === `plan-${slug}`);

  // Check if it's one of the editorial guides
  const guide = EDITORIAL_GUIDES[slug];

  if (plan) {
    return (
      <div className="space-y-8 pb-16 max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Espace Commercial IPTV', path: '/iptv' },
            { label: `Offre ${plan.name}`, path: `/iptv/${plan.slug}` }
          ]}
          onNavigate={onNavigate}
        />

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="px-2.5 py-1 rounded text-xs font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                Formule {plan.durationMonths} Mois
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 mt-2">
                {plan.name} — {plan.durationMonths} Mois d&apos;accès
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {plan.description}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 block">
                {plan.price.toFixed(2)} €
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Paiement unique pour {plan.durationMonths} mois
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Ce qui est inclus dans votre formule :
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plan.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
            <strong>Transparence éditoriale :</strong> Le catalogue disponible dépend de la couverture géographique et des droits de diffusion en vigueur. Nous ne fournissons aucun matériel physique (box décodeur) ; le service fonctionne de manière dématérialisée sur vos équipements compatibles.
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onNavigate(`/commander?plan=${plan.slug}`)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
            >
              Commander maintenant ({plan.price.toFixed(2)} €)
            </button>
            <WhatsAppButton
              plan={plan}
              label="Commander via WhatsApp"
            />
          </div>
        </div>
      </div>
    );
  }

  if (guide) {
    return (
      <div className="space-y-8 pb-16 max-w-4xl mx-auto">
        <SeoJsonLd
          schema={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            'headline': guide.h1,
            'description': guide.metaDescription,
            'mainEntityOfPage': `https://programmetv.site/iptv/${guide.slug}`
          }}
        />

        <Breadcrumbs
          items={guide.breadcrumbs}
          onNavigate={onNavigate}
        />

        <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Notice technique et tutoriel neutre</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 leading-tight">
              {guide.h1}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {guide.intro}
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            {guide.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {sec.heading}
                </h2>
                <p>{sec.body}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => onNavigate('/iptv')}
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              &larr; Retour aux offres d&apos;abonnement
            </button>
            <button
              onClick={() => onNavigate('/commander?plan=12-mois')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              Voir la formule recommandée (12 mois VIP)
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="py-16 text-center space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Page introuvable</h2>
      <p className="text-xs sm:text-sm text-slate-600">Le guide ou l&apos;offre recherchée n&apos;est pas disponible.</p>
      <button
        onClick={() => onNavigate('/iptv')}
        className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs"
      >
        Retour à la section IPTV
      </button>
    </div>
  );
};
