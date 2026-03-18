import { useRoute } from "wouter";
import { useAnimeDetail, useAnimeCharacters } from "@/hooks/use-jikan";
import { LoadingSpinner, ErrorMessage } from "@/components/ui/Loading";
import { Star, Play, Calendar, Clock, Tv, Users, Hash } from "lucide-react";
import { motion } from "framer-motion";

export default function AnimeDetail() {
  const [, params] = useRoute("/anime/:id");
  const id = params?.id || "";

  const { data: animeData, isLoading, error } = useAnimeDetail(id);
  const { data: charData } = useAnimeCharacters(id);

  if (isLoading) return <div className="pt-32"><LoadingSpinner /></div>;
  if (error) return <div className="pt-32"><ErrorMessage message={error.message} /></div>;
  if (!animeData) return null;

  const anime = animeData.data;
  const imageUrl = anime.images.webp.large_image_url || anime.images.jpg.large_image_url;

  return (
    <div className="min-h-screen pb-20">
      {/* Cinematic Banner */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <img 
          src={imageUrl} 
          alt="" 
          className="w-full h-full object-cover blur-md opacity-30 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-64 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Poster & Quick Stats */}
          <div className="w-full md:w-72 flex-shrink-0">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 mb-6 bg-secondary relative"
            >
              <img src={imageUrl} alt={anime.title} className="w-full h-auto block" />
              {anime.score && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                  <Star className="w-4 h-4 fill-current" />
                  {anime.score.toFixed(1)}
                </div>
              )}
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="glass-panel p-3 rounded-xl text-center">
                <Hash className="w-5 h-5 text-accent mx-auto mb-1" />
                <div className="text-xs text-muted-foreground">Rank</div>
                <div className="font-bold text-white">#{anime.rank || 'N/A'}</div>
              </div>
              <div className="glass-panel p-3 rounded-xl text-center">
                <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-xs text-muted-foreground">Popularity</div>
                <div className="font-bold text-white">#{anime.popularity || 'N/A'}</div>
              </div>
            </div>

            {/* Information List */}
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Format</span>
                <p className="text-white font-medium flex items-center gap-2 mt-1">
                  <Tv className="w-4 h-4 text-primary" /> {anime.type || 'Unknown'}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Episodes</span>
                <p className="text-white font-medium mt-1">{anime.episodes || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</span>
                <p className="text-white font-medium mt-1">{anime.status}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Season</span>
                <p className="text-white font-medium mt-1 capitalize">{anime.season ? `${anime.season} ${anime.year}` : 'Unknown'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Studios</span>
                <p className="text-white font-medium mt-1">
                  {anime.studios.map(s => s.name).join(', ') || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex-1 pt-4 md:pt-32 lg:pt-40">
            <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white leading-tight mb-2">
                {anime.title}
              </h1>
              {anime.title_english && anime.title_english !== anime.title && (
                <h2 className="text-xl text-muted-foreground font-medium mb-6">
                  {anime.title_english}
                </h2>
              )}

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {anime.genres.map(genre => (
                  <span key={genre.mal_id} className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium border border-white/5">
                    {genre.name}
                  </span>
                ))}
                {anime.rating && (
                  <span className="px-3 py-1 rounded-full border border-red-500/50 text-red-400 text-sm font-bold bg-red-500/10">
                    {anime.rating}
                  </span>
                )}
              </div>

              {/* Actions */}
              {anime.trailer?.url && (
                <a 
                  href={anime.trailer.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-primary hover:text-primary-foreground transition-colors mb-10 shadow-lg"
                >
                  <Play className="w-5 h-5 fill-current" /> Watch Trailer
                </a>
              )}

              {/* Synopsis */}
              <div className="mb-12">
                <h3 className="text-2xl font-display font-bold text-white mb-4">Synopsis</h3>
                <p className="text-white/70 leading-relaxed text-lg whitespace-pre-line">
                  {anime.synopsis || "No synopsis available."}
                </p>
              </div>

              {/* Characters */}
              {charData && charData.data.length > 0 && (
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-6">Main Characters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {charData.data.slice(0, 8).map((char, i) => (
                      <div key={char.character.mal_id} className="glass-panel p-3 rounded-xl flex items-center gap-4">
                        <img 
                          src={char.character.images.webp.image_url || char.character.images.jpg.image_url} 
                          alt={char.character.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-white leading-tight">{char.character.name}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">{char.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
