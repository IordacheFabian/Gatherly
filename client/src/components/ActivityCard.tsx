import { motion } from "framer-motion";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Activity } from "@/lib/types";
import { getActivityImage, isUserAttending, isUserHost } from "@/lib/activity-view";

interface ActivityCardProps {
  activity: Activity;
  index: number;
  currentUserId?: string | null;
}

const ActivityCard = ({ activity, index, currentUserId }: ActivityCardProps) => {
  const joinedCount = activity.attendees.length;
  const host = isUserHost(activity, currentUserId);
  const joined = isUserAttending(activity, currentUserId);
  const image = getActivityImage(activity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
    >
      <Link
        to={`/activity/${activity.id}`}
        className="block group card-glow glass hover-lift rounded-xl overflow-hidden"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={activity.title}
            loading="lazy"
            width={800}
            height={512}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/90 text-primary-foreground backdrop-blur-sm">
              {activity.category}
            </span>
          </div>

          {host && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet/20 text-violet backdrop-blur-sm border border-violet/30">
              Your Event
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
            {activity.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {activity.description}
          </p>

          {/* Meta */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-coral" />
              <span>{activity.venue}, {activity.city}</span>
            </div>
          </div>

          {/* Participants Bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{joinedCount} attendee{joinedCount === 1 ? "" : "s"}</span>
            </div>
            {joined && <span className="text-xs font-medium text-primary">Joined</span>}
            <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>View Details</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          <div className="w-full h-1 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, joinedCount * 10)}%` }}
              transition={{ delay: index * 0.08 + 0.3, duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full gradient-primary"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ActivityCard;
