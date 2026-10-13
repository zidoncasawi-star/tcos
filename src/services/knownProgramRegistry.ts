/**
 * Known Program Registry
 * High-identity registry for flagship French television shows, talk shows,
 * magazines, game shows, and cultural broadcasts.
 */

export interface KnownProgramEntry {
  id: string;
  name: string;
  normalizedName: string;
  aliases: string[];
  category: string;
  subcategory?: string;
  imageUrl: string;
  confidence: number;
}

export const KNOWN_PROGRAMS: KnownProgramEntry[] = [
  // Talk Shows & Magazines
  {
    id: 'c-a-vous',
    name: 'C à vous',
    normalizedName: 'c a vous',
    aliases: ['c a vous', 'c a vous la suite', 'c a vous l\'invite', 'c a vous l invite'],
    category: 'magazine',
    subcategory: 'talk-show',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'quotidien',
    name: 'Quotidien',
    normalizedName: 'quotidien',
    aliases: ['quotidien', 'quotidien premiere partie', 'quotidien deuxieme partie', 'quotidien avec yann barthes', 'quotidien le mag'],
    category: 'divertissement',
    subcategory: 'talk-show',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'tpmp',
    name: 'Touche pas à mon poste !',
    normalizedName: 'touche pas a mon poste',
    aliases: ['tpmp', 'touche pas a mon poste', 'touche pas a mon poste !', 'tpmp le before', 'tpmp premiere partie', 'tpmp le debrief', 'tpmp week-end'],
    category: 'divertissement',
    subcategory: 'talk-show',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'c-dans-lair',
    name: 'C dans l\'air',
    normalizedName: 'c dans lair',
    aliases: ['c dans lair', 'c dans l air', 'c dans l\'air', 'c dans l air l invite'],
    category: 'info',
    subcategory: 'debate',
    imageUrl: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },

  // Reality & Competitions
  {
    id: 'koh-lanta',
    name: 'Koh-Lanta',
    normalizedName: 'koh lanta',
    aliases: ['koh-lanta', 'koh lanta', 'koh lanta les chasseurs d immunite', 'koh lanta les armes secretes', 'koh lanta le totem maudit', 'koh lanta le feu sacre'],
    category: 'divertissement',
    subcategory: 'adventure',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'the-voice',
    name: 'The Voice',
    normalizedName: 'the voice',
    aliases: ['the voice', 'the voice la plus belle voix', 'the voice kids', 'the voice la suite'],
    category: 'divertissement',
    subcategory: 'music-competition',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'top-chef',
    name: 'Top Chef',
    normalizedName: 'top chef',
    aliases: ['top chef', 'top chef les secrets des grands chefs', 'top chef le choc des brigades', 'top chef le duel'],
    category: 'cuisine',
    subcategory: 'gastronomy',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'fort-boyard',
    name: 'Fort Boyard',
    normalizedName: 'fort boyard',
    aliases: ['fort boyard', 'fort boyard toujours plus fort', 'fort boyard les secrets du fort'],
    category: 'divertissement',
    subcategory: 'game-show',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'le-meilleur-patissier',
    name: 'Le Meilleur Pâtissier',
    normalizedName: 'le meilleur patissier',
    aliases: ['le meilleur patissier', 'le meilleur patissier les professionnels', 'lmp'],
    category: 'cuisine',
    subcategory: 'pastry',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'danse-avec-les-stars',
    name: 'Danse avec les stars',
    normalizedName: 'danse avec les stars',
    aliases: ['danse avec les stars', 'dals', 'danse avec les stars la suite'],
    category: 'divertissement',
    subcategory: 'dance',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'star-academy',
    name: 'Star Academy',
    normalizedName: 'star academy',
    aliases: ['star academy', 'star academy le prime', 'star academy la quotidienne', 'star ac'],
    category: 'divertissement',
    subcategory: 'music-competition',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'pekin-express',
    name: 'Pékin Express',
    normalizedName: 'pekin express',
    aliases: ['pekin express', 'pekin express sur les traces du tigre d or', 'pekin express le choix secret', 'pekin express iteneraire bis'],
    category: 'divertissement',
    subcategory: 'adventure',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },

  // Sports Flagships
  {
    id: 'stade-2',
    name: 'Stade 2',
    normalizedName: 'stade 2',
    aliases: ['stade 2', 'stade2', 'stade 2 france 2', 'stade 2 france 3', 'emission stade 2'],
    category: 'sport',
    subcategory: 'sports-magazine',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'telefoot',
    name: 'Téléfoot',
    normalizedName: 'telefoot',
    aliases: ['telefoot', 'telefoot tf1', 'telefoot le mag', 'telefoot l after'],
    category: 'sport',
    subcategory: 'football',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'lequipe-du-soir',
    name: 'L\'Équipe du Soir',
    normalizedName: 'l equipe du soir',
    aliases: ['l equipe du soir', 'l\'equipe du soir', 'eds', 'l equipe de greg'],
    category: 'sport',
    subcategory: 'sports-debate',
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'auto-moto',
    name: 'Auto Moto',
    normalizedName: 'auto moto',
    aliases: ['auto moto', 'automoto', 'auto-moto'],
    category: 'sport',
    subcategory: 'motorsport',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'turbo',
    name: 'Turbo',
    normalizedName: 'turbo',
    aliases: ['turbo', 'turbo m6'],
    category: 'magazine',
    subcategory: 'automotive',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },

  // Investigations & Grand Magazines
  {
    id: 'envoye-special',
    name: 'Envoyé spécial',
    normalizedName: 'envoye special',
    aliases: ['envoye special', 'envoye special france 2', 'magazine envoye special'],
    category: 'documentaire',
    subcategory: 'investigation',
    imageUrl: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'capital',
    name: 'Capital',
    normalizedName: 'capital',
    aliases: ['capital', 'capital m6', 'magazine capital'],
    category: 'magazine',
    subcategory: 'economy',
    imageUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'zone-interdite',
    name: 'Zone Interdite',
    normalizedName: 'zone interdite',
    aliases: ['zone interdite', 'zone interdite m6', 'magazine zone interdite'],
    category: 'documentaire',
    subcategory: 'investigation',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'sept-a-huit',
    name: 'Sept à Huit',
    normalizedName: 'sept a huit',
    aliases: ['sept a huit', '7 a 8', '7 à 8', 'sept a huit life'],
    category: 'magazine',
    subcategory: 'reportage',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'complement-denquete',
    name: 'Complément d\'enquête',
    normalizedName: 'complement denquete',
    aliases: ['complement denquete', 'complement d enquete', 'complement d\'enquete'],
    category: 'documentaire',
    subcategory: 'investigation',
    imageUrl: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'cash-investigation',
    name: 'Cash Investigation',
    normalizedName: 'cash investigation',
    aliases: ['cash investigation', 'cash investigation france 2'],
    category: 'documentaire',
    subcategory: 'investigation',
    imageUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },

  // Discovery & Travel
  {
    id: 'echappees-belles',
    name: 'Échappées belles',
    normalizedName: 'echappees belles',
    aliases: ['echappees belles', 'echappees belles france 5'],
    category: 'travel',
    subcategory: 'discovery',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'des-racines-et-des-ailes',
    name: 'Des racines et des ailes',
    normalizedName: 'des racines et des ailes',
    aliases: ['des racines et des ailes', 'des racines & des ailes'],
    category: 'travel',
    subcategory: 'heritage',
    imageUrl: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'secrets-dhistoire',
    name: 'Secrets d\'Histoire',
    normalizedName: 'secrets dhistoire',
    aliases: ['secrets dhistoire', 'secrets d histoire', 'secrets d\'histoire'],
    category: 'documentaire',
    subcategory: 'history',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'faut-pas-rever',
    name: 'Faut pas rêver',
    normalizedName: 'faut pas rever',
    aliases: ['faut pas rever', 'faut pas rêver'],
    category: 'travel',
    subcategory: 'discovery',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },

  // Game Shows
  {
    id: '12-coups-de-midi',
    name: 'Les 12 coups de midi',
    normalizedName: 'les 12 coups de midi',
    aliases: ['les 12 coups de midi', 'les douze coups de midi', '12 coups de midi'],
    category: 'divertissement',
    subcategory: 'game-show',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'tout-le-monde-veut-prendre-sa-place',
    name: 'Tout le monde veut prendre sa place',
    normalizedName: 'tout le monde veut prendre sa place',
    aliases: ['tout le monde veut prendre sa place', 'tlmvpsp'],
    category: 'divertissement',
    subcategory: 'game-show',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'noubliez-pas-les-paroles',
    name: 'N\'oubliez pas les paroles !',
    normalizedName: 'noubliez pas les paroles',
    aliases: ['noubliez pas les paroles', 'n\'oubliez pas les paroles', 'n\'oubliez pas les paroles !', 'nopulp'],
    category: 'divertissement',
    subcategory: 'music-game',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'questions-pour-un-champion',
    name: 'Questions pour un champion',
    normalizedName: 'questions pour un champion',
    aliases: ['questions pour un champion', 'qpuc'],
    category: 'divertissement',
    subcategory: 'game-show',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'slam',
    name: 'Slam',
    normalizedName: 'slam',
    aliases: ['slam', 'le grand slam', 'slam france 3'],
    category: 'divertissement',
    subcategory: 'game-show',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },

  // Daily News Editions
  {
    id: 'le-20h',
    name: 'Le 20H de TF1 / Journal de 20h',
    normalizedName: 'journal de 20h',
    aliases: ['journal de 20h', 'le 20h', 'le 20h de tf1', 'journal de 20 heures', 'jt 20h', '20 heures france 2', '20h'],
    category: 'info',
    subcategory: 'news',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'le-13h',
    name: 'Le 13H / Journal de 13h',
    normalizedName: 'journal de 13h',
    aliases: ['journal de 13h', 'le 13h', 'le 13h de tf1', 'journal de 13 heures', 'jt 13h', '13 heures france 2', '13h'],
    category: 'info',
    subcategory: 'news',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },
  {
    id: 'telematin',
    name: 'Télématin',
    normalizedName: 'telematin',
    aliases: ['telematin', 'telematin france 2', 'télématin'],
    category: 'magazine',
    subcategory: 'morning',
    imageUrl: 'https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  },

  // Music Flagships
  {
    id: 'taratata',
    name: 'Taratata',
    normalizedName: 'taratata',
    aliases: ['taratata', 'taratata 100% live', 'taratata live'],
    category: 'musique',
    subcategory: 'live-music',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
    confidence: 0.96
  }
];

/**
 * Search the known program registry by clean normalized text
 */
export function findKnownProgram(normalizedQuery: string): KnownProgramEntry | null {
  if (!normalizedQuery) return null;
  const q = normalizedQuery.toLowerCase().trim();

  for (const prog of KNOWN_PROGRAMS) {
    if (prog.normalizedName === q) return prog;
    if (prog.aliases.some(alias => alias === q || q.startsWith(alias) || alias.startsWith(q))) {
      return prog;
    }
  }

  // Substring search for high distinctiveness
  for (const prog of KNOWN_PROGRAMS) {
    if (prog.normalizedName.length >= 5 && q.includes(prog.normalizedName)) {
      return prog;
    }
  }

  return null;
}
