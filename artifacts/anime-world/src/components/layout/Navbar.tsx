import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, Menu, X, PlayCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Browse", path: "/browse" },
    { name: "Top Anime", path: "/top" },
    { name: "Genres", path: "/genres" },
  ];

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 border-b",
          scrolled 
            ? "bg-background/80 backdrop-blur-md border-white/10 shadow-lg" 
            : "bg-transparent border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group outline-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all duration-300">
                <PlayCircle className="text-white w-6 h-6 fill-white/20" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white group-hover:text-primary transition-colors">
                Anime<span className="text-primary font-light">World</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative py-2 outline-none",
                    location === link.path ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                  {location === link.path && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Search Icon & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <Link 
                href="/browse" 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white outline-none"
              >
                <Search className="w-5 h-5" />
              </Link>
              
              <button 
                className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white outline-none"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <motion.div 
        className={cn(
          "fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 md:hidden",
          mobileOpen ? "block" : "hidden"
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: mobileOpen ? 1 : 0, y: mobileOpen ? 0 : -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "text-2xl font-display font-bold outline-none",
                location === link.path ? "text-primary neon-text" : "text-white/70"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </motion.div>
    </>
  );
}
