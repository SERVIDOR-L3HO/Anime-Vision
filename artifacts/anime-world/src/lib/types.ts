// Jikan API Type Definitions

export interface JikanResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

export interface AnimeImage {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

export interface Anime {
  mal_id: number;
  url: string;
  images: {
    jpg: AnimeImage;
    webp: AnimeImage;
  };
  trailer?: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  title: string;
  title_english: string;
  title_japanese: string;
  type: string;
  source: string;
  episodes: number;
  status: string;
  airing: boolean;
  aired: {
    string: string;
  };
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  synopsis: string;
  background: string;
  season: string;
  year: number;
  studios: { mal_id: number; type: string; name: string; url: string }[];
  genres: { mal_id: number; type: string; name: string; url: string }[];
}

export interface Genre {
  mal_id: number;
  name: string;
  url: string;
  count: number;
}

export interface Character {
  character: {
    mal_id: number;
    url: string;
    images: {
      jpg: { image_url: string };
      webp: { image_url: string; small_image_url: string };
    };
    name: string;
  };
  role: string;
}

export interface Episode {
  mal_id: number;
  url: string;
  title: string;
  title_japanese?: string;
  title_romanji?: string;
  aired?: string;
  score?: number;
  filler: boolean;
  recap: boolean;
  forum_url?: string;
}

export interface WatchEpisodeItem {
  mal_id: number;
  url: string;
  title: string;
  episode: string;
  filler: boolean;
  recap: boolean;
}

export interface WatchEntry {
  entry: {
    mal_id: number;
    url: string;
    images: {
      jpg: AnimeImage;
      webp: AnimeImage;
    };
    title: string;
  };
  episodes: WatchEpisodeItem[];
  region_locked: boolean;
}
