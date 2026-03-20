import { Router, type Request, type Response } from "express";
import pkg from "@consumet/extensions";
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

router.get("/proxy", async (req: Request, res: Response) => {
  try {
    const { url, referer } = req.query;
    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro url" });
      return;
    }

    const refererHeader = (typeof referer === "string" && referer) || "https://kwik.cx/";

    const response = await fetch(url, {
      headers: {
        "Referer": refererHeader,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: `Upstream returned ${response.status}` });
      return;
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("mpegurl") || url.endsWith(".m3u8")) {
      const text = await response.text();

      const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);

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
      res.setHeader("Content-Type", contentType || "video/mp2t");
      res.setHeader("Access-Control-Allow-Origin", "*");

      if (response.body) {
        const reader = response.body.getReader();
        const pump = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          res.end();
        };
        pump().catch((err) => {
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
