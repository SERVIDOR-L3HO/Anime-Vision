import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Star, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Anime } from "@/lib/types";

interface FeaturedSliderProps {
  animes: Anime[];
}

export function FeaturedSlider({ animes }: FeaturedSliderProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % animes.length);
  }, [animes.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + animes.length) % animes.length);
  }, [animes.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  if (!animes.length) return null;

  const anime = animes[current];
  const imageUrl = anime.images.webp.large_image_url || anime.images.jpg.large_image_url;

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
  };

  return (
    <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
      {/* Background */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={`bg-${anime.mal_id}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover object-top scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={anime.mal_id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="max-w-2xl"
            >
              {/* Badges */}
              <div className="flex items-center gap-3 mb-5">
                {anime.score && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold text-sm">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {anime.score.toFixed(1)}
                  </span>
                )}
                {anime.type && (
                  <span className="px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary font-bold text-sm uppercase tracking-wide">
                    {anime.type}
                  </span>
                )}
                {anime.status === "Currently Airing" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 font-bold text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    En emisión
                  </span>
                )}
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-4 drop-shadow-2xl">
                {anime.title_english || anime.title}
              </h1>

              {anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {anime.genres.slice(0, 4).map((g) => (
                    <span key={g.mal_id} className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/10 text-white/80 border border-white/10">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8 line-clamp-3 max-w-xl">
                {anime.synopsis || "No synopsis available."}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/anime/${anime.mal_id}`}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.65)] hover:-translate-y-1 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Ver Ahora
                </Link>
                <Link
                  href={`/anime/${anime.mal_id}`}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm text-white font-bold text-lg hover:bg-white/20 hover:-translate-y-1 transition-all"
                >
                  <Info className="w-5 h-5" />
                  Más Info
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {animes.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`transition-all rounded-full ${i === current ? "w-8 h-2.5 bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]" : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>

      {/* Thumbnail Strip */}
      <div className="absolute right-8 bottom-16 z-20 hidden lg:flex flex-col gap-2 w-36">
        {animes.slice(0, 4).map((a, i) => (
          <button
            key={a.mal_id}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`rounded-lg overflow-hidden border-2 transition-all ${i === current ? "border-primary shadow-[0_0_10px_rgba(0,240,255,0.5)] scale-105" : "border-transparent opacity-50 hover:opacity-80"}`}
          >
            <img
              src={a.images.webp.image_url || a.images.jpg.image_url}
              alt={a.title}
              className="w-full h-20 object-cover"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
