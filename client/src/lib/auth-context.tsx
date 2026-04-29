import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { accountApi } from "@/lib/api";
import type { LoginForm, RegisterForm, UserInfo } from "@/lib/types";

interface AuthContextValue {
  user: UserInfo | null;
  isLoading: boolean;
  login: (form: LoginForm) => Promise<void>;
  register: (form: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const userInfo = await accountApi.getUserInfo();
    setUser(userInfo);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [refreshUser]);

  const login = useCallback(
    async (form: LoginForm) => {
      await accountApi.login(form);
      await refreshUser();
    },
    [refreshUser],
  );

  const register = useCallback(
    async (form: RegisterForm) => {
      await accountApi.register(form);
      // Don't auto-login — user must confirm email first
    },
    [],
  );

  const logout = useCallback(async () => {
    await accountApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshUser }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
