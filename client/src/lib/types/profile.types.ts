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
