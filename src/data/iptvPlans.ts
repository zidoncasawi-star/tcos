import { IptvPlan, FaqItem } from '../types';

export const IPTV_PLANS: IptvPlan[] = [
  {
    id: 'plan-3-mois',
    slug: '3-mois',
    name: 'Formule Découverte',
    durationMonths: 3,
    price: 16.99,
    currency: 'EUR',
    popular: false,
    devices: 1,
    description: 'Idéal pour tester le service sur une durée de trimestre sans engagement long.',
    features: [
      '20 751 Chaînes en direct',
      '93 525 Films',
      '23 193 Séries',
      'Qualité 4K Ultra HD',
      '1 connexion appareil',
      'Tous les appareils pris en charge',
      'Support client 24/7',
      'Guide des programmes EPG',
      'Technologie anti-freeze',
      'Disponibilité serveur 99,9 %',
      'Activation instantanée',
      'Support prioritaire'
    ]
  },
  {
    id: 'plan-6-mois',
    slug: '6-mois',
    name: 'Formule Semestrielle',
    durationMonths: 6,
    price: 21.99,
    currency: 'EUR',
    popular: false,
    devices: 1,
    badge: 'Économique',
    description: 'Le parfait compromis entre flexibilité et tarif dégressif pour votre divertissement.',
    features: [
      '20 751 Chaînes en direct',
      '93 525 Films',
      '23 193 Séries',
      'Qualité 4K Ultra HD',
      '1 connexion appareil',
      'Tous les appareils pris en charge',
      'Support client 24/7',
      'Guide des programmes EPG',
      'Technologie anti-freeze',
      'Disponibilité serveur 99,9 %',
      'Activation instantanée',
      'Support prioritaire'
    ]
  },
  {
    id: 'plan-12-mois',
    slug: '12-mois',
    name: 'Formule Annuelle VIP',
    durationMonths: 12,
    price: 36.99,
    currency: 'EUR',
    popular: true,
    devices: 1,
    isVip: true,
    badge: 'Meilleur Rapport Qualité / Prix',
    description: 'Notre offre la plus demandée avec un tarif lissé à moins de 3,09 € par mois.',
    features: [
      '20 751 Chaînes en direct',
      '93 525 Films',
      '23 193 Séries',
      'Qualité 4K Ultra HD',
      '1 connexion appareil',
      'Tous les appareils pris en charge',
      'Support client 24/7',
      'Guide des programmes EPG',
      'Technologie anti-freeze',
      'Disponibilité serveur 99,9 %',
      'Activation instantanée',
      'Support prioritaire'
    ]
  }
];

export const IPTV_EDITORIAL_FAQS: FaqItem[] = [
  {
    category: 'tv',
    question: 'Quel est le programme TV de ce soir sur la TNT ?',
    answer: 'Ce soir sur la TNT, retrouvez notamment la saison 4 inédite de HPI sur TF1 à 21h10, la série policière Astrid et Raphaëlle sur France 2, la Palme d\'Or "Anatomie d\'une chute" sur Arte, la finale de Top Chef sur M6 et les quarts de finale d\'UEFA Europa League sur W9. Consultez notre grille en temps réel pour tous les horaires détaillés.'
  },
  {
    category: 'tv',
    question: 'Comment consulter le programme TV en direct et à venir ?',
    answer: 'Notre plateforme propose un accès instantané aux émissions diffusées actuellement (« Maintenant ») avec barre de progression en direct, aux grilles de prime-time (« Ce soir à 21h10 ») et aux programmes de demain et après-demain via le sélecteur de date en haut de page.'
  },
  {
    category: 'tv',
    question: 'Que regarder ce soir si je cherche un bon film à la télévision ?',
    answer: 'Consultez notre rubrique dédiée « Films ce soir » qui filtre exclusivement les longs-métrages diffusés sur les chaînes gratuites et payantes, avec résumés, réalisateurs, acteurs principaux, durées et avertissements d\'âge du CSA.'
  },
  {
    category: 'iptv',
    question: 'Comment fonctionne l\'accès IPTV sur mes appareils ?',
    answer: 'L\'IPTV (Internet Protocol Television) transmet les flux audiovisuels via votre connexion Internet à haut débit. L\'accès est compatible avec les applications dédiées sur Smart TV (LG webOS, Samsung Tizen), boîtiers Android TV / Fire TV Stick (via TiviMate ou Smarters Pro), smartphones et ordinateurs.'
  },
  {
    category: 'iptv',
    question: 'Quels appareils sont compatibles avec vos abonnements ?',
    answer: 'Nos formules sont compatibles avec une large gamme d\'équipements : téléviseurs connectés (Samsung, LG, Philips, Sony), lecteurs multimédias (Amazon Fire TV Stick, Xiaomi Mi Box, Nvidia Shield), box Apple TV, smartphones et tablettes (iOS et Android), ainsi que PC / Mac via lecteurs VLC ou applications multimédias dédiées.'
  },
  {
    category: 'technique',
    question: 'Comment fonctionne le guide des programmes (EPG) ?',
    answer: 'Le guide électronique des programmes (EPG / Electronic Program Guide) synchronise automatiquement les horaires, les titres et les résumés des émissions sur vos applications de lecture (comme TiviMate ou Smarters Pro) pour vous permettre de naviguer facilement dans les grilles horaires.'
  },
  {
    category: 'paiement',
    question: 'Comment souscrire à une offre et recevoir ses identifiants ?',
    answer: 'Sélectionnez votre formule (3 mois, 6 mois ou 12 mois VIP), complétez vos coordonnées sur la page de commande et finalisez votre demande directement avec notre équipe via WhatsApp ou email. Vos accès et instructions de configuration détaillées vous sont envoyés rapidement par messagerie et email.'
  },
  {
    category: 'paiement',
    question: 'Quelle est la politique de garantie et de remboursement ?',
    answer: 'Nous proposons une garantie de satisfaction de 7 jours sous réserve du respect des conditions d\'éligibilité technique. En cas d\'incompatibilité avérée et irrésolue avec votre matériel, une demande de remboursement peut être adressée à notre support client conformément à notre politique transparente.'
  }
];
