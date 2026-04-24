import { useMemo, useState, useEffect, useRef, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarCheck2,
  Clock3,
  DollarSign,
  ReceiptText,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import PageTransition from "@/components/PageTransition";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { notificationsApi, paymentsApi, profilesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Activity as ActivityType, PaymentHistoryItem } from "@/lib/types";

type DashboardPeriod = "monthToDate" | "quarterToDate" | "yearToDate";

function CountUp({
  value,
  duration = 900,
  formatter = (v: number) => Math.round(v).toLocaleString(),
}: {
  value: number;
  duration?: number;
  formatter?: (value: number) => ReactNode;
}) {
  const [display, setDisplay] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    let startTime = 0;
    const from = previousValueRef.current;
    const delta = value - from;

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const next = from + delta * eased;
      setDisplay(next);
      previousValueRef.current = next;
      if (progress < 1) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      previousValueRef.current = value;
    };
  }, [value, duration]);

  return <>{formatter(display)}</>;
}

function getShortTitle(title: string, max = 20) {
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeCurrencyCode(value?: string | null) {
  const code = (value ?? "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : "USD";
}

function getDashboardCurrency(activities: ActivityType[]) {
  for (const activity of activities) {
    const code = (activity.currency ?? "").trim().toUpperCase();
    if (/^[A-Z]{3}$/.test(code)) return code;
  }

  return "USD";
}

function formatCurrency(amount: number, currency = "USD") {
  const safeCurrency = normalizeCurrencyCode(currency);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${Math.round(amount).toLocaleString()}`;
  }
}

function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function getLastMonths(count: number) {
  const months: Date[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    months.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)));
  }

  return months;
}

function isActiveBooking(status: ActivityType["bookings"][number]["status"]) {
  return status !== "Rejected" && status !== "Cancelled";
}

function getPaymentTimestamp(payment: PaymentHistoryItem) {
  return payment.paidAt ?? payment.createdAt;
}

function getBookingEventTimestamp(booking: ActivityType["bookings"][number]) {
  return booking.statusUpdatedAt ?? booking.dateJoined;
}

function toMonthValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseMonthValue(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return new Date();
  return new Date(year, month - 1, 1);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfQuarter(date: Date) {
  const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function isCurrentMonth(date: Date) {
  const now = new Date();
  return now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth();
}

function getMonthsInRange(start: Date, end: Date) {
  const months: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

function isInRange(value: string | Date, start: Date, end: Date) {
  const time = new Date(value).getTime();
  return time >= start.getTime() && time <= end.getTime();
}

function formatDateRange(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const HostDashboard = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<DashboardPeriod>("monthToDate");
  const [selectedMonth, setSelectedMonth] = useState(() => toMonthValue(new Date()));

  const hostedActivitiesQuery = useQuery({
    queryKey: ["host-dashboard", "hosting-activities", user?.id],
    queryFn: () => profilesApi.getActivities(user!.id, "hosting"),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
  });

  const followersQuery = useQuery({
    queryKey: ["host-dashboard", "followers", user?.id],
    queryFn: () => profilesApi.getFollowList(user!.id, "followers"),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
  });

  const notificationsQuery = useQuery({
    queryKey: ["host-dashboard", "notifications", user?.id],
    queryFn: () => notificationsApi.list(250),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 3,
  });

  const paymentsHistoryQuery = useQuery({
    queryKey: ["host-dashboard", "payments", user?.id],
    queryFn: () => paymentsApi.history(20),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 3,
  });

  const hostedActivities = useMemo(() => hostedActivitiesQuery.data ?? [], [hostedActivitiesQuery.data]);
  const followersCount = followersQuery.data?.length ?? 0;
  const selectedMonthDate = useMemo(() => parseMonthValue(selectedMonth), [selectedMonth]);

  const selectedRange = useMemo(() => {
    const monthStart = startOfMonth(selectedMonthDate);
    const monthEnd = endOfMonth(selectedMonthDate);
    const end = isCurrentMonth(selectedMonthDate) ? new Date() : monthEnd;

    const start = (() => {
      if (period === "yearToDate") return startOfYear(selectedMonthDate);
      if (period === "quarterToDate") return startOfQuarter(selectedMonthDate);
      return monthStart;
    })();

    return { start, end };
  }, [period, selectedMonthDate]);

  const periodLabel = useMemo(() => {
    if (period === "yearToDate") return "Year to Date";
    if (period === "quarterToDate") return "Quarter to Date";
    return "Month to Date";
  }, [period]);

  const monthOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    const now = new Date();
    for (let i = 0; i < 18; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: toMonthValue(d),
        label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
    }
    return options;
  }, []);

  const dashboardCurrency = useMemo(() => getDashboardCurrency(hostedActivities), [hostedActivities]);

  const summary = useMemo(() => {
    const activeActivityIds = new Set<string>();
    let totalBookings = 0;
    let approvedBookings = 0;
    let revenue = 0;

    for (const activity of hostedActivities) {
      const inRangeBookings = activity.bookings.filter(
        (booking) =>
          !booking.isHost &&
          isInRange(getBookingEventTimestamp(booking), selectedRange.start, selectedRange.end),
      );

      if (inRangeBookings.length > 0 || isInRange(activity.date, selectedRange.start, selectedRange.end)) {
        activeActivityIds.add(activity.id);
      }

      totalBookings += inRangeBookings.filter((booking) => isActiveBooking(booking.status)).length;

      const approvedInRange = inRangeBookings.filter((booking) => booking.status === "Approved").length;
      approvedBookings += approvedInRange;
      revenue += approvedInRange * activity.priceAmount;
    }

    const totalCapacity = hostedActivities
      .filter((activity) => activeActivityIds.has(activity.id))
      .reduce((sum, activity) => sum + activity.maxParticipants, 0);
    const attendanceRate = totalCapacity > 0 ? (approvedBookings / totalCapacity) * 100 : 0;

    const popularActivities = hostedActivities
      .map((activity) => {
        const approved = activity.bookings.filter(
          (booking) =>
            !booking.isHost &&
            booking.status === "Approved" &&
            isInRange(getBookingEventTimestamp(booking), selectedRange.start, selectedRange.end),
        ).length;

        return {
          name: getShortTitle(activity.title, 26),
          bookings: approved,
          revenue: approved * activity.priceAmount,
        };
      })
      .filter((entry) => entry.bookings > 0)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    return {
      totalBookings,
      approvedBookings,
      revenue,
      attendanceRate,
      popularActivities,
    };
  }, [hostedActivities, selectedRange.end, selectedRange.start]);

  const followerGrowthData = useMemo(() => {
    const months = getMonthsInRange(selectedRange.start, selectedRange.end);
    const monthKeys = months.map(getMonthKey);
    const monthlyAdds = new Map<string, number>(monthKeys.map((key) => [key, 0]));

    for (const notification of notificationsQuery.data ?? []) {
      if (notification.type !== "NewFollower") continue;
      const date = new Date(notification.createdAt);
      if (!isInRange(date, selectedRange.start, selectedRange.end)) continue;
      const key = getMonthKey(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)));
      if (!monthlyAdds.has(key)) continue;
      monthlyAdds.set(key, (monthlyAdds.get(key) ?? 0) + 1);
    }

    const totalAddsInRange = Array.from(monthlyAdds.values()).reduce((sum, value) => sum + value, 0);
    const baselineFollowers = Math.max(followersCount - totalAddsInRange, 0);

    let runningTotal = baselineFollowers;

    return months.map((month) => {
      const key = getMonthKey(month);
      runningTotal += monthlyAdds.get(key) ?? 0;
      return {
        month: getMonthLabel(month),
        followers: runningTotal,
        newFollowers: monthlyAdds.get(key) ?? 0,
      };
    });
  }, [followersCount, notificationsQuery.data, selectedRange.end, selectedRange.start]);

  const followerDelta = useMemo(() => {
    return (notificationsQuery.data ?? []).filter(
      (notification) =>
        notification.type === "NewFollower" &&
        isInRange(notification.createdAt, selectedRange.start, selectedRange.end),
    ).length;
  }, [notificationsQuery.data, selectedRange.end, selectedRange.start]);

  const revenueTrend = useMemo(() => {
    const months = getMonthsInRange(selectedRange.start, selectedRange.end);
    const map = new Map<string, number>(months.map((month) => [getMonthKey(month), 0]));

    for (const activity of hostedActivities) {
      for (const booking of activity.bookings) {
        if (booking.isHost || booking.status !== "Approved") continue;

        const bookingDate = new Date(getBookingEventTimestamp(booking));
        if (!isInRange(bookingDate, selectedRange.start, selectedRange.end)) continue;

        const key = getMonthKey(new Date(Date.UTC(bookingDate.getUTCFullYear(), bookingDate.getUTCMonth(), 1)));
        if (!map.has(key)) continue;
        map.set(key, (map.get(key) ?? 0) + activity.priceAmount);
      }
    }

    return months.map((month) => ({
      month: getMonthLabel(month),
      revenue: map.get(getMonthKey(month)) ?? 0,
    }));
  }, [hostedActivities, selectedRange.end, selectedRange.start]);

  const recentJoins = useMemo(() => {
    return hostedActivities
      .flatMap((activity) =>
        activity.bookings
          .filter((booking) => !booking.isHost && isInRange(getBookingEventTimestamp(booking), selectedRange.start, selectedRange.end))
          .map((booking) => ({
            id: `${activity.id}-${booking.user.id}-${booking.dateJoined}`,
            activityId: activity.id,
            activityTitle: activity.title,
            participantName: booking.user.displayName,
            status: booking.status,
            joinedAt: booking.statusUpdatedAt ?? booking.dateJoined,
          })),
      )
      .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
      .slice(0, 6);
  }, [hostedActivities, selectedRange.end, selectedRange.start]);

  const recentPayments = useMemo(() => {
    return [...(paymentsHistoryQuery.data ?? [])]
      .filter((payment) => isInRange(getPaymentTimestamp(payment), selectedRange.start, selectedRange.end))
      .sort((a, b) => new Date(getPaymentTimestamp(b)).getTime() - new Date(getPaymentTimestamp(a)).getTime())
      .slice(0, 6);
  }, [paymentsHistoryQuery.data, selectedRange.end, selectedRange.start]);

  const highestRevenueMonth = useMemo(
    () => Math.max(1, ...revenueTrend.map((x) => x.revenue)),
    [revenueTrend],
  );

  const fillPercents = useMemo(() => {
    const topPopular = summary.popularActivities[0]?.bookings ?? 0;
    return {
      bookings: Math.min(100, summary.totalBookings * 8),
      revenue: Math.min(100, (summary.revenue / highestRevenueMonth) * 100),
      attendance: Math.min(100, summary.attendanceRate),
      popular: Math.min(100, topPopular * 12),
      followers: Math.min(100, Math.abs(followerDelta) * 16),
    };
  }, [followerDelta, highestRevenueMonth, summary]);

  const isLoading = hostedActivitiesQuery.isLoading || followersQuery.isLoading;
  const quickActions = [
    {
      label: "Create activity",
      description: "Launch a new hosted event",
      to: "/create",
      icon: CalendarCheck2,
      tone: "from-primary/30 to-primary/0",
    },
    {
      label: "My profile",
      description: "Update host profile details",
      to: `/profile/${user?.id ?? ""}`,
      icon: Users,
      tone: "from-cyan/30 to-cyan/0",
    },
    {
      label: "Payments",
      description: "See receipts and payment logs",
      to: "/payments",
      icon: ReceiptText,
      tone: "from-accent/30 to-accent/0",
    },
    {
      label: "Explore",
      description: "Browse activity marketplace",
      to: "/",
      icon: Activity,
      tone: "from-violet/30 to-violet/0",
    },
  ];

  return (
    <PageTransition>
      <div className="pt-24 pb-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <span className="chip-active text-xs mb-4 inline-flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Host Analytics
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Broker-style <span className="gradient-text">host dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Real-time portfolio view for bookings, revenue, attendance, and growth.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="glass p-1 rounded-xl border border-glass-border flex items-center gap-1">
              {([
                ["monthToDate", "Month to Date"],
                ["quarterToDate", "Quarter to Date"],
                ["yearToDate", "Year to Date"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPeriod(value)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
                    period === value ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="glass rounded-xl border border-glass-border bg-card/80 px-3 py-2 text-xs text-foreground"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="glass px-4 py-2 rounded-xl text-xs text-muted-foreground border border-glass-border">
              {periodLabel}: {formatDateRange(selectedRange.start)} - {formatDateRange(selectedRange.end)}
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="glass p-5 rounded-xl">
                <div className="h-4 w-24 skeleton-glow mb-3" />
                <div className="h-8 w-20 skeleton-glow mb-2" />
                <div className="h-3 w-32 skeleton-glow" />
              </div>
            ))}
          </div>
        ) : hostedActivities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-2xl text-center"
          >
            <h2 className="text-xl font-display font-semibold mb-2">No hosted activities yet</h2>
            <p className="text-muted-foreground mb-5">
              Create your first activity to start tracking analytics.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 gradient-primary text-primary-foreground font-medium"
            >
              <CalendarCheck2 className="w-4 h-4" />
              Create activity
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[
                {
                  label: "Total bookings",
                  value: summary.totalBookings,
                  helper: `${summary.approvedBookings} approved`,
                  icon: CalendarCheck2,
                  formatter: (v: number) => Math.round(v).toLocaleString(),
                  fill: fillPercents.bookings,
                },
                {
                  label: "Revenue",
                  value: summary.revenue,
                  helper: dashboardCurrency,
                  icon: DollarSign,
                  formatter: (v: number) => formatCurrency(v, dashboardCurrency),
                  fill: fillPercents.revenue,
                },
                {
                  label: "Attendance rate",
                  value: summary.attendanceRate,
                  helper: "Approved / capacity",
                  icon: TrendingUp,
                  formatter: (v: number) => `${v.toFixed(1)}%`,
                  fill: fillPercents.attendance,
                },
                {
                  label: "Popular activities",
                  value: summary.popularActivities.length,
                  helper: "Top ranked this period",
                  icon: BarChart3,
                  formatter: (v: number) => Math.round(v).toString(),
                  fill: fillPercents.popular,
                },
                {
                  label: "Follower growth",
                  value: followerDelta,
                  helper: "New this month",
                  icon: Users,
                  formatter: (v: number) => `${v >= 0 ? "+" : ""}${Math.round(v)}`,
                  fill: fillPercents.followers,
                },
              ].map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="glass p-5 rounded-xl card-glow relative overflow-hidden group"
                >
                  <div className="absolute -right-9 -top-9 w-24 h-24 rounded-full border border-primary/20 bg-primary/5 transition-transform duration-500 group-hover:scale-125" />
                  <div className="absolute -right-2 -bottom-8 w-16 h-16 rounded-full border border-cyan/30 bg-cyan/5 transition-transform duration-500 group-hover:scale-125" />
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
                    <card.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-display font-bold">
                    <CountUp value={card.value} formatter={card.formatter} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{card.helper}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <motion.div
                      className="h-full gradient-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(8, card.fill)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.08, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-xl p-5 xl:col-span-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold">Most popular activities</h2>
                  <span className="text-xs text-muted-foreground">Approved bookings</span>
                </div>
                <ChartContainer
                  config={{
                    bookings: { label: "Approved bookings", color: "hsl(var(--primary))" },
                  }}
                  className="h-[300px] w-full"
                >
                  <BarChart data={summary.popularActivities} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={34} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={900} />
                  </BarChart>
                </ChartContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="glass rounded-xl p-5 xl:col-span-4"
              >
                <h2 className="font-display font-semibold mb-3">Quick actions</h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.08 * index }}
                    >
                      <Link
                        to={action.to}
                        className="relative group block overflow-hidden rounded-xl border border-glass-border bg-muted/20 p-3 hover:bg-muted/30 transition-all"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${action.tone} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className="relative flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{action.label}</p>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                          </div>
                          <div className="relative">
                            <span className="absolute inset-0 rounded-full border border-primary/40 animate-ping" />
                            <div className="relative w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                              <action.icon className="w-4 h-4 text-primary" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Attendance quality</h3>
                    <span className="text-xs text-muted-foreground">{summary.attendanceRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={summary.attendanceRate} className="h-2 bg-muted/40" />
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="glass rounded-xl p-5 xl:col-span-2"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold">Revenue and follower trends</h2>
                  <span className="text-xs text-muted-foreground">{periodLabel}</span>
                </div>
                <ChartContainer
                  config={{
                    revenue: { label: "Revenue", color: "hsl(var(--cyan))" },
                    followers: { label: "Followers", color: "hsl(var(--accent))" },
                  }}
                  className="h-[260px] w-full"
                >
                  <LineChart data={revenueTrend.map((x, index) => ({ ...x, followers: followerGrowthData[index]?.followers ?? 0 }))} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" tickLine={false} axisLine={false} width={52} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                    <YAxis yAxisId="right" orientation="right" allowDecimals={false} tickLine={false} axisLine={false} width={34} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={2.5}
                      dot={{ r: 2.5 }}
                      isAnimationActive
                      animationDuration={1000}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="followers"
                      stroke="var(--color-followers)"
                      strokeWidth={2.5}
                      dot={{ r: 2.5 }}
                      isAnimationActive
                      animationDuration={1000}
                    />
                  </LineChart>
                </ChartContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="glass rounded-xl p-5"
              >
                <h2 className="font-display font-semibold mb-4">Recent joins</h2>
                <div className="space-y-2">
                  {recentJoins.length > 0 ? (
                    recentJoins.map((join) => (
                      <motion.div
                        key={join.id}
                        whileHover={{ x: 4 }}
                        className="rounded-lg border border-glass-border bg-muted/20 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{join.participantName}</p>
                            <Link to={`/activity/${join.activityId}`} className="text-xs text-primary hover:underline truncate block">
                              {getShortTitle(join.activityTitle, 36)}
                            </Link>
                          </div>
                          <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-primary/20 text-primary">
                            {join.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock3 className="w-3 h-3" />
                          {formatDateTime(join.joinedAt)}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent joins yet.</p>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="glass rounded-xl p-5 mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold">Recent payments</h2>
                <Link to="/payments" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                  Open payments <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              {paymentsHistoryQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading recent payments...</p>
              ) : recentPayments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {recentPayments.map((payment) => (
                    <motion.div
                      key={payment.id}
                      whileHover={{ y: -4 }}
                      className="rounded-lg border border-glass-border bg-muted/20 p-3 relative overflow-hidden group"
                    >
                      <div className="absolute -right-8 -top-8 w-16 h-16 rounded-full border border-cyan/30 bg-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <p className="text-sm font-medium truncate">{payment.activityTitle}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(getPaymentTimestamp(payment))}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            {formatCurrency(payment.amount, payment.currency)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-primary/20 text-primary">
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent payments available.</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="mt-6 text-xs text-muted-foreground flex items-center gap-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Hover cards to reveal ring effects and micro-lift interactions.
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default HostDashboard;
