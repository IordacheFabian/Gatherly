import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const HeroSection = ({ searchQuery, onSearchChange }: HeroSectionProps) => {
  return (
    <section className="relative pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBanner} alt="" className="w-full h-full object-cover opacity-40" width={1920} height={800} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="relative container mx-auto px-6 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Discover your next adventure</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 leading-tight">
            Find Your{" "}
            <span className="gradient-text">Tribe</span>
            <br />
            Share the{" "}
            <span className="gradient-text">Experience</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join activities, meet amazing people, and create unforgettable memories together.
          </p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="max-w-lg mx-auto"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 gradient-primary rounded-2xl opacity-30 group-focus-within:opacity-60 transition-opacity duration-300 blur-sm" />
              <div className="relative flex items-center glass rounded-xl overflow-hidden">
                <Search className="w-5 h-5 text-muted-foreground ml-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search activities, locations, or interests..."
                  className="flex-1 bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
