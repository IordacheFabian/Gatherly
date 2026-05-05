export type NotificationType =
  | "BookingApproved"
  | "BookingRejected"
  | "BookingSubmitted"
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
