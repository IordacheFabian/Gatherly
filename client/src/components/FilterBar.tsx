import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { categoryOptions } from "@/lib/activity-view";

interface FilterBarProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const FilterBar = ({ activeCategory, onCategoryChange, sortBy, onSortChange }: FilterBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
    >
      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={activeCategory === cat ? "chip-active" : "chip-default"}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort */}
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
    </motion.div>
  );
};

export default FilterBar;
