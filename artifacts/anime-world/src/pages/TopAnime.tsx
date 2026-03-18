import { useState } from "react";
import { useTopAnime } from "@/hooks/use-jikan";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { LoadingSpinner, ErrorMessage } from "@/components/ui/Loading";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

export default function TopAnime() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"bypopularity" | "favorite" | undefined>(undefined);

  const { data, isLoading, error, isFetching } = useTopAnime(filter, 24, page);

  const tabs = [
    { id: undefined, label: "Top Rated" },
    { id: "bypopularity", label: "Most Popular" },
    { id: "favorite", label: "Most Favorited" },
  ] as const;

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white flex items-center gap-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Hall of Fame
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">The greatest anime of all time</p>
        </div>

        <div className="flex p-1 bg-secondary rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id || 'all'}
              onClick={() => { setFilter(tab.id); setPage(1); }}
              className={clsx(
                "px-6 py-2 rounded-lg font-medium text-sm transition-all outline-none",
                filter === tab.id 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorMessage message={error.message} />
      ) : isLoading || isFetching ? (
        <LoadingSpinner />
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10"
          >
            {data?.data.map((anime, index) => (
              <div key={anime.mal_id} className="relative">
                {/* Rank Badge */}
                <div className="absolute -left-3 -top-3 z-10 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-black text-black shadow-[0_4px_10px_rgba(251,191,36,0.4)] border-2 border-background">
                  #{anime.rank || (index + 1) + ((page - 1) * 24)}
                </div>
                <AnimeCard anime={anime} index={index} />
              </div>
            ))}
          </motion.div>

          {/* Pagination */}
          {data?.pagination && data.pagination.has_next_page && (
            <div className="flex items-center justify-center gap-4 mt-16">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <span className="font-display font-bold text-lg text-white">
                Page {page}
              </span>

              <button 
                onClick={() => setPage(p => p + 1)}
                className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
