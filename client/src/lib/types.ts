export interface PageList<T, TCursor> {
  items: T[];
  nextCursor: TCursor | null;
}

export interface UserProfile {
  id: string;
  displayName: string;
  bio?: string | null;
  imageUrl?: string | null;
  following: boolean;
  followersCount: number;
  followingCount: number;
}

export type BookingStatus = "Approved" | "Pending" | "Waitlisted" | "Rejected" | "Cancelled";

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
  category: string;
  date: string;
  isCancelled: boolean;
  maxParticipants: number;
  bookingDeadline?: string | null;
  requiresHostConfirmation: boolean;
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
  attendees: UserProfile[];
  bookings: ActivityBooking[];
}

export interface BaseActivityForm {
  title: string;
  description: string;
  category: string;
  date: string;
  city: string;
  venue: string;
  latitude: number;
  longitude: number;
  maxParticipants: number;
  bookingDeadline?: string | null;
  requiresHostConfirmation: boolean;
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

export type NotificationType =
  | "BookingApproved"
  | "BookingRejected"
  | "NewFollower"
  | "ActivityDateChanged"
  | "CommentReply"
  | "ActivityCancelled"
  | "ActivityReminder";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  isRead: boolean;
  activityId?: string | null;
  commentId?: string | null;
}

export interface Photo {
  id: string;
  url: string;
  publicId: string;
  userId: string;
}

export interface UserInfo {
  id: string;
  displayName: string;
  email: string;
  imageUrl?: string | null;
  bio?: string | null;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm extends LoginForm {
  displayName: string;
}
