import type { Activity } from "@/lib/types";

export const categoryOptions = [
  "All",
  "culture",
  "drinks",
  "film",
  "food",
  "music",
  "travel",
];

export function getActivityImage(activity: Activity) {
  const key = activity.category.toLowerCase();

  if (key.includes("food") || key.includes("drinks")) {
    return "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&auto=format&fit=crop";
  }

  if (key.includes("music") || key.includes("film")) {
    return "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1000&auto=format&fit=crop";
  }

  if (key.includes("travel") || key.includes("culture")) {
    return "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1000&auto=format&fit=crop";
  }

  return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1000&auto=format&fit=crop";
}

export function isUserHost(activity: Activity, userId?: string | null) {
  return Boolean(userId) && activity.hostId === userId;
}

export function isUserAttending(activity: Activity, userId?: string | null) {
  if (!userId) return false;
  return activity.attendees.some((attendee) => attendee.id === userId);
}
