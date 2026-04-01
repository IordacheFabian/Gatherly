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

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  isCancelled: boolean;
  hostDisplayName: string;
  hostId: string;
  city: string;
  venue: string;
  latitude: number;
  longitude: number;
  attendees: UserProfile[];
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
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  userId: string;
  displayName: string;
  imageUrl?: string | null;
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
