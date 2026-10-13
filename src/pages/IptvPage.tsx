import React from 'react';
import { IptvPlan } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CheckCircle2, Sparkles, ShieldCheck, Zap, Monitor, Smartphone, HelpCircle, ArrowRight } from 'lucide-react';
import { IPTV_EDITORIAL_FAQS } from '../data/iptvPlans';

interface Props {
  plans: IptvPlan[];
  onNavigate: (path: string) => void;
}

export const IptvPage: React.FC<Props> = ({ plans, onNavigate }) => {
  // Structured data for Google Search (Product/Offer Schema)
  const productSchema = plans.map(p => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': `Abonnement IPTV ${p.name} - ${p.durationMonths} Mois`,
    'description': p.description,
    'offers': {
      '@type': 'Offer',
      'price': p.price.toFixed(2),
      'priceCurrency': 'EUR',
      'availability': 'https://schema.org/InStock',
      'url': `https://programmetv.site/commander?plan=${p.slug}`
    }
  }));

  return (
    <div className="space-y-12 pb-16">
      <SeoJsonLd schema={productSchema} />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Espace Commercial IPTV', path: '/iptv' }
        ]}
        onNavigate={onNavigate}
      />

      {/* Commercial Header Hero */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Espace Commercial Indépendant</span>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-serif leading-tight">
            Abonnement IPTV : votre programme télé pour la tv ce soir
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Découvrez nos offres d&apos;abonnement et profitez d&apos;une expérience TV adaptée à vos appareils compatibles. Ne manquez plus aucun événement de la tv ce soir ou votre programme tv favori.
          </p>
        </div>

        {/* Essential features tags */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Activation rapide</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Garantie 7 jours</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Compatible 4K & EPG</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Support WhatsApp 7j/7</span>
          </div>
        </div>
      </section>

      {/* Three Official Plans Comparison Cards */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            Nos trois formules d&apos;accès
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Des tarifs transparents sans engagement automatique. Catalogue disponible selon l&apos;offre et les droits de diffusion applicables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {plans.map(plan => {
            const isVip = plan.isVip;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                  isVip
                    ? 'bg-slate-900 text-white border-2 border-amber-400 shadow-2xl shadow-amber-500/10 scale-102'
                    : 'bg-white text-slate-900 border border-slate-200 shadow-xs hover:shadow-lg'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className={`text-xl font-bold ${isVip ? 'text-white' : 'text-slate-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs mt-1 ${isVip ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className={`flex items-baseline gap-1.5 mb-6 pb-6 border-b ${isVip ? 'border-slate-800' : 'border-slate-100'}`}>
                    <span className="text-4xl font-black">
                      {plan.price.toFixed(2)} €
                    </span>
                    <span className={`text-xs ${isVip ? 'text-slate-400' : 'text-slate-500'}`}>
                      / {plan.durationMonths} mois
                    </span>
                  </div>

                  <ul className="space-y-3 text-xs mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className={isVip ? 'text-slate-300' : 'text-slate-700'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => onNavigate(`/commander?plan=${plan.slug}`)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                      isVip
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    Commander maintenant
                  </button>

                  <WhatsAppButton
                    plan={plan}
                    label="Commander via WhatsApp"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Purchasing Process Steps */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            Parcours de commande simple et transparent
          </h2>
          <p className="text-xs text-slate-500">
            De la sélection à l&apos;activation sur votre écran en quelques étapes simples.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs inline-flex items-center justify-center">1</span>
            <h3 className="font-bold text-slate-900 text-sm">Choix de l&apos;offre</h3>
            <p className="text-xs text-slate-500">Sélectionnez la formule de 3, 6 ou 12 mois selon votre besoin.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs inline-flex items-center justify-center">2</span>
            <h3 className="font-bold text-slate-900 text-sm">Récapitulatif</h3>
            <p className="text-xs text-slate-500">Indiquez votre équipement (Smart TV, boîtier, application).</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs inline-flex items-center justify-center">3</span>
            <h3 className="font-bold text-slate-900 text-sm">Validation directe</h3>
            <p className="text-xs text-slate-500">Validation en direct et finalisation assistée par messagerie WhatsApp.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs inline-flex items-center justify-center">4</span>
            <h3 className="font-bold text-slate-900 text-sm">Activation rapide</h3>
            <p className="text-xs text-slate-500">Réception immédiate des accès et du tutoriel de synchronisation.</p>
          </div>
        </div>
      </section>

      {/* Hardware & Guides Links */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-slate-900">
          Guides de configuration pour vos appareils
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('/iptv/smart-tv')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2"
          >
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Smart TV (Samsung & LG)</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tutoriel d&apos;installation directe sur Tizen et webOS sans boîtier externe.
            </p>
          </div>

          <div
            onClick={() => onNavigate('/iptv/tivimate')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2"
          >
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>TiviMate IPTV Player</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Notice neutre d&apos;optimisation pour boîtiers Android TV et Amazon Fire TV Stick.
            </p>
          </div>

          <div
            onClick={() => onNavigate('/iptv/smarters-pro')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2"
          >
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>IPTV Smarters Pro</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Guide d&apos;utilisation sur smartphone, tablette, PC Windows et Mac.
            </p>
          </div>
        </div>
      </section>

      {/* Commercial FAQ */}
      <section className="bg-slate-100/70 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <span>Questions fréquentes sur nos abonnements</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {IPTV_EDITORIAL_FAQS.filter(f => f.category === 'iptv' || f.category === 'paiement').map((faq, idx) => (
            <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                {faq.question}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
