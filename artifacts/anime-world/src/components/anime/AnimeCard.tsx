import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, Play, Calendar } from "lucide-react";
import { Anime } from "@/lib/types";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
}

export function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  const imageUrl = anime.images.webp.large_image_url || anime.images.jpg.large_image_url;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/anime/${anime.mal_id}`} className="block outline-none">
        <div className="relative rounded-2xl overflow-hidden aspect-[2/3] bg-secondary mb-4 shadow-lg border border-white/5 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300">
          
          {/* Image */}
          <img 
            src={imageUrl} 
            alt={anime.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {anime.score ? (
              <div className="glass-panel px-2.5 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-md bg-black/40">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">{anime.score.toFixed(1)}</span>
              </div>
            ) : <div />}
            
            {anime.type && (
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                {anime.type}
              </div>
            )}
          </div>

          {/* Hover Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
            <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.6)] text-primary-foreground pl-1">
              <Play className="w-6 h-6 fill-current" />
            </div>
          </div>

          {/* Bottom Info inside image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2 text-white/70 text-xs font-medium mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              {anime.year && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {anime.year}</span>
              )}
              {anime.episodes && (
                <span>• {anime.episodes} EPS</span>
              )}
            </div>
          </div>
        </div>

        {/* Outside Info */}
        <div>
          <h3 className="font-display font-bold text-white text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {anime.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1 font-medium">
            {anime.genres?.slice(0, 3).map(g => g.name).join(', ') || "Uncategorized"}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
