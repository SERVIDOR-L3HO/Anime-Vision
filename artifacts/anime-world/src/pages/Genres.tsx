import { useGenres } from "@/hooks/use-jikan";
import { LoadingSpinner, ErrorMessage } from "@/components/ui/Loading";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";

export default function Genres() {
  const { data, isLoading, error } = useGenres();

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white flex items-center gap-4 mb-4">
          <Layers className="w-10 h-10 text-primary" />
          Anime Genres
        </h1>
        <p className="text-muted-foreground text-lg">Browse anime by your favorite categories</p>
      </div>

      {error ? (
        <ErrorMessage message={error.message} />
      ) : isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data?.data.map((genre, index) => (
            <motion.div
              key={genre.mal_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
            >
              <Link 
                href={`/browse`} // In a real app, you'd pass the genre ID in state or URL params. For simplicity, we just link to browse. 
                className="block glass-panel p-6 rounded-2xl text-center group hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300 outline-none"
              >
                <h3 className="font-display font-bold text-lg text-white group-hover:text-primary transition-colors">
                  {genre.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {genre.count.toLocaleString()} Titles
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
