export type ProgramCategory = 
  | 'film'
  | 'serie'
  | 'sport'
  | 'info'
  | 'divertissement'
  | 'jeunesse'
  | 'documentaire'
  | 'magazine';

export type SmartImageType =
  | 'epg'
  | 'tmdb'
  | 'program'
  | 'brand'
  | 'category'
  | 'fallback'
  | 'none';

export interface SmartImageResult {
  imageUrl: string | null;
  imageType: SmartImageType;
  confidence: number;
  category: string;
  subcategory?: string;
  brand?: string;
  matchedKeyword?: string;
}

export interface Channel {
  id: string;
  number: number;
  name: string;
  slug: string;
  logo: string;
  logoUrl?: string;
  badgeColor: string;
  isTnt: boolean;
  category: string;
  description: string;
  websiteUrl?: string;
}

export interface Program {
  id: string;
  channelId: string;
  title: string;
  subtitle?: string;
  category: ProgramCategory;
  genre: string; // e.g. "Comédie policière", "Journal télévisé", "Football"
  startTime: string; // "21:10"
  endTime: string; // "23:00"
  durationMinutes: number;
  dateOffset: number; // 0: today, 1: tomorrow, 2: day after
  dateStr: string; // "YYYY-MM-DD"
  isPrimeTime?: boolean;
  synopsis: string;
  rating?: string; // "Tous publics", "-10 ans", "-12 ans"
  director?: string;
  actors?: string[];
  presenter?: string;
  seasonEpisode?: string;
  year?: number;
  country?: string;
  imageUrl: string;

  // Smart Image Engine fields (optional)
  imageType?: SmartImageType;
  imageConfidence?: number;
  subcategory?: string;
  brand?: string;

  // TMDB Movie & Film Enrichment Fields (optional)
  tmdb_id?: number;
  tmdb_media_type?: 'movie' | 'tv';
  tmdb_title?: string;
  tmdb_original_title?: string;
  tmdb_overview?: string;
  tmdb_poster_path?: string;
  tmdb_backdrop_path?: string;
  tmdb_release_date?: string;
  tmdb_year?: number;
  tmdb_genres?: string[];
  tmdb_runtime?: number;
  tmdb_vote_average?: number;
  tmdb_trailer_key?: string;
  tmdb_match_confidence?: number;
  tmdb_match_method?: 'exact' | 'normalized_alternative' | 'semantic_keyword' | 'anthology_collection';
}

export interface IptvPlan {
  id: string;
  slug: string;
  name: string;
  durationMonths: number;
  price: number;
  currency: string;
  isVip?: boolean;
  popular?: boolean;
  devices: number;
  features: string[];
  description: string;
  badge?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: string;
  planId: string;
  planName: string;
  durationMonths: number;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deviceType?: string;
  macAddress?: string;
  paymentMethod: 'whatsapp' | 'card' | 'direct';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: 'tv' | 'iptv' | 'technique' | 'paiement';
}

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}
