import React, { useState } from 'react';
import { IptvPlan } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CheckCircle2, ShieldCheck, Lock, MessageCircle, Tv, Mail, Sparkles, Smartphone, HelpCircle } from 'lucide-react';

interface Props {
  plans: IptvPlan[];
  initialPlanSlug?: string;
  onNavigate: (path: string) => void;
}

export const CheckoutPage: React.FC<Props> = ({
  plans,
  initialPlanSlug = '12-mois',
  onNavigate
}) => {
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>(initialPlanSlug);
  const [customerName, setCustomerName] = useState('');
  const [deviceType, setDeviceType] = useState('Smart TV Samsung / LG');
  const [macOrApp, setMacOrApp] = useState('');
  const [notes, setNotes] = useState('');

  const selectedPlan = plans.find(p => p.slug === selectedPlanSlug) || plans[0] || {
    id: 'plan-12-mois',
    slug: '12-mois',
    name: 'Formule Annuelle VIP',
    durationMonths: 12,
    price: 36.99,
    currency: 'EUR',
    popular: true,
    devices: 1,
    features: ['12 mois d\'accès', 'EPG inclus', 'Qualité 4K / FHD', 'Support VIP 7j/7'],
    description: 'Offre complète 12 mois'
  };

  const formattedPrice = `${selectedPlan.price.toFixed(2).replace('.', ',')} €`;

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Espace IPTV', path: '/iptv' },
          { label: 'Commander l\'offre', path: '/commander' }
        ]}
        onNavigate={onNavigate}
      />

      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Commande directe via WhatsApp</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
          Commander votre formule IPTV
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Sélectionnez votre formule et validez votre demande directement avec notre assistance technique sur WhatsApp. Aucun paiement direct ni coordonnées bancaires ne sont traités sur ce site.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Plan selection & details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Formule selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                1. Choisissez ou modifiez votre formule
              </h2>
              <span className="text-[11px] text-slate-400">Sans engagement</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans.map(p => {
                const isSelected = p.slug === selectedPlanSlug;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanSlug(p.slug)}
                    className={`p-4 pt-7 pb-5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between h-full min-h-[120px] ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {p.badge && (
                      <span className="absolute -top-2 left-2 right-2 text-center px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase bg-amber-400 text-slate-950 leading-tight whitespace-normal shadow-xs">
                        {p.badge}
                      </span>
                    )}
                    <div className="space-y-1 w-full">
                      <span className="text-xs font-bold text-slate-800 block">
                        {p.name}
                      </span>
                      <span className="text-xl font-black text-slate-950 block">
                        {p.price.toFixed(2).replace('.', ',')} €
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-2">
                      Durée : {p.durationMonths} mois
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Selected Plan Specifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono border-b border-slate-100 pb-3">
              2. Détails de l&apos;offre sélectionnée
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nom de l&apos;offre</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{selectedPlan.name}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Durée</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{selectedPlan.durationMonths} mois</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Prix</span>
                <span className="text-sm font-black text-emerald-600 block mt-0.5">{formattedPrice}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nombre d&apos;appareils</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{selectedPlan.devices} appareil{selectedPlan.devices > 1 ? 's' : ''}</span>
              </div>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
              <li className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Guide électronique des programmes (EPG inclus)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Qualité HD / FHD / 4K selon débit</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Activation assistée pas à pas 7j/7</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Compatible Smart TV, Box, Mobile & PC</span>
              </li>
            </ul>
          </div>

          {/* Step 3: Optional details for smoother activation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                3. Informations pour l&apos;activation (optionnel)
              </h2>
              <span className="text-[11px] text-slate-400">Pour accélérer la configuration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Votre prénom ou nom (facultatif)</label>
                <input
                  type="text"
                  placeholder="Ex : Jean"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Appareil principal utilisé</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900"
                >
                  <option value="Smart TV Samsung (Tizen)">Smart TV Samsung (Tizen)</option>
                  <option value="Smart TV LG (webOS)">Smart TV LG (webOS)</option>
                  <option value="Android TV / Box Xiaomi / Nvidia Shield">Android TV / Box Xiaomi / Nvidia Shield</option>
                  <option value="Amazon Fire TV Stick">Amazon Fire TV Stick</option>
                  <option value="TiviMate / IPTV Smarters Pro">TiviMate / IPTV Smarters Pro</option>
                  <option value="Apple TV / iPhone / iPad">Apple TV / iPhone / iPad</option>
                  <option value="PC Windows / Mac">PC Windows / Mac</option>
                  <option value="Autre support">Autre support multimédia</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Application ou adresse MAC (facultatif)</label>
                <input
                  type="text"
                  placeholder="Ex : IBO Player, Smarters, 00:1A:..."
                  value={macOrApp}
                  onChange={(e) => setMacOrApp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Message ou question pour l&apos;équipe</label>
                <textarea
                  rows={2}
                  placeholder="Une question sur vos chaînes favorites, votre connexion Internet..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & WhatsApp Action */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 sticky top-24">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Récapitulatif de la commande
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Offre :</span>
                <span className="font-bold text-slate-900">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Durée :</span>
                <span className="font-semibold text-slate-800">{selectedPlan.durationMonths} mois</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Appareils :</span>
                <span className="font-semibold text-slate-800">{selectedPlan.devices} appareil inclus</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Guide TV (EPG) :</span>
                <span className="text-emerald-600 font-bold">Inclus & Synchronisé</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase text-slate-600">Prix total :</span>
              <span className="text-3xl font-black text-emerald-600">
                {formattedPrice}
              </span>
            </div>

            {/* Direct WhatsApp Ordering Button */}
            <div className="space-y-2 pt-2">
              <WhatsAppButton
                plan={selectedPlan}
                customerName={customerName}
                deviceType={`${deviceType}${macOrApp ? ` (${macOrApp})` : ''}`}
                label="Commander via WhatsApp"
                className="w-full py-3.5 text-sm rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
              />

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Cliquez pour ouvrir WhatsApp avec le message pré-rempli et recevoir votre lien d&apos;activation.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Validation sécurisée</span>
              </div>
              <p>
                Aucune transaction bancaire directe sur ce site. Les accès et les tests de configuration sont supervisés directement par notre support 7j/7.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3 text-center">
              <button
                type="button"
                onClick={() => onNavigate('/iptv')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                &larr; Retourner au comparatif des offres
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
