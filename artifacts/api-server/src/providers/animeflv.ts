const BASE_URL = "https://www3.animeflv.net";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface AnimeFlvResult {
  id: string;
  title: string;
  slug: string;
  image: string;
  type: string;
}

export interface AnimeFlvInfo {
  id: string;
  title: string;
  slug: string;
  image: string;
  synopsis: string;
  genres: string[];
  status: string;
  type: string;
  episodes: { number: number; id: number }[];
}

export interface VideoServer {
  server: string;
  title: string;
  url: string;
  lang: string;
}

export interface VideoSource {
  url: string;
  quality: string;
  isM3U8: boolean;
  server: string;
  lang: string;
}

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

export async function searchAnimeFlv(query: string): Promise<AnimeFlvResult[]> {
  const html = await fetchHTML(`${BASE_URL}/browse?q=${encodeURIComponent(query)}`);

  const results: AnimeFlvResult[] = [];
  const articleRegex = /<article class="Anime[^"]*">([\s\S]*?)<\/article>/g;
  let match;

  while ((match = articleRegex.exec(html)) !== null) {
    const article = match[1];

    const linkMatch = article.match(/href="\/anime\/([^"]+)"/);
    const titleMatch = article.match(/<h3 class="Title">([^<]+)<\/h3>/);
    const imgMatch = article.match(/src="([^"]+)"/);
    const typeMatch = article.match(/<span class="Type[^"]*">([^<]+)<\/span>/);

    if (linkMatch && titleMatch) {
      results.push({
        id: linkMatch[1],
        slug: linkMatch[1],
        title: decodeHTMLEntities(titleMatch[1]),
        image: imgMatch ? (imgMatch[1].startsWith("http") ? imgMatch[1] : `${BASE_URL}${imgMatch[1]}`) : "",
        type: typeMatch?.[1] || "Anime",
      });
    }
  }

  return results;
}

export async function getAnimeFlvInfo(slug: string): Promise<AnimeFlvInfo> {
  const html = await fetchHTML(`${BASE_URL}/anime/${slug}`);

  const titleMatch = html.match(/<h1 class="Title">([^<]+)<\/h1>/);
  const synopsisMatch = html.match(/<div class="Description">[\s\S]*?<p>([^<]+)<\/p>/);
  const imgMatch = html.match(/<div class="AnimeCover">[\s\S]*?src="([^"]+)"/);
  const statusMatch = html.match(/<span class="fa-tv"><\/span>\s*([^<]+)/);
  const typeMatch = html.match(/<span class="Type[^"]*">([^<]+)<\/span>/);

  const genresRegex = /<a href="\/browse\?genre[^"]*"[^>]*>([^<]+)<\/a>/g;
  const genres: string[] = [];
  let genreMatch;
  while ((genreMatch = genresRegex.exec(html)) !== null) {
    genres.push(genreMatch[1]);
  }

  const epsMatch = html.match(/var episodes = (\[.*?\]);/s);
  const episodes: { number: number; id: number }[] = [];
  if (epsMatch) {
    const epsArr = JSON.parse(epsMatch[1]) as [number, number][];
    for (const [num, id] of epsArr) {
      episodes.push({ number: num, id });
    }
    episodes.sort((a, b) => a.number - b.number);
  }

  const infoMatch = html.match(/var anime_info = (\[.*?\]);/s);
  const animeInfo = infoMatch ? JSON.parse(infoMatch[1]) : [];

  return {
    id: animeInfo[0] || slug,
    title: titleMatch ? decodeHTMLEntities(titleMatch[1]) : slug,
    slug: animeInfo[2] || slug,
    image: imgMatch ? (imgMatch[1].startsWith("http") ? imgMatch[1] : `${BASE_URL}${imgMatch[1]}`) : "",
    synopsis: synopsisMatch ? decodeHTMLEntities(synopsisMatch[1]) : "",
    genres,
    status: statusMatch?.[1]?.trim() || "",
    type: typeMatch?.[1] || "Anime",
    episodes,
  };
}

