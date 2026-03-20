import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Download, ChevronDown, Loader2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Hls from "hls.js";

interface Source {
  url: string;
  quality: string;
  isM3U8: boolean;
}

interface DownloadLink {
  url: string;
  quality: string;
}

interface VideoPlayerProps {
  sources?: Source[];
  headers?: Record<string, string>;
  download?: DownloadLink[];
  episodeNumber?: number;
  animeTitle?: string;
  onClose?: () => void;
}

export function VideoPlayer({
  sources,
  headers,
  download,
  episodeNumber,
  animeTitle,
  onClose,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const playableSources = sources ?? [];

  const preferredOrder = ["1080p", "800p", "720p", "480p", "360p", "default"];
  const sortedSources = [...playableSources].sort((a, b) => {
    const aIdx = preferredOrder.findIndex((p) => a.quality?.includes(p));
    const bIdx = preferredOrder.findIndex((p) => b.quality?.includes(p));
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  const currentSource =
    sortedSources.find((s) => s.quality === selectedQuality) || sortedSources[0];

  useEffect(() => {
    if (sortedSources.length > 0 && !selectedQuality) {
      setSelectedQuality(sortedSources[0].quality);
    }
  }, [sources]);

  const handleLoaded = useCallback(() => setIsLoading(false), []);

  useEffect(() => {
    if (!currentSource || !videoRef.current) return;

    setIsLoading(true);
    setError(null);

    const video = videoRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.removeEventListener("loadedmetadata", handleLoaded);
    video.removeEventListener("loadeddata", handleLoaded);

    if (currentSource.isM3U8 && Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          if (headers?.Referer) {
            xhr.setRequestHeader("X-Referer", headers.Referer);
          }
        },
      });
      hlsRef.current = hls;
      hls.loadSource(currentSource.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("Error al cargar el video. Prueba otra calidad.");
          setIsLoading(false);
        }
      });
    } else if (currentSource.isM3U8 && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = currentSource.url;
      video.addEventListener("loadedmetadata", handleLoaded);
    } else {
      video.src = currentSource.url;
      video.addEventListener("loadeddata", handleLoaded);
      video.addEventListener("error", () => {
        setError("Error al reproducir el video.");
        setIsLoading(false);
      });
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("loadeddata", handleLoaded);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSource?.url, handleLoaded]);

  if (!playableSources.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4 bg-black/40 rounded-2xl border border-white/10">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-white font-bold text-lg">No se encontraron fuentes de video</p>
        <p className="text-muted-foreground text-sm">
          Este episodio no está disponible en este momento.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all"
          >
            Cerrar
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-primary fill-primary" />
          <span className="text-white font-semibold text-sm">
            {animeTitle} — Episodio {episodeNumber}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {download && download.length > 0 && (
            <a
              href={download[download.length - 1].url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar
            </a>
          )}
          {sortedSources.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold transition-all"
              >
                {selectedQuality || sortedSources[0]?.quality}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showQualityMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-1 bg-black border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden min-w-[100px]"
                  >
                    {sortedSources.map((s) => (
                      <button
                        key={s.quality}
                        onClick={() => {
                          setSelectedQuality(s.quality);
                          setShowQualityMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          s.quality === selectedQuality
                            ? "text-primary bg-primary/10 font-bold"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {s.quality}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-white text-sm font-medium">{error}</p>
          </div>
        )}
        <video
          ref={videoRef}
          controls
          className="absolute inset-0 w-full h-full"
          crossOrigin="anonymous"
          playsInline
        />
      </div>

      <div className="px-4 py-2 bg-black/60 border-t border-white/5">
        <p className="text-muted-foreground text-xs text-center">
          Video proporcionado por AnimePahe
        </p>
      </div>
    </motion.div>
  );
}
