import { Router, type Request, type Response } from "express";
import { ANIME } from "@consumet/extensions";

const router = Router();

const gogoanime = new ANIME.Gogoanime();
const hianime = new ANIME.HiAnime();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      res.status(400).json({ error: "Se requiere el parámetro q" });
      return;
    }

    let results = await gogoanime.search(q);

    if (!results.results || results.results.length === 0) {
      const titleWords = q.split(" ").slice(0, 3).join(" ");
      results = await gogoanime.search(titleWords);
    }

    res.json({
      provider: "gogoanime",
      results: results.results.slice(0, 10).map((r) => ({
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

router.get("/info/:id(*)", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const info = await gogoanime.fetchAnimeInfo(id);
    res.json({
      id: info.id,
      title: info.title,
      episodes: info.episodes?.map((ep) => ({
        id: ep.id,
        number: ep.number,
        url: ep.url,
      })),
    });
  } catch (err) {
    console.error("Error obteniendo info:", err);
    res.status(500).json({ error: "Error al obtener información del anime" });
  }
});

router.get("/watch/:episodeId(*)", async (req: Request, res: Response) => {
  try {
    const { episodeId } = req.params;
    const sources = await gogoanime.fetchEpisodeSources(episodeId);

    res.json({
      episodeId,
      sources: sources.sources?.map((s) => ({
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

router.get("/embed/:animeId/:episode", async (req: Request, res: Response) => {
  try {
    const { animeId, episode } = req.params;
    const epNum = parseInt(episode, 10);

    const info = await gogoanime.fetchAnimeInfo(animeId);
    const ep = info.episodes?.find((e) => e.number === epNum);

    if (!ep) {
      res.status(404).json({ error: `Episodio ${episode} no encontrado` });
      return;
    }

    const sources = await gogoanime.fetchEpisodeSources(ep.id);

    const hqSource =
      sources.sources?.find((s) => s.quality === "1080p") ||
      sources.sources?.find((s) => s.quality === "720p") ||
      sources.sources?.find((s) => s.quality === "480p") ||
      sources.sources?.[0];

    res.json({
      episodeId: ep.id,
      episodeNumber: epNum,
      source: hqSource,
      allSources: sources.sources?.map((s) => ({
        url: s.url,
        quality: s.quality,
        isM3U8: s.isM3U8,
      })),
      headers: sources.headers,
      download: sources.download,
    });
  } catch (err) {
    console.error("Error obteniendo embed:", err);
    res.status(500).json({ error: "Error al obtener el video del episodio" });
  }
});

export default router;