export async function getEpisodeServers(slug: string, episodeNumber: number): Promise<VideoServer[]> {
  const html = await fetchHTML(`${BASE_URL}/ver/${slug}-${episodeNumber}`);

  const videosMatch = html.match(/var videos = ({[\s\S]*?});/);
  if (!videosMatch) return [];

  const videos = JSON.parse(videosMatch[1]);
  const servers: VideoServer[] = [];

  for (const [lang, embeds] of Object.entries(videos)) {
    if (!Array.isArray(embeds)) continue;
    for (const embed of embeds) {
      const e = embed as any;
      servers.push({
        server: e.server || "unknown",
        title: e.title || e.server,
        url: e.code || "",
        lang: lang === "SUB" ? "Subtitulado" : lang === "LAT" ? "Latino" : lang,
      });
    }
  }

  return servers;
}

export async function extractVideoUrl(server: VideoServer): Promise<VideoSource | null> {
  try {
    if (server.server === "yu") {
      return await extractYourUpload(server);
    }
    if (server.server === "sw") {
      return await extractStreamWish(server);
    }
    if (server.server === "okru") {
      return await extractOkru(server);
    }
    if (server.server === "stape") {
      return await extractStreamtape(server);
    }
    return null;
  } catch (e) {
    console.error(`Error extracting from ${server.server}:`, (e as Error).message);
    return null;
  }
}

async function extractYourUpload(server: VideoServer): Promise<VideoSource | null> {
  const html = await fetchHTML(server.url);
  const fileMatch = html.match(/file\s*:\s*'([^']+)'/);
  if (!fileMatch) return null;

  return {
    url: fileMatch[1],
    quality: `${server.lang}`,
    isM3U8: false,
    server: "YourUpload",
    lang: server.lang,
  };
}

async function extractStreamWish(server: VideoServer): Promise<VideoSource | null> {
  const html = await fetchHTML(server.url);
  const fileMatch = html.match(/file\s*:\s*"([^"]+\.m3u8[^"]*)"/);
  if (!fileMatch) return null;

  return {
    url: fileMatch[1],
    quality: `${server.lang} HD`,
    isM3U8: true,
    server: "StreamWish",
    lang: server.lang,
  };
}

async function extractOkru(server: VideoServer): Promise<VideoSource | null> {
  const html = await fetchHTML(server.url);
  const dataMatch = html.match(/data-options="([^"]*)"/);
  if (!dataMatch) return null;

  const decoded = dataMatch[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"');
  try {
    const parsed = JSON.parse(decoded);
    const metadata = JSON.parse(parsed.flashvars?.metadata || "{}");
    const videos = metadata.videos as { name: string; url: string }[];
    if (!videos || videos.length === 0) return null;

    const best = videos.find((v) => v.name === "hd") || videos.find((v) => v.name === "sd") || videos[0];
    return {
      url: best.url,
      quality: `${server.lang} ${best.name?.toUpperCase() || ""}`.trim(),
      isM3U8: best.url.includes(".m3u8"),
      server: "OK.ru",
      lang: server.lang,
    };
  } catch {
    return null;
  }
}

async function extractStreamtape(server: VideoServer): Promise<VideoSource | null> {
  const html = await fetchHTML(server.url);

  const match = html.match(
    /getElementById\('robotlink'\)\.innerHTML\s*=\s*'([^']+)'\s*\+\s*\('([^']+)'\)\.substring\((\d+)\)\.substring\((\d+)\)/
  );

  if (!match) {
    const simpleMatch = html.match(/getElementById\('robotlink'\)\.innerHTML\s*=\s*'([^']+)'\s*\+\s*\('([^']+)'\)/);
    if (!simpleMatch) return null;
    let videoUrl = simpleMatch[1] + simpleMatch[2];
    if (!videoUrl.startsWith("http")) videoUrl = "https:" + videoUrl;
    return { url: videoUrl, quality: `${server.lang}`, isM3U8: false, server: "Streamtape", lang: server.lang };
  }

  const base = match[1];
  const token = match[2];
  const sub1 = parseInt(match[3], 10);
  const sub2 = parseInt(match[4], 10);
  const tokenPart = token.substring(sub1).substring(sub2);
  let videoUrl = base + tokenPart;

  if (!videoUrl.startsWith("http")) {
    videoUrl = "https:" + videoUrl;
  }

  return {
    url: videoUrl,
    quality: `${server.lang}`,
    isM3U8: false,
    server: "Streamtape",
    lang: server.lang,
  };
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)));
}
