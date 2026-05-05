import { motion } from "framer-motion";
import { SlidersHorizontal, Calendar } from "lucide-react";

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  cityFilter: string;
  onCityFilterChange: (city: string) => void;
  availableCities: string[];
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  minRating: string;
  onMinRatingChange: (rating: string) => void;
  onClearFilters: () => void;
}

const FilterBar = ({
  categories,
  activeCategory,
  onCategoryChange,
  cityFilter,
  onCityFilterChange,
  availableCities,
  dateFilter,
  onDateFilterChange,
  sortBy,
  onSortChange,
  minRating,
  onMinRatingChange,
  onClearFilters,
}: FilterBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="flex flex-col gap-4 mb-8"
    >
      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={activeCategory === cat ? "chip-active" : "chip-default"}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-muted/50 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          >
            <option value="date">Date</option>
            <option value="attendees">Attendees</option>
            <option value="rating">Rating</option>
            <option value="title">Title</option>
          </select>
        </div>

        <select
          value={cityFilter}
          onChange={(e) => onCityFilterChange(e.target.value)}
          className="bg-muted/50 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-all"
        >
          <option value="All">All cities</option>
          {availableCities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <div className="relative">
          <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="bg-muted/50 border border-glass-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-all
              [&::-webkit-calendar-picker-indicator]:opacity-0"
          />
        </div>

        <select
          value={minRating}
          onChange={(e) => onMinRatingChange(e.target.value)}
          className="bg-muted/50 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-all"
        >
          <option value="0">Any rating</option>
          <option value="2">2.0+ stars</option>
          <option value="3">3.0+ stars</option>
          <option value="4">4.0+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>

        <button
          type="button"
          className="chip-default"
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      </div>
    </motion.div>
  );
};

export default FilterBar;
