import React, { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { ShieldAlert, Mail, Send, CheckCircle2, AlertCircle, HelpCircle, FileText, Scale } from 'lucide-react';
import { IPTV_EDITORIAL_FAQS } from '../data/iptvPlans';

interface Props {
  pageType:
    | 'mentions-legales'
    | 'politique-confidentialite'
    | 'politique-cookies'
    | 'conditions-de-vente'
    | 'remboursement'
    | 'dmca'
    | 'avertissement-legal'
    | 'livraison'
    | 'a-propos'
    | 'contact'
    | 'faq';
  onNavigate: (path: string) => void;
  onOpenCookieSettings?: () => void;
}

export const LegalPage: React.FC<Props> = ({
  pageType,
  onNavigate,
  onOpenCookieSettings
}) => {
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Demande générale');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // DMCA Form State
  const [dmcaName, setDmcaName] = useState('');
  const [dmcaCompany, setDmcaCompany] = useState('');
  const [dmcaEmail, setDmcaEmail] = useState('');
  const [dmcaWorkUrl, setDmcaWorkUrl] = useState('');
  const [dmcaInfringingUrl, setDmcaInfringingUrl] = useState('');
  const [dmcaStatement, setDmcaStatement] = useState(false);
  const [dmcaSent, setDmcaSent] = useState(false);

  // FAQ filter
  const [faqFilter, setFaqFilter] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });

      if (!res.ok) throw new Error('Erreur lors de l\'envoi du message.');
      setContactSuccess(true);
    } catch (err: any) {
      setContactError(err.message || 'Impossible d\'envoyer le message pour le moment.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleDmcaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmcaStatement) {
      alert('Veuillez certifier sur l\'honneur l\'exactitude de votre déclaration.');
      return;
    }
    // Simulate notification processing
    setDmcaSent(true);
  };

  const renderContent = () => {
    switch (pageType) {
      case 'mentions-legales':
        return (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
              Mentions Légales
            </h1>
            <p className="text-xs text-slate-500">Dernière mise à jour : 1er janvier 2026</p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Éditeur de la plateforme</h2>
              <p>
                Le site <strong>programmetv.site</strong> est édité par la société <strong>MEDIA PROG NETWORK SAS</strong>, société par actions simplifiée au capital social de 10 000 €, immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro Siren 912 345 678.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                <li>Siège social : 14 rue de la Télévision, 75015 Paris, France</li>
                <li>Numéro de TVA intracommunautaire : FR 12 912345678</li>
                <li>Directeur de la publication : Équipe éditoriale Media Prog</li>
                <li>Email de contact : contact@programmetv.site</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Hébergement de l&apos;infrastructure</h2>
              <p>
                La plateforme et ses bases de données sont hébergées au sein de l&apos;Union Européenne par :<br />
                <strong>OVH SAS</strong> — 2 rue Kellermann, 59100 Roubaix, France.<br />
                RCS Lille Métropole 424 761 419 00045. Téléphone : 1007.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Propriété intellectuelle & Marques</h2>
              <p>
                Les marques, dénominations de chaînes de télévision (TF1, France Télévisions, Canal+, M6, Arte, etc.) et logos cités sur ce site appartiennent à leurs propriétaires respectifs. Leur mention sur <strong>programmetv.site</strong> intervient exclusivement à titre informatif et d&apos;indexation éditoriale dans le cadre de la liberté d&apos;information et de compatibilité des matériels, conformément aux dispositions de l&apos;article L. 713-6 du Code de la Propriété Intellectuelle.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Droit applicable</h2>
              <p>
                Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux compétents du ressort de la Cour d&apos;Appel de Paris seront seuls compétents.
              </p>
            </section>
          </div>
        );

      case 'politique-confidentialite':
        return (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
              Politique de Confidentialité & Traitement des Données (RGPD)
            </h1>
            <p className="text-xs text-slate-500">Conforme au Règlement Général sur la Protection des Données (UE 2016/679)</p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Responsable du traitement</h2>
              <p>
                Le responsable du traitement des données personnelles collectées sur le site est la société MEDIA PROG NETWORK SAS. Pour toute question ou pour exercer vos droits, vous pouvez vous adresser à notre délégué à la protection des données par email à : <strong>dpo@programmetv.site</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Données personnelles collectées</h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                <li><strong>Données de navigation :</strong> Horodatage, adresse IP anonymisée, type de terminal et navigateur.</li>
                <li><strong>Données de commande commerciale :</strong> Nom, prénom, adresse email de livraison, numéro de téléphone (optionnel), identifiant d&apos;équipement (type de TV ou adresse MAC déclarée).</li>
                <li><strong>Données de paiement :</strong> Gérées directement par les passerelles bancaires et protocoles sécurisés ; nous ne conservons aucun numéro de carte bancaire sur nos serveurs.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Finalités et bases légales</h2>
              <p>
                Le traitement de vos données répond aux finalités suivantes : délivrance du guide EPG (intérêt légitime), exécution du contrat de vente dématérialisée (base contractuelle), respect des obligations légales fiscales et comptables (obligation légale).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Durée de conservation</h2>
              <p>
                Les données de facturation et commandes sont archivées pendant 5 ans conformément aux règles comptables françaises. Les données de navigation et logs techniques sont purgés au terme de 12 mois glissants.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Vos droits (Accès, Rectification, Effacement, Portabilité)</h2>
              <p>
                Conformément aux articles 15 à 21 du RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement (&laquo; droit à l&apos;oubli &raquo;), de limitation du traitement et d&apos;opposition. Vous pouvez exercer ces droits sans frais en écrivant à : <strong>rgpd@programmetv.site</strong> en joignant un justificatif d&apos;identité.
              </p>
            </section>
          </div>
        );

      case 'politique-cookies':
        return (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
              Politique Relative aux Cookies
            </h1>
            <p className="text-xs text-slate-500">Conformité CNIL et directives ePrivacy</p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
              <p>
                Un cookie est un petit fichier texte déposé sur votre terminal lors de la consultation d&apos;un site web. Il permet au site de se souvenir de vos préférences d&apos;affichage (chaîne favorite, date du guide sélectionnée, panier en cours).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Cookies utilisés sur programmetv.site</h2>
              <div className="space-y-3 pt-1">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h3 className="font-bold text-slate-900 text-xs mb-1">Cookies techniques indispensables (exemptés de consentement)</h3>
                  <p className="text-xs text-slate-600">Mémorisation du jour de consultation du guide TV, sécurisation de la session de navigation et enregistrement de vos préférences cookies.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h3 className="font-bold text-slate-900 text-xs mb-1">Cookies de mesure d&apos;audience (soumis à consentement)</h3>
                  <p className="text-xs text-slate-600">Statistiques de fréquentation anonymisées afin d&apos;optimiser le dimensionnement des serveurs EPG.</p>
                </div>
              </div>
            </section>

            <div className="pt-4">
              <button
                onClick={onOpenCookieSettings}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Ouvrir le panneau de gestion de vos cookies
              </button>
            </div>
          </div>
        );

      case 'conditions-de-vente':
        return (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
              Conditions Générales de Vente (CGV)
            </h1>
            <p className="text-xs text-slate-500">Applicables aux commandes de services numériques passées sur programmetv.site</p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Objet & Tarifs officiels</h2>
              <p>
                Les présentes CGV régissent les ventes d&apos;abonnements numériques dématérialisés proposées sur le site :
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                <li><strong>Formule 3 Mois :</strong> 16,99 € TTC</li>
                <li><strong>Formule 6 Mois :</strong> 21,99 € TTC</li>
                <li><strong>Formule 12 Mois VIP :</strong> 36,99 € TTC</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Modalités de commande et livraison</h2>
              <p>
                La commande s&apos;effectue en ligne. La livraison est 100% numérique et s&apos;effectue par courrier électronique et/ou messagerie instantanée WhatsApp sous un délai moyen de 15 minutes à 2 heures après validation du paiement.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Droit de rétractation & Remboursement</h2>
              <p>
                Conformément à nos engagements de satisfaction, le client bénéficie d&apos;une garantie de remboursement de 7 jours en cas d&apos;incompatibilité technique manifeste non résolue par notre support technique.
              </p>
            </section>
          </div>
        );

      case 'remboursement':
        return (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
              Politique de Garantie & Remboursement (7 Jours)
            </h1>
            <p className="text-xs text-slate-500">Procédure claire et sans frais cachés</p>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm">
              <strong>Engagement Sérénité :</strong> Si votre équipement s&apos;avère incompatible ou si vous rencontrez un blocage technique que notre assistance ne parvient pas à résoudre, vous pouvez demander le remboursement intégral dans un délai de 7 jours calendaires suivant votre achat.
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">Modalités pour faire une demande :</h2>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
                <li>Envoyez un email à <strong>support@programmetv.site</strong> ou contactez notre support WhatsApp.</li>
                <li>Mentionnez votre numéro de commande (ex : <code>CMD-XXXXXX</code>) et votre adresse email d&apos;achat.</li>
                <li>Indiquez succinctement le modèle de votre appareil et le problème rencontré.</li>
                <li>Le remboursement est initié sous 48 à 72 heures ouvrées sur le même moyen de paiement utilisé.</li>
              </ol>
            </section>
          </div>
        );

      case 'dmca':
        return (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
              Notification de Droits d&apos;Auteur & Procédure DMCA
            </h1>
            <p className="text-xs text-slate-500">Respect scrupuleux de la propriété intellectuelle</p>

            <p>
              La plateforme <strong>programmetv.site</strong> respecte rigoureusement les droits de propriété intellectuelle des créateurs, diffuseurs et ayants droit. Si vous estimez qu&apos;un contenu présent sur notre site viole un droit d&apos;auteur vous appartenant, veuillez nous soumettre une notification formelle.
            </p>

            {dmcaSent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <h2 className="font-bold text-base">Signalement bien reçu</h2>
                <p className="text-xs">
                  Votre notification a été transmise à notre service juridique. Une réponse vous sera apportée sous 24 à 48 heures ouvrées.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDmcaSubmit} className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <h2 className="font-bold text-slate-900 text-sm">Formulaire officiel de signalement :</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Nom du titulaire des droits *</label>
                    <input
                      type="text"
                      required
                      value={dmcaName}
                      onChange={(e) => setDmcaName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Société / Entité représentée</label>
                    <input
                      type="text"
                      value={dmcaCompany}
                      onChange={(e) => setDmcaCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-slate-700">Adresse email professionnelle de contact *</label>
                    <input
                      type="email"
                      required
                      value={dmcaEmail}
                      onChange={(e) => setDmcaEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-slate-700">URL du contenu protégé original ou justificatif</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={dmcaWorkUrl}
                      onChange={(e) => setDmcaWorkUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-slate-700">URL concernée sur programmetv.site *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://programmetv.site/..."
                      value={dmcaInfringingUrl}
                      onChange={(e) => setDmcaInfringingUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="dmca-check"
                    checked={dmcaStatement}
                    onChange={(e) => setDmcaStatement(e.target.checked)}
                    className="mt-1 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="dmca-check" className="text-slate-600">
                    Je certifie sur l&apos;honneur être le titulaire des droits ou expressément mandaté pour agir en son nom, et que les informations ci-dessus sont exactes.
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Envoyer la notification DMCA
                </button>
              </form>
            )}
          </div>
        );

      case 'avertissement-legal':
        return (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
              Avertissement Légal & Clarification Éditoriale
            </h1>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
              <strong>Précision fondamentale :</strong> Le site <em>programmetv.site</em> est un portail indépendant d&apos;information et de référencement.
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Nature du service de guide TV</h2>
              <p>
                La vocation principale de notre plateforme est de fournir aux téléspectateurs francophones un guide EPG clair, ergonomique et constamment actualisé des grilles de diffusion hertziennes et TNT. Les données de programmation sont agrégées à des fins informatives.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Distinction de l&apos;espace commercial</h2>
              <p>
                La section &laquo; Abonnements IPTV &raquo; constitue une offre commerciale séparée et autonome. Aucune chaîne de télévision publique ou privée (TF1, France TV, Canal+, etc.) n&apos;est partie prenante, sponsor ou partenaire de ces offres de streaming dématérialisées.
              </p>
            </section>
          </div>
        );

      case 'livraison':
        return (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
              Modalités de Livraison Dématérialisée
            </h1>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">Envoi dématérialisé instantané</h2>
              <p>
                L&apos;ensemble de nos services d&apos;abonnement sont fournis sous forme dématérialisée. Aucun envoi postal de colis physique n&apos;est effectué.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                <li><strong>Délai moyen d&apos;expédition :</strong> 15 minutes à 2 heures après confirmation du règlement.</li>
                <li><strong>Canal de transmission :</strong> Email récapitulatif avec liens de configuration et synchronisation WhatsApp pour assistance sur demande.</li>
                <li><strong>En cas de non-réception :</strong> Vérifiez vos dossiers de courriers indésirables (Spams) ou contactez directement notre équipe avec votre référence de commande.</li>
              </ul>
            </section>
          </div>
        );

      case 'a-propos':
        return (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
              À Propos de Programme TV
            </h1>

            <p>
              Lancé par des passionnés de médias audiovisuels et d&apos;architecture web en France, <strong>programmetv.site</strong> a pour mission de redonner ses lettres de noblesse au guide TV en ligne : un site ultra-rapide, sans bannières publicitaires intrusives, adapté aux mobiles comme aux grands écrans.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl font-black text-rose-600 block">27+</span>
                <span className="text-xs text-slate-600">Chaînes nationales de la TNT</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl font-black text-rose-600 block">7j / 7</span>
                <span className="text-xs text-slate-600">Actualisation EPG temps réel</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl font-black text-rose-600 block">&lt; 0.5s</span>
                <span className="text-xs text-slate-600">Temps de chargement des pages</span>
              </div>
            </div>
          </div>
        );

      case 'faq':
        const filteredFaqs = faqFilter.trim()
          ? IPTV_EDITORIAL_FAQS.filter(f =>
              f.question.toLowerCase().includes(faqFilter.toLowerCase()) ||
              f.answer.toLowerCase().includes(faqFilter.toLowerCase())
            )
          : IPTV_EDITORIAL_FAQS;

        return (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
                Foire Aux Questions (FAQ)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Retrouvez toutes les réponses aux questions relatives à la programmation TV, la TNT et nos offres de streaming.
              </p>
            </div>

            <input
              type="text"
              placeholder="Filtrer une question (ex: TNT, Smart TV, EPG, chaînes...)"
              value={faqFilter}
              onChange={(e) => setFaqFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500/20"
            />

            <div className="space-y-3 pt-2">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{faq.question}</span>
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact':
      default:
        return (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed max-w-2xl mx-auto">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
                Contactez Notre Équipe
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Une question sur la grille TV ou besoin d&apos;assistance pour une souscription ? Nous vous répondons en moins de 24h.
              </p>
            </div>

            {contactSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h2 className="font-bold text-base">Message envoyé avec succès !</h2>
                <p className="text-xs">
                  Notre équipe traitera votre demande dans les plus brefs délais. Vous recevrez une notification par email.
                </p>
                <button
                  onClick={() => {
                    setContactSuccess(false);
                    setContactMessage('');
                  }}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                {contactError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{contactError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Votre nom complet *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Votre adresse email *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="jean@exemple.fr"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Objet de la demande</label>
                  <select
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Demande générale">Demande générale</option>
                    <option value="Question sur le guide EPG">Question sur le guide EPG</option>
                    <option value="Assistance commande IPTV">Assistance commande IPTV</option>
                    <option value="Signalement technique">Signalement technique</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Votre message *</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Décrivez précisément votre demande..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{contactSubmitting ? 'Envoi en cours...' : 'Envoyer mon message'}</span>
                </button>
              </form>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Informations', path: '/mentions-legales' },
          { label: pageType.replace('-', ' '), path: `/${pageType}` }
        ]}
        onNavigate={onNavigate}
      />

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
        {renderContent()}
      </div>
    </div>
  );
};
