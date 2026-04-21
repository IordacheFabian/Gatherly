import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import HeroSection from "@/components/HeroSection";
import FilterBar from "@/components/FilterBar";
import ActivityCard from "@/components/ActivityCard";
import PageTransition from "@/components/PageTransition";
import { activitiesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { categoryOptions } from "@/lib/activity-view";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [minRating, setMinRating] = useState("0");
  const { user } = useAuth();

  const activitiesQuery = useInfiniteQuery({
    queryKey: ["activities"],
    queryFn: ({ pageParam }) => activitiesApi.list(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const activities = useMemo(
    () => activitiesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [activitiesQuery.data],
  );

  const categories = useMemo(() => {
    const fromActivities = Array.from(
      new Set(activities.map((a) => a.category.trim()).filter(Boolean)),
    );

    const merged = new Set<string>(["All", ...fromActivities, ...categoryOptions.filter((c) => c !== "All")]);
    return Array.from(merged);
  }, [activities]);

  const availableCities = useMemo(
    () => Array.from(new Set(activities.map((a) => a.city.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [activities],
  );

  const filtered = useMemo(() => {
    const normalizedCategory = activeCategory.toLowerCase();

    const result = activities.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        activeCategory === "All" || a.category.toLowerCase() === normalizedCategory;
      const matchesCity = cityFilter === "All" || a.city.toLowerCase() === cityFilter.toLowerCase();
      const matchesDate = !dateFilter || a.date.slice(0, 10) === dateFilter;
      const matchesRating = a.ratingAverage >= Number(minRating);

      return matchesSearch && matchesCat && matchesCity && matchesDate && matchesRating;
    });

    result.sort((a, b) => {
      if (sortBy === "date") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "attendees") return b.attendees.length - a.attendees.length;
      if (sortBy === "rating") return b.ratingAverage - a.ratingAverage;
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [activities, searchQuery, activeCategory, cityFilter, dateFilter, minRating, sortBy]);

  return (
    <PageTransition>
      <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <section className="container mx-auto px-6 pb-20">
        <FilterBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          cityFilter={cityFilter}
          onCityFilterChange={setCityFilter}
          availableCities={availableCities}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          minRating={minRating}
          onMinRatingChange={setMinRating}
          onClearFilters={() => {
            setActiveCategory("All");
            setCityFilter("All");
            setDateFilter("");
            setSearchQuery("");
            setSortBy("date");
            setMinRating("0");
          }}
        />

        {activitiesQuery.isLoading && (
          <div className="text-muted-foreground py-8">Loading activities...</div>
        )}

        {activitiesQuery.isError && (
          <div className="text-destructive py-8">Failed to load activities.</div>
        )}

        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((activity, i) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  index={i}
                  currentUserId={user?.id}
                />
              ))}
            </div>

          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">No activities found</h3>
            <p className="text-sm text-muted-foreground mb-6">Try adjusting your filters or search query</p>
          </motion.div>
        )}

        {activitiesQuery.hasNextPage && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              className="chip-active"
              onClick={() => void activitiesQuery.fetchNextPage()}
              disabled={activitiesQuery.isFetchingNextPage}
            >
              {activitiesQuery.isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          </div>
        )}

        {/* FAB */}
        <Link to="/create">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full gradient-primary glow-primary flex items-center justify-center shadow-2xl z-40"
          >
            <Plus className="w-6 h-6 text-primary-foreground" />
          </motion.button>
        </Link>
      </section>
    </PageTransition>
  );
};

export default Index;
