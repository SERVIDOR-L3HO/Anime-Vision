import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, TrendingUp, Sparkles, ArrowRight, Calendar } from "lucide-react";
import { useTopAnime } from "@/hooks/use-jikan";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { LoadingSpinner, ErrorMessage } from "@/components/ui/Loading";

export default function Home() {
  const { data: trending, isLoading: trendingLoading, error: trendingError } = useTopAnime("airing", 8);
  const { data: upcoming, isLoading: upcomingLoading } = useTopAnime("upcoming", 8);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Cyberpunk Anime City" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-white/90">Your Ultimate Anime Portal</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-[1.1] mb-6 drop-shadow-2xl">
              Dive into the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Anime Universe
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl font-medium leading-relaxed">
              Discover trending shows, explore countless genres, and track your favorite characters in our immersive database.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link 
                href="/browse"
                className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:-translate-y-1"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Browsing
              </Link>
              
              <Link 
                href="/top"
                className="px-8 py-4 rounded-xl glass-panel glass-panel-hover font-bold text-lg text-white transition-all hover:-translate-y-1"
              >
                View Top Rated
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <TrendingUp className="text-primary w-8 h-8" />
              Trending Now
            </h2>
            <p className="text-muted-foreground mt-1">The hottest anime airing this season</p>
          </div>
          <Link href="/browse" className="hidden sm:flex items-center gap-2 text-primary font-medium hover:text-white transition-colors group">
            See all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {trendingLoading ? (
          <LoadingSpinner />
        ) : trendingError ? (
          <ErrorMessage message={trendingError.message} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
            {trending?.data.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 relative z-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <Calendar className="text-accent w-8 h-8" />
              Highly Anticipated
            </h2>
            <p className="text-muted-foreground mt-1">Upcoming releases you don't want to miss</p>
          </div>
        </div>

        {upcomingLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
            {upcoming?.data.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
