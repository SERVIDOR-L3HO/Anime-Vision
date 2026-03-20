import { Router, type Request, type Response } from "express";
import pkg from "@consumet/extensions";
import {
  searchAnimeFlv,
  getAnimeFlvInfo,
  getEpisodeServers,
  extractVideoUrl,
  type VideoServer,
} from "../providers/animeflv.js";

const { ANIME } = pkg;

const router = Router();

const animePahe = new ANIME.AnimePahe();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro q" });
      return;
    }

    let results = await animePahe.search(q);

    if (!results.results || results.results.length === 0) {
      const titleWords = q.split(" ").slice(0, 3).join(" ");
      results = await animePahe.search(titleWords);
    }

    res.json({
      provider: "animepahe",
      results: (results.results || []).slice(0, 10).map((r: any) => ({
        id: r.id,
        title: r.title,
        url: r.url,
        image: r.image,
        releaseDate: r.releaseDate,
        subOrDub: r.subOrDub,
      })),
    });
  } catch (err) {
    console.error("Error buscando anime:", err);
    res.status(500).json({ error: "Error al buscar el anime" });
  }
});

router.get("/flv/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro q" });
      return;
    }

    const results = await searchAnimeFlv(q);
    res.json({
      provider: "animeflv",
      results: results.slice(0, 10),
    });
  } catch (err) {
    console.error("Error buscando en AnimeFLV:", err);
    res.status(500).json({ error: "Error al buscar en AnimeFLV" });
  }
});

router.get("/flv/info", async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro id" });
      return;
    }
    const info = await getAnimeFlvInfo(id);
    res.json(info);
  } catch (err) {
    console.error("Error obteniendo info AnimeFLV:", err);
    res.status(500).json({ error: "Error al obtener información de AnimeFLV" });
  }
});

router.get("/flv/servers", async (req: Request, res: Response) => {
  try {
    const { slug, episode } = req.query;
    if (!slug || typeof slug !== "string" || !episode || typeof episode !== "string") {
      res.status(400).json({ error: "Se requieren slug y episode" });
      return;
    }
    const epNum = parseInt(episode, 10);
    if (Number.isNaN(epNum) || epNum <= 0) {
      res.status(400).json({ error: "Número de episodio inválido" });
      return;
    }

    const servers = await getEpisodeServers(slug, epNum);
    res.json({ servers });
  } catch (err) {
    console.error("Error obteniendo servidores:", err);
    res.status(500).json({ error: "Error al obtener servidores del episodio" });
  }
});

router.get("/flv/embed", async (req: Request, res: Response) => {
  try {
    const { slug, episode } = req.query;
    if (!slug || typeof slug !== "string" || !episode || typeof episode !== "string") {
      res.status(400).json({ error: "Se requieren slug y episode" });
      return;
    }
    const epNum = parseInt(episode, 10);
    if (Number.isNaN(epNum) || epNum <= 0) {
      res.status(400).json({ error: "Número de episodio inválido" });
      return;
    }

    const servers = await getEpisodeServers(slug, epNum);

    const preferredOrder = ["yu", "sw", "okru", "stape"];
    const sortedServers = [...servers].sort((a, b) => {
      const aIdx = preferredOrder.indexOf(a.server);
      const bIdx = preferredOrder.indexOf(b.server);
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });

    const sources: any[] = [];

    for (const server of sortedServers) {
      if (sources.length >= 4) break;
      const source = await extractVideoUrl(server);
      if (source) {
        const referer = server.server === "yu" ? "https://www.yourupload.com/"
          : server.server === "stape" ? "https://streamtape.com/"
          : server.server === "sw" ? server.url
          : server.url;
        source.url = buildProxyUrl(source.url, referer);
        sources.push(source);
      }
    }

    if (sources.length === 0) {
      res.status(404).json({ error: "No se encontraron fuentes de video reproducibles" });
      return;
    }

    res.json({
      episodeNumber: epNum,
      slug,
      provider: "animeflv",
      allSources: sources,
      headers: {},
      download: sources.filter((s) => !s.isM3U8).map((s) => ({
        url: s.url,
        quality: `${s.quality} (${s.server})`,
      })),
    });
  } catch (err) {
    console.error("Error obteniendo embed AnimeFLV:", err);
    res.status(500).json({ error: "Error al obtener el video del episodio" });
  }
});

router.get("/info", async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro id" });
      return;
    }
    const info = await animePahe.fetchAnimeInfo(id);
    res.json({
      id: info.id,
      title: info.title,
      totalEpisodes: (info as any).totalEpisodes,
      episodes: (info.episodes || []).map((ep: any) => ({
        id: ep.id,
        number: ep.number,
        title: ep.title,
        image: ep.image,
        duration: ep.duration,
        url: ep.url,
      })),
    });
  } catch (err) {
    console.error("Error obteniendo info:", err);
    res.status(500).json({ error: "Error al obtener información del anime" });
  }
});

router.get("/watch", async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro id" });
      return;
    }
    const sources = await animePahe.fetchEpisodeSources(id);

    res.json({
      episodeId: id,
      sources: (sources.sources || []).map((s: any) => ({
        url: s.url,
        quality: s.quality,
        isM3U8: s.isM3U8,
      })),
      headers: sources.headers,
      download: sources.download,
    });
  } catch (err) {
    console.error("Error obteniendo fuentes:", err);
    res.status(500).json({ error: "Error al obtener las fuentes del episodio" });
  }
});

