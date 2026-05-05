export interface PageList<T, TCursor> {
  items: T[];
  nextCursor: TCursor | null;
}

export interface UserInfo {
  id: string;
  displayName: string;
  email: string;
  imageUrl?: string | null;
  bio?: string | null;
}

export interface Photo {
  id: string;
  url: string;
  publicId: string;
  userId: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm extends LoginForm {
  displayName: string;
}
