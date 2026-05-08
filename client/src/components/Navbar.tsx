import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X, Compass, LogOut, Bell } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { notificationsApi } from "@/lib/api";
import { createNotificationsHub } from "@/lib/notificationsHub";
import { toast } from "@/components/ui/sonner";
import type { Notification } from "@/lib/types";

const navLinks = [
  { to: "/", label: "Activities" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const hubRef = useRef<ReturnType<typeof createNotificationsHub> | null>(null);
  const hasShownEntryUnreadToastRef = useRef(false);

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(50),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!user) {
      hubRef.current = null;
      hasShownEntryUnreadToastRef.current = false;
      return;
    }

    const hub = createNotificationsHub();
    hubRef.current = hub;

    const cleanup = hub.onReceiveNotification((incoming) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (prev) => {
        const existing = prev ?? [];
        const withoutDuplicate = existing.filter((x) => x.id !== incoming.id);
        return [incoming, ...withoutDuplicate];
      });

      toast.message(incoming.message);
    });

    void hub.start();

    return () => {
      cleanup();
      void hub.stop();
      hubRef.current = null;
    };
  }, [queryClient, user]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = useMemo(
    () => (notificationsQuery.data ?? []).filter((x) => !x.isRead).length,
    [notificationsQuery.data],
  );

  useEffect(() => {
    if (!user || hasShownEntryUnreadToastRef.current || notificationsQuery.isLoading) {
      return;
    }

    if (unreadCount > 0) {
      toast.message(`You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`);
    }

    hasShownEntryUnreadToastRef.current = true;
  }, [notificationsQuery.isLoading, unreadCount, user]);

  const resolveNotificationTarget = (notification: Notification): string | null => {
    switch (notification.type) {
      case "NewFollower":
        return notification.actorUserId ? `/profile/${notification.actorUserId}` : null;
      case "CommentReply":
        if (notification.activityId && notification.commentId) {
          return `/activity/${notification.activityId}?commentId=${encodeURIComponent(notification.commentId)}`;
        }

        return notification.activityId ? `/activity/${notification.activityId}` : null;
      case "BookingApproved":
      case "BookingRejected":
      case "BookingSubmitted":
      case "ActivityDateChanged":
      case "ActivityCancelled":
      case "ActivityReminder":
        return notification.activityId ? `/activity/${notification.activityId}` : null;
      default:
        return null;
    }
  };

  const onNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }

    const target = resolveNotificationTarget(notification);
    if (target) {
      setNotificationsOpen(false);
      navigate(target);
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <img src="/favicon.ico" alt="Gatherly-logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-lg gradient-text">
            Gatherly
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:text-foreground"
                style={{
                  color: isActive
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground))",
                }}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 gradient-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          {user && (
            <Link
              to="/dashboard"
              className="relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:text-foreground"
              style={{
                color:
                  location.pathname === "/dashboard"
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground))",
              }}
            >
              Dashboard
              {location.pathname === "/dashboard" && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 gradient-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          )}
          {user && (
            <Link
              to="/payments"
              className="relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:text-foreground"
              style={{
                color:
                  location.pathname === "/payments"
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground))",
              }}
            >
              Payments
              {location.pathname === "/payments" && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 gradient-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          )}
        </div>

        {/* Profile & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  className="relative p-2 rounded-full border border-glass-border bg-muted/30 hover:bg-muted/60 transition-all duration-200"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] leading-5 text-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-[360px] max-h-[420px] overflow-auto rounded-xl border border-glass-border bg-background/95 backdrop-blur-md shadow-xl p-3 z-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold">Notifications</p>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => markAllReadMutation.mutate()}
                        disabled={markAllReadMutation.isPending}
                      >
                        Mark all read
                      </button>
                    </div>

                    {notificationsQuery.isLoading && (
                      <p className="text-sm text-muted-foreground py-3">
                        Loading...
                      </p>
                    )}

                    {!notificationsQuery.isLoading &&
                      (notificationsQuery.data?.length ?? 0) === 0 && (
                        <p className="text-sm text-muted-foreground py-3">
                          No notifications yet.
                        </p>
                      )}

                    <div className="space-y-2">
                      {(notificationsQuery.data ?? []).map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          className={`w-full text-left rounded-lg border p-3 transition-colors ${notification.isRead ? "border-glass-border bg-muted/15" : "border-primary/40 bg-primary/10"}`}
                          onClick={() => onNotificationClick(notification)}
                        >
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={`/profile/${user.id}`}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-glass-border bg-muted/30 hover:bg-muted/60 transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {user.displayName}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-glass-border bg-muted/30 hover:bg-muted/60 transition-all duration-200 text-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-glass-border bg-muted/30 hover:bg-muted/60 transition-all duration-200"
            >
              <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Login</span>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden glass-strong border-t border-glass-border"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  Dashboard
                </Link>
              )}
              {user && (
                <Link
                  to="/payments"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  Payments
                </Link>
              )}
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      void markAllReadMutation.mutateAsync();
                    }}
                    className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    Notifications ({unreadCount})
                  </button>
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all"
                  >
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      void logout();
                    }}
                    className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
