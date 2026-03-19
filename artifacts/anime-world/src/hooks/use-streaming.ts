import { useQuery, useMutation } from "@tanstack/react-query";

const API_BASE = "/api/streaming";

export interface StreamingResult {
  id: string;
  title: string;
  image?: string;
  subOrDub?: string;
}

export interface EpisodeSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface StreamingInfo {
  id: string;
  title: string;
  episodes?: { id: string; number: number; url: string }[];
}

export interface EpisodeData {
  episodeId: string;
  episodeNumber: number;
  source?: EpisodeSource;
  allSources?: EpisodeSource[];
  headers?: Record<string, string>;
  download?: string;
}

async function searchAnimeStream(title: string): Promise<{ results: StreamingResult[] }> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(title)}`);
  if (!res.ok) throw new Error("Error buscando anime");
  return res.json();
}

async function getAnimeStreamInfo(id: string): Promise<StreamingInfo> {
  const res = await fetch(`${API_BASE}/info/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Error obteniendo información");
  return res.json();
}

async function getEpisodeEmbed(animeId: string, episode: number): Promise<EpisodeData> {
  const res = await fetch(`${API_BASE}/embed/${encodeURIComponent(animeId)}/${episode}`);
  if (!res.ok) throw new Error("Error obteniendo episodio");
  return res.json();
}

export function useSearchAnimeStream(title: string, enabled = false) {
  return useQuery({
    queryKey: ["stream-search", title],
    queryFn: () => searchAnimeStream(title),
    enabled: enabled && !!title,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useAnimeStreamInfo(streamId: string, enabled = false) {
  return useQuery({
    queryKey: ["stream-info", streamId],
    queryFn: () => getAnimeStreamInfo(streamId),
    enabled: enabled && !!streamId,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useEpisodeEmbed(animeId: string, episode: number | null, enabled = false) {
  return useQuery({
    queryKey: ["stream-embed", animeId, episode],
    queryFn: () => getEpisodeEmbed(animeId, episode!),
    enabled: enabled && !!animeId && episode !== null,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}
