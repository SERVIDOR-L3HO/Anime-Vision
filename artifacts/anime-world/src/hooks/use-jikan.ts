import { useQuery } from "@tanstack/react-query";
import { JikanResponse, Anime, Genre, Character } from "@/lib/types";

const BASE_URL = "https://api.jikan.moe/v4";

// Helper to handle API rate limits and basic fetch
async function fetchJikan<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    throw new Error("Failed to fetch data from Jikan API");
  }
  return res.json();
}

export function useTopAnime(filter?: "airing" | "upcoming" | "bypopularity" | "favorite", limit: number = 10, page: number = 1) {
  return useQuery({
    queryKey: ["top-anime", filter, limit, page],
    queryFn: () => {
      let url = `/top/anime?page=${page}&limit=${limit}`;
      if (filter) url += `&filter=${filter}`;
      return fetchJikan<JikanResponse<Anime[]>>(url);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSearchAnime(query: string, genreId?: string, page: number = 1) {
  return useQuery({
    queryKey: ["search-anime", query, genreId, page],
    queryFn: () => {
      let url = `/anime?page=${page}&limit=24`;
      if (query) url += `&q=${encodeURIComponent(query)}`;
      if (genreId) url += `&genres=${genreId}`;
      url += `&sfw=true`; // Keep it safe for work
      return fetchJikan<JikanResponse<Anime[]>>(url);
    },
    // Don't run query if empty search and no genre
    enabled: true, 
  });
}

export function useAnimeDetail(id: string) {
  return useQuery({
    queryKey: ["anime-detail", id],
    queryFn: () => fetchJikan<JikanResponse<Anime>>(`/anime/${id}`),
    enabled: !!id,
  });
}

export function useAnimeCharacters(id: string) {
  return useQuery({
    queryKey: ["anime-characters", id],
    queryFn: () => fetchJikan<JikanResponse<Character[]>>(`/anime/${id}/characters`),
    enabled: !!id,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => fetchJikan<JikanResponse<Genre[]>>(`/genres/anime?filter=genres`),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (genres rarely change)
  });
}
