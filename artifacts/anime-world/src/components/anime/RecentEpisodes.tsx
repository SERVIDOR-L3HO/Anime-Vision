import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";
import { useRecentEpisodes } from "@/hooks/use-jikan";
import { LoadingSpinner } from "@/components/ui/Loading";

export function RecentEpisodes() {
  const { data, isLoading } = useRecentEpisodes();

  if (isLoading) return <LoadingSpinner />;
  if (!data?.data?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Clock className="text-accent w-7 h-7" />
            Últimos Episodios
          </h2>
          <p className="text-muted-foreground mt-1">Los episodios más recientes emitidos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.data.slice(0, 12).map((entry, i) => {
          const imageUrl = entry.entry.images.webp.image_url || entry.entry.images.jpg.image_url;
          const latestEp = entry.episodes[entry.episodes.length - 1];
          return (
            <motion.div
              key={`${entry.entry.mal_id}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <Link href={`/anime/${entry.entry.mal_id}`}>
                <div className="group flex gap-3 p-3 rounded-xl bg-white/5 border border-white/8 hover:border-primary/40 hover:bg-white/10 transition-all cursor-pointer">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={entry.entry.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {entry.entry.title}
                    </h3>
                    {entry.episodes.slice(-3).reverse().map((ep) => (
                      <div
                        key={ep.mal_id}
                        className="flex items-center gap-1.5 mb-1"
                      >
                        <span className="inline-block px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                          EP {ep.episode}
                        </span>
                        {ep.filler && (
                          <span className="text-[10px] text-yellow-400/80 font-medium">Filler</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
