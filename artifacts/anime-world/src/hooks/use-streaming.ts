import { useQuery } from "@tanstack/react-query";

const API_BASE = `${import.meta.env.VITE_API_URL || ""}/api/streaming`;

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
  server?: string;
  lang?: string;
}

export interface StreamingInfo {
  id: string;
  title: string;
  episodes?: { id: string; number: number; url: string }[];
}

export interface DownloadLink {
  url: string;
  quality: string;
}

export interface EpisodeData {
  episodeId?: string;
  episodeNumber: number;
  source?: EpisodeSource;
  allSources?: EpisodeSource[];
  headers?: Record<string, string>;
  download?: DownloadLink[];
  provider?: string;
}

export interface FlvResult {
  id: string;
  slug: string;
  title: string;
  image: string;
  type: string;
}

export interface FlvInfo {
  id: string;
  title: string;
  slug: string;
  episodes: { number: number; id: number }[];
}

async function searchAnimeStream(title: string): Promise<{ results: StreamingResult[] }> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(title)}`);
  if (!res.ok) throw new Error("Error buscando anime");
  return res.json();
}

async function getAnimeStreamInfo(id: string): Promise<StreamingInfo> {
  const res = await fetch(`${API_BASE}/info?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Error obteniendo información");
  return res.json();
}

async function getEpisodeEmbed(animeId: string, episode: number): Promise<EpisodeData> {
  const res = await fetch(`${API_BASE}/embed?animeId=${encodeURIComponent(animeId)}&episode=${episode}`);
  if (!res.ok) throw new Error("Error obteniendo episodio");
  return res.json();
}

async function searchFlv(title: string): Promise<{ results: FlvResult[] }> {
  const res = await fetch(`${API_BASE}/flv/search?q=${encodeURIComponent(title)}`);
  if (!res.ok) throw new Error("Error buscando en AnimeFLV");
  return res.json();
}

async function getFlvInfo(slug: string): Promise<FlvInfo> {
  const res = await fetch(`${API_BASE}/flv/info?id=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error("Error obteniendo info de AnimeFLV");
  return res.json();
}

async function getFlvEmbed(slug: string, episode: number): Promise<EpisodeData> {
  const res = await fetch(`${API_BASE}/flv/embed?slug=${encodeURIComponent(slug)}&episode=${episode}`);
  if (!res.ok) throw new Error("Error obteniendo episodio de AnimeFLV");
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

export function useSearchFlv(title: string, enabled = false) {
  return useQuery({
    queryKey: ["flv-search", title],
    queryFn: () => searchFlv(title),
    enabled: enabled && !!title,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useFlvInfo(slug: string, enabled = false) {
  return useQuery({
    queryKey: ["flv-info", slug],
    queryFn: () => getFlvInfo(slug),
    enabled: enabled && !!slug,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useFlvEmbed(slug: string, episode: number | null, enabled = false) {
  return useQuery({
    queryKey: ["flv-embed", slug, episode],
    queryFn: () => getFlvEmbed(slug, episode!),
    enabled: enabled && !!slug && episode !== null,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}
