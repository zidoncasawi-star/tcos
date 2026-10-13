export interface EditorialGuide {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  breadcrumbs: { label: string; path: string }[];
  h1: string;
  intro: string;
  sections: {
    heading: string;
    body: string;
  }[];
}

export const EDITORIAL_GUIDES: Record<string, EditorialGuide> = {
  'smart-tv': {
    slug: 'smart-tv',
    title: 'Guide d\'installation sur Smart TV (Samsung Tizen, LG webOS, Android TV)',
    metaTitle: 'Guide Installation IPTV sur Smart TV Samsung & LG | Programme TV',
    metaDescription: 'Découvrez comment configurer facilement une application de lecture sur votre Smart TV connectée Samsung, LG ou Android TV en quelques étapes simples.',
    breadcrumbs: [
      { label: 'Accueil', path: '/' },
      { label: 'IPTV', path: '/iptv' },
      { label: 'Guide Smart TV', path: '/iptv/smart-tv' }
    ],
    h1: 'Comment installer et configurer votre lecture sur Smart TV ?',
    intro: 'Les téléviseurs connectés modernes (Smart TV) permettent d\'accéder à des flux multimédias et à un guide électronique des programmes sans nécessiter de boîtier externe encombrant. Voici la méthode de configuration recommandée pour les principaux systèmes.',
    sections: [
      {
        heading: '1. Équipement compatible et prérequis',
        body: 'Assurez-vous que votre téléviseur est relié à Internet par câble Ethernet RJ45 ou par un réseau Wi-Fi 5 GHz stable (minimum 25 Mbps recommandé pour la haute définition et la 4K). Les systèmes d\'exploitation compatibles incluent Samsung Tizen (modèles 2017+), LG webOS (3.0+) et Android TV / Google TV.'
      },
      {
        heading: '2. Téléchargement d\'une application de lecture certifiée',
        body: 'Rendez-vous sur l\'App Store officiel de votre constructeur (Samsung Smart Hub, LG Content Store ou Google Play Store). Téléchargez une application de lecture multimédia reconnue telle que IBO Player, Smart IPTV ou Nanomid Player.'
      },
      {
        heading: '3. Association et synchronisation de l\'EPG',
        body: 'Relevez l\'adresse MAC et la clé Device Key affichées à l\'écran de l\'application. Ces informations permettent de téléverser votre liste de lecture sécurisée ainsi que le lien XMLTV vers le guide des programmes EPG.'
      }
    ]
  },
  'smarters-pro': {
    slug: 'smarters-pro',
    title: 'Guide d\'utilisation de l\'application IPTV Smarters Pro',
    metaTitle: 'Guide de Configuration IPTV Smarters Pro | Tutoriel Neutre',
    metaDescription: 'Notice informative et pas-à-pas pour configurer l\'application tierce IPTV Smarters Pro sur smartphone, tablette, PC et TV connectée.',
    breadcrumbs: [
      { label: 'Accueil', path: '/' },
      { label: 'IPTV', path: '/iptv' },
      { label: 'Guide Smarters Pro', path: '/iptv/smarters-pro' }
    ],
    h1: 'Notice d\'utilisation : Application IPTV Smarters Pro',
    intro: 'IPTV Smarters Pro est une application logicielle tierce indépendante dédiée à la lecture de flux vidéo et de grilles de programmes EPG. Ce tutoriel informatif vous explique son fonctionnement.',
    sections: [
      {
        heading: 'Avertissement de non-affiliation',
        body: 'Notre site n\'est affilié à aucun titre aux développeurs de l\'application IPTV Smarters Pro. Cette page a une finalité purement informative et documentaire d\'aide à la prise en main de ce lecteur tiers.'
      },
      {
        heading: 'Installation sur vos appareils',
        body: 'L\'application est disponible en téléchargement sur le Google Play Store pour Android, l\'Apple App Store pour iPhone et iPad, ainsi que sur Windows et macOS via les exécutables fournis par l\'éditeur du logiciel.'
      },
      {
        heading: 'Configuration des accès et du guide EPG',
        body: 'À l\'ouverture de Smarters Pro, sélectionnez la méthode de connexion "Xtream Codes API" ou "Load Your Playlist or File/URL". Renseignez vos paramètres de connexion pour synchroniser automatiquement les catégories et les horaires de diffusion.'
      }
    ]
  },
  'tivimate': {
    slug: 'tivimate',
    title: 'Configuration et optimisation de TiviMate IPTV Player',
    metaTitle: 'Guide de Configuration TiviMate IPTV Player | Tutoriel Neutre',
    metaDescription: 'Tutoriel complet pour tirer le meilleur parti de l\'interface TV fluide de TiviMate sur Android TV, Nvidia Shield et Fire TV Stick.',
    breadcrumbs: [
      { label: 'Accueil', path: '/' },
      { label: 'IPTV', path: '/iptv' },
      { label: 'TiviMate', path: '/iptv/tivimate' }
    ],
    h1: 'Guide d\'utilisation de TiviMate IPTV Player',
    intro: 'Réputé pour son ergonomie calquée sur les décodeurs TV traditionnels, TiviMate est l\'un des lecteurs les plus appréciés sur boîtiers Android TV et FireStick. Voici les réglages indispensables.',
    sections: [
      {
        heading: 'Mention d\'indépendance',
        body: 'TiviMate est une marque commerciale appartenant à son développeur exclusif. Nous n\'avons aucun lien capitalistique ni affiliation officielle avec cette application logicielle.'
      },
      {
        heading: 'Installation sur boîtier Android TV et Fire TV',
        body: 'Sur boîtier Android TV ou Chromecast avec Google TV, installez TiviMate directement depuis le Google Play Store. Sur Amazon Fire TV Stick, l\'installation s\'effectue via l\'outil utilitaire officiel Downloader.'
      },
      {
        heading: 'Optimisation de la grille EPG',
        body: 'Dans les paramètres de TiviMate, activez la mise à jour automatique de l\'EPG au démarrage de l\'application et configurez un intervalle de rafraîchissement toutes les 24 heures pour disposer en permanence de la programmation télévisée à jour.'
      }
    ]
  },
  '1-mois': {
    slug: '1-mois',
    title: 'Informations sur les abonnements IPTV courte durée et 1 mois',
    metaTitle: 'Abonnement IPTV 1 mois : Avantages, Tarifs & Comparatif',
    metaDescription: 'Tout savoir sur la formule 1 mois en IPTV : flexibilité, tarification par rapport aux offres 3, 6 et 12 mois, et conseils avant souscription.',
    breadcrumbs: [
      { label: 'Accueil', path: '/' },
      { label: 'IPTV', path: '/iptv' },
      { label: '1 mois', path: '/iptv/1-mois' }
    ],
    h1: 'Abonnement IPTV 1 mois : Pourquoi privilégier la formule 3 mois ?',
    intro: 'De nombreux utilisateurs recherchent une formule mensuelle sans engagement pour évaluer la stabilité de leur connexion. Découvrez nos recommandations comparatives.',
    sections: [
      {
        heading: 'Pourquoi la formule 3 mois à 16,99 € est plus avantageuse',
        body: 'Les offres d\'un mois isolé impliquent des coûts fixes de traitement de paiement et d\'activation de serveur élevés (souvent facturées 10 à 12 € pour seulement 30 jours). Notre offre 3 mois à 16,99 € revient à seulement 5,66 € par mois, soit une économie immédiate de plus de 45% tout en vous offrant une période de test confortable.'
      },
      {
        heading: 'Garantie de satisfaction de 7 jours',
        body: 'Pour vous permettre de tester sereinement votre équipement, toutes nos formules bénéficient d\'une garantie de 7 jours sous réserve de conformité technique. En cas de blocage technique irrésolu, notre équipe étudie votre dossier avec transparence.'
      }
    ]
  },
  'essai': {
    slug: 'essai',
    title: 'Période d\'essai et test IPTV : ce qu\'il faut savoir',
    metaTitle: 'Essai IPTV 24h & Période de Test : Modalités et Conseils',
    metaDescription: 'Découvrez comment fonctionnent les tests et essais IPTV, les conditions d\'éligibilité technique et nos garanties de satisfaction.',
    breadcrumbs: [
      { label: 'Accueil', path: '/' },
      { label: 'IPTV', path: '/iptv' },
      { label: 'Essai', path: '/iptv/essai' }
    ],
    h1: 'Période de test et essai : Comment valider votre configuration ?',
    intro: 'Avant de choisir une formule longue durée, il est légitime de vérifier que votre débit Internet et votre téléviseur délivrent une expérience fluide sans coupure.',
    sections: [
      {
        heading: 'Validation technique de votre débit',
        body: 'Avant tout essai, effectuez un test de bande passante sur votre téléviseur. Un débit descendant stable de 15 Mbps en Full HD et de 30 Mbps en 4K est nécessaire pour éviter les mises en mémoire tampon (buffering).'
      },
      {
        heading: 'Comment demander un test ou commander',
        body: 'Notre support WhatsApp est à votre disposition pour vous orienter vers la formule d\'accès la plus adaptée à vos besoins et vous accompagner pas-à-pas dans la configuration de votre lecteur multimédia.'
      }
    ]
  },
  'abonnement': {
    slug: 'abonnement',
    title: 'Abonnement IPTV : Guide complet des formules et fonctionnalités',
    metaTitle: 'Abonnement IPTV : Formules 3, 6 et 12 mois sans engagement',
    metaDescription: 'Consultez les formules d\'abonnement IPTV adaptées à vos besoins : durée, fonctionnalités, compatibilité Smart TV et assistance WhatsApp 7j/7.',
    breadcrumbs: [
      { label: 'Accueil', path: '/' },
      { label: 'IPTV', path: '/iptv' },
      { label: 'Abonnement', path: '/iptv/abonnement' }
    ],
    h1: 'Abonnement IPTV : Comparatif des formules et guide de souscription',
    intro: 'Nos formules d\'abonnement sont conçues pour offrir une flexibilité maximale sans prélèvement automatique récurrent. Choisissez la durée adaptée à vos habitudes de visionnage et profitez d\'une activation guidée pas à pas.',
    sections: [
      {
        heading: 'Pourquoi souscrire une formule sans prélèvement automatique ?',
        body: 'Contrairement aux abonnements traditionnels avec tacite reconduction, nos formules fonctionnent par règlement unique (3 mois, 6 mois ou 12 mois). Vous gardez le contrôle total de vos dépenses sans mauvaise surprise à la fin du mois.'
      },
      {
        heading: 'Guide électronique des programmes (EPG) inclus',
        body: 'Chaque formule intègre l\'accès à l\'EPG synchronisé, permettant d\'afficher les horaires de diffusion, les résumés des émissions et la fonction Catch-up (replay) sur les applications compatibles telles que TiviMate ou IPTV Smarters Pro.'
      },
      {
        heading: 'Activation assistée et support personnalisé 7j/7',
        body: 'Une fois votre formule sélectionnée, la confirmation s\'effectue directement auprès de nos conseillers sur WhatsApp afin de vous fournir les accès personnalisés selon votre modèle exact de téléviseur ou d\'application.'
      }
    ]
  },
  'prix': {
    slug: 'prix',
    title: 'Prix et Tarifs des abonnements IPTV : 3, 6 et 12 mois',
    metaTitle: 'Prix Abonnement IPTV : Comparatif des tarifs 2026',
    metaDescription: 'Tableau des prix des formules IPTV : 16,99 € (3 mois), 21,99 € (6 mois) et 36,99 € (12 mois VIP). Tarifs transparents sans frais cachés.',
    breadcrumbs: [
      { label: 'Accueil', path: '/' },
      { label: 'IPTV', path: '/iptv' },
      { label: 'Tarifs & Prix', path: '/iptv/prix' }
    ],
    h1: 'Prix et Tarifs IPTV : La grille transparente',
    intro: 'Découvrez notre barème tarifaire clair et sans mauvaise surprise. Plus la durée souscrite est longue, plus le coût mensuel équivalent est réduit.',
    sections: [
      {
        heading: 'Formule Découverte (3 mois) : 16,99 €',
        body: 'Idéale pour tester le service sur la durée d\'un trimestre complet sans engagement prolongé. Coût mensuel équivalent : 5,66 € / mois pour 1 appareil avec support complet.'
      },
      {
        heading: 'Formule Semestrielle (6 mois) : 21,99 €',
        body: 'Le juste équilibre entre souplesse et économie pour une demi-année de divertissement continu. Coût mensuel équivalent : 3,66 € / mois.'
      },
      {
        heading: 'Formule Annuelle VIP (12 mois) : 36,99 €',
        body: 'Notre offre la plus économique et populaire. Profitez d\'une année complète à seulement 3,08 € par mois, avec un accompagnement prioritaire 7j/7 et la compatibilité 4K / FHD.'
      }
    ]
  },
  'faq': {
    slug: 'faq',
    title: 'Foire Aux Questions IPTV : Tout savoir avant de commander',
    metaTitle: 'FAQ IPTV : Questions fréquentes, Débit, Matériel & Support',
    metaDescription: 'Réponses à toutes vos questions sur les abonnements IPTV : débit Internet requis, Smart TV compatibles, chaînes incluses et délai d\'activation.',
    breadcrumbs: [
      { label: 'Accueil', path: '/' },
      { label: 'IPTV', path: '/iptv' },
      { label: 'FAQ IPTV', path: '/iptv/faq' }
    ],
    h1: 'Questions Fréquentes sur les Abonnements IPTV',
    intro: 'Retrouvez les réponses détaillées à l\'ensemble des interrogations techniques et commerciales avant de valider votre abonnement.',
    sections: [
      {
        heading: 'Quel débit Internet est nécessaire ?',
        body: 'Pour un flux standard (HD), un débit stable de 10 Mbps est suffisant. Pour les chaînes Full HD et 4K Ultra HD, nous préconisons un débit minimum de 25 à 30 Mbps, de préférence en connexion filaire Ethernet ou Wi-Fi 5 GHz.'
      },
      {
        heading: 'Quels appareils sont compatibles ?',
        body: 'Nos formules sont compatibles avec les Smart TV (Samsung, LG, Sony, Philips), les boîtiers Android TV (Xiaomi Mi Box, Nvidia Shield), les clés Amazon Fire TV Stick, Apple TV, smartphones iOS/Android et ordinateurs Windows/Mac.'
      },
      {
        heading: 'Quel est le délai d\'activation après commande ?',
        body: 'L\'activation est quasi-instantanée dès la validation de votre demande via WhatsApp. Notre équipe technique vous transmet vos codes et identifiants et vous guide pas à pas.'
      },
      {
        heading: 'L\'EPG (Guide TV) est-il inclus ?',
        body: 'Oui, toutes nos formules intègrent le guide électronique des programmes (EPG) pour visualiser en direct les émissions en cours et les programmes de la soirée.'
      }
    ]
  }
};
