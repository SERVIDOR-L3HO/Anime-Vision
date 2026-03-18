import { useState } from "react";
import { useSearchAnime, useGenres } from "@/hooks/use-jikan";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { LoadingSpinner, ErrorMessage } from "@/components/ui/Loading";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Browse() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: genresData } = useGenres();
  const { data, isLoading, error, isFetching } = useSearchAnime(query, selectedGenre, page);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput);
    setPage(1); // Reset page on new search
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header & Controls */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Explore Catalog</h1>
        
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 relative z-10">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search anime by title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-primary/80 transition-colors"
            >
              Search
            </button>
          </form>
          
          <div className="w-full md:w-64 relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <select 
              value={selectedGenre}
              onChange={handleGenreChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-10 text-white appearance-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all cursor-pointer"
            >
              <option value="">All Genres</option>
              {genresData?.data.map(genre => (
                <option key={genre.mal_id} value={genre.mal_id.toString()}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {error ? (
        <ErrorMessage message={error.message} />
      ) : isLoading || isFetching ? (
        <LoadingSpinner />
      ) : data?.data.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-muted-foreground font-display">No anime found matching your criteria.</p>
        </div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10"
          >
            {data?.data.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </motion.div>

          {/* Pagination */}
          {data?.pagination && data.pagination.items.count > 0 && (
            <div className="flex items-center justify-center gap-4 mt-16">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <span className="font-display font-bold text-lg text-white">
                Page {data.pagination.current_page} <span className="text-muted-foreground text-sm font-normal">/ {data.pagination.last_visible_page}</span>
              </span>

              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={!data.pagination.has_next_page}
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
