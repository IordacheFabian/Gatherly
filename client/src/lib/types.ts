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
  hostRatingAverage: number;
  hostReviewsCount: number;
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
  priceAmount: number;
  currency: string;
}

export type PaymentStatus = "Pending" | "Succeeded" | "Refunded" | "Failed";

export interface CheckoutSession {
  paymentId: string;
  checkoutSessionId: string;
  checkoutUrl: string;
  status: string;
}

export interface PaymentHistoryItem {
  id: string;
  activityId: string;
  activityTitle: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string | null;
  refundedAt?: string | null;
  invoiceNumber: string;
  receiptNumber: string;
}

export interface PaymentReceipt {
  paymentId: string;
  invoiceNumber: string;
  receiptNumber: string;
  checkoutSessionId: string;
  provider: string;
  activityId: string;
  activityTitle: string;
  activityDate: string;
  venue: string;
  city: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string | null;
  refundedAt?: string | null;
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
