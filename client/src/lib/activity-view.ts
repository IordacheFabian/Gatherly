import type { Activity, ActivityCategory } from "@/lib/types";

export const categoryOptions: ActivityCategory[] = [
  "Fitness",
  "Learning",
  "Social",
  "Creative",
  "Wellness",
  "Entertainment",
  "Outdoor",
  "Food",
  "Productivity",
  "Technology",
  "Travel",
  "Family",
  "Relaxation",
  "Adventure",
];

export function getActivityImage(activity: Activity) {
  if (activity.imageUrl) {
    return activity.imageUrl;
  }

  switch (activity.category) {
    case "Fitness":
    case "Outdoor":
    case "Adventure":
      return "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1000&auto=format&fit=crop";
    case "Food":
      return "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&auto=format&fit=crop";
    case "Entertainment":
      return "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1000&auto=format&fit=crop";
    case "Travel":
      return "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1000&auto=format&fit=crop";
    case "Wellness":
    case "Relaxation":
      return "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop";
    case "Learning":
    case "Technology":
    case "Productivity":
      return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop";
    case "Social":
    case "Family":
      return "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop";
    case "Creative":
      return "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1000&auto=format&fit=crop";
    default:
      return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1000&auto=format&fit=crop";
  }
}

export function isUserHost(activity: Activity, userId?: string | null) {
  return Boolean(userId) && activity.hostId === userId;
}

export function isUserAttending(activity: Activity, userId?: string | null) {
  if (!userId) return false;
  return activity.attendees.some((attendee) => attendee.id === userId);
}
