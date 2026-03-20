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

    const allSources = (sources.sources || []).map((s: any) => ({
      url: s.url,
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

export default router;
