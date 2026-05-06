import type { UserProfile } from "./profile.types";

export type BookingStatus =
  | "Approved"
  | "Pending"
  | "Waitlisted"
  | "Rejected"
  | "Cancelled";

export type ActivityCategory =
  | "Fitness"
  | "Learning"
  | "Social"
  | "Creative"
  | "Wellness"
  | "Entertainment"
  | "Outdoor"
  | "Food"
  | "Productivity"
  | "Technology"
  | "Travel"
  | "Family"
  | "Relaxation"
  | "Adventure";

export interface ActivityBooking {
  user: UserProfile;
  isHost: boolean;
  status: BookingStatus;
  dateJoined: string;
  statusUpdatedAt?: string | null;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  date: string;
  isCancelled: boolean;
  maxParticipants: number;
  bookingDeadline?: string | null;
  requiresHostConfirmation: boolean;
  priceAmount: number;
  currency: string;
  isPaid: boolean;
  imageUrl?: string | null;
  hostDisplayName: string;
  hostId: string;
  city: string;
  venue: string;
  latitude: number;
  longitude: number;
  approvedParticipantsCount: number;
  pendingBookingsCount: number;
  waitlistCount: number;
  currentUserBookingStatus?: BookingStatus | null;
  ratingAverage: number;
  ratingCount: number;
  isSavedByCurrentUser: boolean;
  currentUserWishlistNames: string[];
  currentUserLastViewedAt?: string | null;
  attendees: UserProfile[];
  bookings: ActivityBooking[];
}

export interface WishlistGroup {
  name: string;
  activities: Activity[];
}

export interface BaseActivityForm {
  title: string;
  description: string;
  category: ActivityCategory;
  date: string;
  city: string;
  venue: string;
  latitude: number;
  longitude: number;
  maxParticipants: number;
  bookingDeadline?: string | null;
  requiresHostConfirmation: boolean;
  priceAmount: number;
  currency: string;
}

export interface ActivityReview {
  id: string;
  activityId: string;
  hostUserId: string;
  reviewerUserId: string;
  reviewerDisplayName: string;
  reviewerImageUrl?: string | null;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface HostReview {
  id: string;
  activityId: string;
  activityTitle: string;
  activityDate: string;
  reviewerUserId: string;
  reviewerDisplayName: string;
  reviewerImageUrl?: string | null;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  userId: string;
  displayName: string;
  imageUrl?: string | null;
  parentCommentId?: string | null;
}
