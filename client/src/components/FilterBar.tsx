import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

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

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className="bg-muted/50 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-all"
        />

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
