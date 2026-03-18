import { Link } from "wouter";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, ArrowRight, Calendar } from "lucide-react";
import { useTopAnime } from "@/hooks/use-jikan";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { FeaturedSlider } from "@/components/anime/FeaturedSlider";
import { RecentEpisodes } from "@/components/anime/RecentEpisodes";
import { LoadingSpinner, ErrorMessage } from "@/components/ui/Loading";

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = useTopAnime("airing", 6);
  const { data: trending, isLoading: trendingLoading, error: trendingError } = useTopAnime("bypopularity", 8);
  const { data: upcoming, isLoading: upcomingLoading } = useTopAnime("upcoming", 8);

  return (
    <div className="min-h-screen pb-20">
      {/* Featured Slider Hero */}
      {featuredLoading ? (
        <div className="h-[88vh] min-h-[600px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : featured?.data ? (
        <FeaturedSlider animes={featured.data} />
      ) : null}

      {/* Trending / Más Populares */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <TrendingUp className="text-primary w-7 h-7" />
              Más Populares
            </h2>
            <p className="text-muted-foreground mt-1">Los animes favoritos de la comunidad</p>
          </div>
          <Link href="/browse" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:text-white transition-colors group">
            Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {trendingLoading ? (
          <LoadingSpinner />
        ) : trendingError ? (
          <ErrorMessage message={trendingError.message} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5 gap-y-10">
            {trending?.data.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Últimos Episodios */}
      <RecentEpisodes />

      {/* Próximos Estrenos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 relative z-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Calendar className="text-accent w-7 h-7" />
              Próximos Estrenos
            </h2>
            <p className="text-muted-foreground mt-1">Los lanzamientos que no te puedes perder</p>
          </div>
          <Link href="/top" className="hidden sm:flex items-center gap-2 text-accent font-semibold hover:text-white transition-colors group">
            Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {upcomingLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5 gap-y-10">
            {upcoming?.data.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24"
      >
        <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-primary/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.15),transparent_70%)]" />
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-5 relative z-10" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 relative z-10">
            Explora el universo anime
          </h2>
          <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto relative z-10">
            Miles de títulos, géneros y personajes esperándote. Descubre tu próximo anime favorito.
          </p>
          <Link
            href="/browse"
            className="relative z-10 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_45px_rgba(0,240,255,0.65)] hover:-translate-y-1 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Explorar Catálogo
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