function buildProxyUrl(originalUrl: string, referer: string): string {
  return `/api/streaming/proxy?url=${encodeURIComponent(originalUrl)}&referer=${encodeURIComponent(referer)}`;
}

router.get("/embed", async (req: Request, res: Response) => {
  try {
    const { animeId, episode } = req.query;
    if (!animeId || typeof animeId !== "string" || !episode || typeof episode !== "string") {
      res.status(400).json({ error: "Se requieren animeId y episode" });
      return;
    }
    const epNum = parseInt(episode, 10);
    if (Number.isNaN(epNum) || epNum <= 0) {
      res.status(400).json({ error: "Número de episodio inválido" });
      return;
    }

    const info = await animePahe.fetchAnimeInfo(animeId);
    const ep = (info.episodes || []).find((e: any) => e.number === epNum);

    if (!ep) {
      res.status(404).json({ error: `Episodio ${episode} no encontrado` });
      return;
    }

    const sources = await animePahe.fetchEpisodeSources(ep.id);
    const referer = sources.headers?.Referer || "https://kwik.cx/";

    const allSources = (sources.sources || []).map((s: any) => ({
      url: s.isM3U8 ? buildProxyUrl(s.url, referer) : s.url,
      quality: s.quality,
      isM3U8: s.isM3U8,
    }));

    const hqSource =
      allSources.find((s: any) => s.quality?.includes("1080")) ||
      allSources.find((s: any) => s.quality?.includes("800")) ||
      allSources.find((s: any) => s.quality?.includes("720")) ||
      allSources.find((s: any) => s.quality?.includes("480")) ||
      allSources[0];

    res.json({
      episodeId: ep.id,
      episodeNumber: epNum,
      source: hqSource,
      allSources,
      headers: sources.headers,
      download: sources.download,
    });
  } catch (err) {
    console.error("Error obteniendo embed:", err);
    res.status(500).json({ error: "Error al obtener el video del episodio" });
  }
});

const ALLOWED_PROXY_HOSTS = [
  "uwucdn.top",
  "kwik.cx",
  "kwik.si",
  "streamwish.to",
  "vidcache.net",
  "yourupload.com",
  "streamtape.com",
  "ok.ru",
  "mail.ru",
];

function isAllowedUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    return ALLOWED_PROXY_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

router.get("/proxy", async (req: Request, res: Response) => {
  try {
    const { url, referer } = req.query;
    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro url" });
      return;
    }

    if (!isAllowedUrl(url)) {
      res.status(403).json({ error: "Dominio no permitido" });
      return;
    }

    const refererHeader = (typeof referer === "string" && referer) || "https://kwik.cx/";

    const fetchHeaders: Record<string, string> = {
      "Referer": refererHeader,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const abortController = new AbortController();
    req.on("close", () => abortController.abort());

    let currentUrl = url;
    let response: globalThis.Response | null = null;
    const MAX_REDIRECTS = 5;
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      response = await fetch(currentUrl, {
        headers: fetchHeaders,
        redirect: "manual",
        signal: abortController.signal,
      });
      const status = response.status;
      if (status === 301 || status === 302 || status === 307 || status === 308) {
        const location = response.headers.get("location");
        if (!location) break;
        const resolved = new URL(location, currentUrl).href;
        if (!isAllowedUrl(resolved)) {
          res.status(403).json({ error: "Redirect a dominio no permitido" });
          return;
        }
        currentUrl = resolved;
        continue;
      }
      break;
    }

    if (!response || (!response.ok && response.status !== 206)) {
      res.status(response?.status || 502).json({ error: `Upstream returned ${response?.status || "no response"}` });
      return;
    }

    const finalUrl = currentUrl;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("mpegurl") || url.endsWith(".m3u8")) {
      const text = await response.text();
      const baseUrl = finalUrl.substring(0, finalUrl.lastIndexOf("/") + 1);

      let rewritten = text.replace(/^(?!#)(\S+)$/gm, (line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        const segmentUrl = trimmed.startsWith("http") ? trimmed : baseUrl + trimmed;
        return `/api/streaming/proxy?url=${encodeURIComponent(segmentUrl)}&referer=${encodeURIComponent(refererHeader)}`;
      });

      rewritten = rewritten.replace(/(URI=")(https?:\/\/[^"]+)(")/g, (_match, prefix, keyUrl, suffix) => {
        return `${prefix}/api/streaming/proxy?url=${encodeURIComponent(keyUrl)}&referer=${encodeURIComponent(refererHeader)}${suffix}`;
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(rewritten);
    } else {
      res.status(response.status);
      res.setHeader("Content-Type", contentType || "video/mp4");
      res.setHeader("Access-Control-Allow-Origin", "*");

      const contentLength = response.headers.get("content-length");
      if (contentLength) res.setHeader("Content-Length", contentLength);

      const contentRange = response.headers.get("content-range");
      if (contentRange) res.setHeader("Content-Range", contentRange);

      const acceptRanges = response.headers.get("accept-ranges");
      if (acceptRanges) res.setHeader("Accept-Ranges", acceptRanges);

      if (response.body) {
        const { Readable } = await import("stream");
        const nodeStream = Readable.fromWeb(response.body as any);
        nodeStream.pipe(res);
        nodeStream.on("error", (err: Error) => {
          if (err.name === "AbortError") return;
          console.error("Stream pipe error:", err);
          if (!res.headersSent) res.status(500).end();
          else res.end();
        });
      } else {
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    }
  } catch (err) {
    console.error("Proxy error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error en el proxy de streaming" });
    }
  }
});

export default router;
