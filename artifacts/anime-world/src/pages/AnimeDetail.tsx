import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useAnimeDetail, useAnimeCharacters, useAnimeEpisodes } from "@/hooks/use-jikan";
import {
  useSearchAnimeStream, useAnimeStreamInfo, useEpisodeEmbed,
  useSearchFlv, useFlvInfo, useFlvEmbed,
} from "@/hooks/use-streaming";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LoadingSpinner, ErrorMessage } from "@/components/ui/Loading";
import {
  Star, Play, Clock, Tv, Users, Hash, ChevronLeft, ChevronRight,
  Film, BookOpen, List, Youtube, Search, AlertCircle, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "info" | "trailer" | "episodes" | "characters";

export default function AnimeDetail() {
  const [, params] = useRoute("/anime/:id");
  const id = params?.id || "";
  const [tab, setTab] = useState<Tab>("info");
  const [epPage, setEpPage] = useState(1);

  type Provider = "animeflv" | "animepahe";
  const [provider, setProvider] = useState<Provider>("animeflv");
  const [selectedEp, setSelectedEp] = useState<number | null>(null);

  const [streamAnimeId, setStreamAnimeId] = useState<string | null>(null);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [noStreamAvailable, setNoStreamAvailable] = useState(false);
  const [multipleResults, setMultipleResults] = useState<{ id: string; title: string; image?: string; subOrDub?: string }[] | null>(null);

  const [flvSlug, setFlvSlug] = useState<string | null>(null);
  const [flvSearchEnabled, setFlvSearchEnabled] = useState(false);
  const [flvMultipleResults, setFlvMultipleResults] = useState<{ id: string; slug: string; title: string; image: string }[] | null>(null);

  const { data: animeData, isLoading, error } = useAnimeDetail(id);
  const { data: charData } = useAnimeCharacters(id);
  const { data: episodesData, isLoading: epLoading } = useAnimeEpisodes(id, epPage);

  const animeTitle = animeData?.data?.title_english || animeData?.data?.title || "";
  const animeTitleJp = animeData?.data?.title || "";

  const { data: searchData, isLoading: searchLoading, error: searchError } = useSearchAnimeStream(
    animeTitle,
    provider === "animepahe" && searchEnabled && !streamAnimeId
  );

  const { data: streamInfo, isLoading: infoLoading } = useAnimeStreamInfo(
    streamAnimeId || "",
    provider === "animepahe" && !!streamAnimeId
  );

  const { data: episodeData, isLoading: embedLoading, error: embedError } = useEpisodeEmbed(
    streamAnimeId || "",
    selectedEp,
    provider === "animepahe" && !!streamAnimeId && selectedEp !== null
  );

  const { data: flvSearchData, isLoading: flvSearchLoading, error: flvSearchError } = useSearchFlv(
    animeTitleJp || animeTitle,
    provider === "animeflv" && flvSearchEnabled && !flvSlug
  );

  const { data: flvEpisodeData, isLoading: flvEmbedLoading, error: flvEmbedError } = useFlvEmbed(
    flvSlug || "",
    selectedEp,
    provider === "animeflv" && !!flvSlug && selectedEp !== null
  );

  useEffect(() => {
    if (searchData && !streamAnimeId && provider === "animepahe") {
      const results = searchData.results;
      if (results.length === 0) {
        setSearchEnabled(false);
        setNoStreamAvailable(true);
      } else if (results.length === 1) {
        setStreamAnimeId(results[0].id);
      } else {
        const exact = results.find(
          (r) => r.title.toLowerCase() === animeTitle.toLowerCase()
        );
        if (exact) {
          setStreamAnimeId(exact.id);
        } else {
          setMultipleResults(results.slice(0, 5));
        }
      }
    }
  }, [searchData]);

  useEffect(() => {
    if (flvSearchData && !flvSlug && provider === "animeflv") {
      const results = flvSearchData.results;
      if (results.length === 0) {
        setFlvSearchEnabled(false);
        setNoStreamAvailable(true);
      } else if (results.length === 1) {
        setFlvSlug(results[0].slug);
      } else {
        const exact = results.find(
          (r) => r.title.toLowerCase() === animeTitle.toLowerCase() ||
                 r.title.toLowerCase() === animeTitleJp.toLowerCase()
        );
        if (exact) {
          setFlvSlug(exact.slug);
        } else {
          setFlvMultipleResults(results.slice(0, 5));
        }
      }
    }
  }, [flvSearchData]);

  const handleWatchEpisode = (epNumber: number) => {
    setSelectedEp(epNumber);
    if (provider === "animepahe" && !streamAnimeId) {
      setSearchEnabled(true);
    }
    if (provider === "animeflv" && !flvSlug) {
      setFlvSearchEnabled(true);
    }
  };

  const handleClosePlayer = () => {
    setSelectedEp(null);
    setNoStreamAvailable(false);
  };

  const resetStreamingState = () => {
    setSelectedEp(null);
    setNoStreamAvailable(false);
    setMultipleResults(null);
    setFlvMultipleResults(null);
    setStreamAnimeId(null);
    setFlvSlug(null);
    setSearchEnabled(false);
    setFlvSearchEnabled(false);
  };

  useEffect(() => {
    resetStreamingState();
  }, [id]);

  const handleSwitchProvider = (p: Provider) => {
    setProvider(p);
    setSelectedEp(null);
    setNoStreamAvailable(false);
    setMultipleResults(null);
    setFlvMultipleResults(null);
  };

  if (isLoading) return <div className="pt-32"><LoadingSpinner /></div>;
  if (error) return <div className="pt-32"><ErrorMessage message={error.message} /></div>;
  if (!animeData) return null;

  const anime = animeData.data;
  const imageUrl = anime.images.webp.large_image_url || anime.images.jpg.large_image_url;
  const episodes = episodesData?.data || [];
  const hasNextEpPage = episodesData?.pagination?.has_next_page ?? false;

  const isPlayerLoading = provider === "animepahe"
    ? (searchLoading || infoLoading || (!!streamAnimeId && embedLoading && selectedEp !== null))
    : (flvSearchLoading || (!!flvSlug && flvEmbedLoading && selectedEp !== null));

  const activeEpisodeData = provider === "animepahe" ? episodeData : flvEpisodeData;
  const activeError = provider === "animepahe" ? (searchError || embedError) : (flvSearchError || flvEmbedError);
  const hasStreamId = provider === "animepahe" ? !!streamAnimeId : !!flvSlug;
  const activeMultipleResults = provider === "animepahe" ? multipleResults : flvMultipleResults;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; hidden?: boolean }[] = [
    { id: "info", label: "Información", icon: <BookOpen className="w-4 h-4" /> },
    { id: "trailer", label: "Trailer", icon: <Youtube className="w-4 h-4" />, hidden: !anime.trailer?.embed_url },
    { id: "episodes", label: `Episodios${anime.episodes ? ` (${anime.episodes})` : ""}`, icon: <List className="w-4 h-4" /> },
    { id: "characters", label: "Personajes", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Cinematic Banner */}
      <div className="relative h-[50vh] min-h-[380px] w-full">
        <img src={imageUrl} alt="" className="w-full h-full object-cover blur-sm opacity-25 scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-72 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

          {/* Left Column: Poster */}
          <div className="w-full md:w-64 lg:w-72 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 mb-4 bg-secondary relative"
            >
              <img src={imageUrl} alt={anime.title} className="w-full h-auto block" />
              {anime.score && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                  <Star className="w-4 h-4 fill-current" />
                  {anime.score.toFixed(1)}
                </div>
              )}
            </motion.div>

            {/* Trailer Button */}
            {anime.trailer?.url && (
              <a
                href={anime.trailer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] mb-4"
              >
                <Film className="w-5 h-5" /> Ver Trailer
              </a>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="glass-panel p-3 rounded-xl text-center">
                <Hash className="w-4 h-4 text-accent mx-auto mb-1" />
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Rank</div>
                <div className="font-bold text-white text-sm">#{anime.rank || 'N/A'}</div>
              </div>
              <div className="glass-panel p-3 rounded-xl text-center">
                <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Popularidad</div>
                <div className="font-bold text-white text-sm">#{anime.popularity || 'N/A'}</div>
              </div>
            </div>

            {/* Info List */}
            <div className="glass-panel p-4 rounded-xl space-y-3 text-sm">
              {[
                { label: "Formato", value: anime.type, icon: <Tv className="w-3.5 h-3.5 text-primary" /> },
                { label: "Episodios", value: anime.episodes || "Desconocido", icon: <List className="w-3.5 h-3.5 text-accent" /> },
                { label: "Estado", value: anime.status, icon: <Play className="w-3.5 h-3.5 text-green-400" /> },
                { label: "Duración", value: anime.duration || "N/A", icon: <Clock className="w-3.5 h-3.5 text-yellow-400" /> },
                { label: "Temporada", value: anime.season ? `${anime.season} ${anime.year}` : "Desconocida", icon: null },
                { label: "Estudio", value: anime.studios.map((s) => s.name).join(", ") || "Desconocido", icon: null },
              ].map(({ label, value, icon }) => (
                <div key={label}>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</span>
                  <p className="text-white font-medium flex items-center gap-1.5 mt-0.5 capitalize">
                    {icon}{String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 pt-4 md:pt-28 lg:pt-36 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-2">
                {anime.title_english || anime.title}
              </h1>
              {anime.title_english && anime.title_english !== anime.title && (
                <p className="text-lg text-muted-foreground font-medium mb-4">{anime.title}</p>
              )}

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-8">
                {anime.genres.map((g) => (
                  <span key={g.mal_id} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm font-medium border border-white/10">
                    {g.name}
                  </span>
                ))}
                {anime.rating && (
                  <span className="px-3 py-1 rounded-full border border-red-500/50 text-red-400 text-sm font-bold bg-red-500/10">
                    {anime.rating}
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-8 border-b border-white/10 pb-0 flex-wrap">
                {tabs.filter(t => !t.hidden).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-semibold text-sm transition-all border-b-2 -mb-px ${
                      tab === t.id
                        ? "text-primary border-primary bg-primary/10"
                        : "text-muted-foreground border-transparent hover:text-white"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab: Info */}
              {tab === "info" && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Sinopsis</h3>
                  <p className="text-white/70 leading-relaxed text-base whitespace-pre-line">
                    {anime.synopsis || "Sin sinopsis disponible."}
                  </p>
                  {anime.background && (
                    <>
                      <h3 className="text-xl font-bold text-white mt-8 mb-3">Trasfondo</h3>
                      <p className="text-white/60 leading-relaxed text-base">{anime.background}</p>
                    </>
                  )}
                </div>
              )}

              {/* Tab: Trailer */}
              {tab === "trailer" && anime.trailer?.embed_url && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <Youtube className="w-6 h-6 text-red-500" />
                    <h3 className="text-xl font-bold text-white">Trailer Oficial</h3>
                  </div>
                  <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] bg-black" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                      src={`${anime.trailer.embed_url}?autoplay=0&rel=0&modestbranding=1`}
                      title={`Trailer de ${anime.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  <p className="text-muted-foreground text-sm mt-4 text-center">
                    Trailer oficial vía YouTube
                  </p>
                </div>
              )}

              {/* Tab: Episodes */}
              {tab === "episodes" && (
                <div>
                  {/* Provider Toggle */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-muted-foreground text-xs font-medium mr-1">Servidor:</span>
                    <button
                      onClick={() => handleSwitchProvider("animeflv")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        provider === "animeflv"
                          ? "bg-green-500/20 text-green-400 border border-green-500/40"
                          : "bg-white/5 text-white/50 border border-white/10 hover:text-white/80"
                      }`}
                    >
                      AnimeFLV (Español)
                    </button>
                    <button
                      onClick={() => handleSwitchProvider("animepahe")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        provider === "animepahe"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                          : "bg-white/5 text-white/50 border border-white/10 hover:text-white/80"
                      }`}
                    >
                      AnimePahe (English)
                    </button>
                  </div>

                  {/* Video Player Area */}
                  <AnimatePresence>
                    {selectedEp !== null && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden"
                      >
                        {isPlayerLoading ? (
                          <div className="flex flex-col items-center justify-center py-16 gap-4 bg-black/40 rounded-2xl border border-white/10">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <div className="text-center">
                              <p className="text-white font-semibold">Buscando episodio {selectedEp}...</p>
                              <p className="text-muted-foreground text-sm mt-1">
                                {provider === "animeflv" ? "Buscando en AnimeFLV..." :
                                 searchLoading ? "Buscando en servidores de streaming..." :
                                 infoLoading ? "Obteniendo lista de episodios..." :
                                 "Cargando fuentes de video..."}
                              </p>
                            </div>
                          </div>
                        ) : activeMultipleResults && !hasStreamId ? (
                          <div className="bg-black/40 rounded-2xl border border-white/10 p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <Search className="w-5 h-5 text-primary" />
                              <h4 className="text-white font-bold">Selecciona el anime correcto</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {activeMultipleResults.map((r: any) => (
                                <button
                                  key={r.id}
                                  onClick={() => {
                                    if (provider === "animepahe") {
                                      setStreamAnimeId(r.id);
                                      setMultipleResults(null);
                                    } else {
                                      setFlvSlug(r.slug || r.id);
                                      setFlvMultipleResults(null);
                                    }
                                  }}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                                >
                                  {r.image && (
                                    <img src={r.image} alt={r.title as string} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-white font-semibold text-sm leading-tight line-clamp-2">{r.title as string}</p>
                                    {r.subOrDub && (
                                      <span className="text-xs text-primary font-bold uppercase mt-1 block">{r.subOrDub}</span>
                                    )}
                                    {r.type && (
                                      <span className="text-xs text-muted-foreground mt-1 block">{r.type}</span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : noStreamAvailable ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-4 bg-black/40 rounded-2xl border border-white/10">
                            <AlertCircle className="w-10 h-10 text-yellow-400" />
                            <div className="text-center">
                              <p className="text-white font-semibold">Streaming no disponible</p>
                              <p className="text-muted-foreground text-sm mt-1">
                                No se encontró en {provider === "animeflv" ? "AnimeFLV" : "AnimePahe"}. Prueba con el otro servidor.
                              </p>
                            </div>
                            <button
                              onClick={handleClosePlayer}
                              className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all"
                            >
                              Cerrar
                            </button>
                          </div>
                        ) : activeError && !isPlayerLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-4 bg-black/40 rounded-2xl border border-red-500/20">
                            <AlertCircle className="w-10 h-10 text-red-400" />
                            <div className="text-center">
                              <p className="text-white font-semibold">No se pudo cargar el episodio</p>
                              <p className="text-muted-foreground text-sm mt-1">
                                El servidor de streaming no está disponible en este momento.
                              </p>
                            </div>
                            <button
                              onClick={handleClosePlayer}
                              className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all"
                            >
                              Cerrar
                            </button>
                          </div>
                        ) : activeEpisodeData && hasStreamId ? (
                          <VideoPlayer
                            sources={activeEpisodeData.allSources}
                            headers={activeEpisodeData.headers}
                            download={activeEpisodeData.download}
                            episodeNumber={selectedEp}
                            animeTitle={anime.title_english || anime.title}
                            provider={provider}
                            onClose={handleClosePlayer}
                          />
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {epLoading ? (
                    <LoadingSpinner />
                  ) : episodes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10">No hay episodios disponibles.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                        {episodes.map((ep, i) => (
                          <motion.button
                            key={ep.mal_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.02 }}
                            onClick={() => handleWatchEpisode(ep.mal_id)}
                            className={`group flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left w-full ${
                              selectedEp === ep.mal_id
                                ? "bg-primary/10 border-primary/60 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                                : ep.filler
                                ? "bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40"
                                : ep.recap
                                ? "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40"
                                : "bg-white/5 border-white/8 hover:border-primary/40 hover:bg-white/10"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                              selectedEp === ep.mal_id
                                ? "bg-primary text-primary-foreground"
                                : ep.filler ? "bg-yellow-500/20 text-yellow-400" :
                                  ep.recap ? "bg-blue-500/20 text-blue-400" :
                                  "bg-primary/20 text-primary group-hover:bg-primary/30"
                            }`}>
                              {selectedEp === ep.mal_id ? (
                                <Play className="w-4 h-4 fill-current" />
                              ) : (
                                <span className="font-black text-sm">{ep.mal_id}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm leading-tight line-clamp-1 transition-colors ${
                                selectedEp === ep.mal_id ? "text-primary" : "text-white group-hover:text-primary"
                              }`}>
                                {ep.title || `Episodio ${ep.mal_id}`}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {ep.aired && (
                                  <span className="text-[11px] text-muted-foreground">
                                    {new Date(ep.aired).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                                  </span>
                                )}
                                {ep.filler && <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">Filler</span>}
                                {ep.recap && <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">Recap</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {ep.score && (
                                <div className="flex items-center gap-1 text-yellow-400">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="text-xs font-bold">{ep.score.toFixed(1)}</span>
                                </div>
                              )}
                              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all ${
                                selectedEp === ep.mal_id
                                  ? "bg-primary/20 text-primary"
                                  : "bg-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                              }`}>
                                <Play className="w-3 h-3" />
                                Ver
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setEpPage((p) => Math.max(1, p - 1))}
                          disabled={epPage === 1}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" /> Anterior
                        </button>
                        <span className="text-white/60 font-medium">Página {epPage}</span>
                        <button
                          onClick={() => setEpPage((p) => p + 1)}
                          disabled={!hasNextEpPage}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Siguiente <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab: Characters */}
              {tab === "characters" && (
                <div>
                  {!charData ? (
                    <LoadingSpinner />
                  ) : charData.data.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10">No hay personajes disponibles.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {charData.data.slice(0, 16).map((char, i) => (
                        <motion.div
                          key={char.character.mal_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                          className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/8 hover:border-primary/40 hover:bg-white/10 transition-all"
                        >
                          <img
                            src={char.character.images.webp.image_url || char.character.images.jpg.image_url}
                            alt={char.character.name}
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div>
                            <h4 className="font-bold text-white leading-tight group-hover:text-primary transition-colors">{char.character.name}</h4>
                            <p className={`text-xs font-semibold mt-0.5 ${char.role === "Main" ? "text-primary" : "text-muted-foreground"}`}>
                              {char.role === "Main" ? "Protagonista" : char.role === "Supporting" ? "Secundario" : char.role}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
