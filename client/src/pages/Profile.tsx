import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Check,
  Bookmark,
  Camera,
  Edit,
  Heart,
  Users,
  Trash2,
  Star,
  Image as ImageIcon,
  User,
  Clock3,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ActivityCard from "@/components/ActivityCard";
import PageTransition from "@/components/PageTransition";
import { accountApi, activitiesApi, profilesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/lib/error-utils";

type TabKey = "photos" | "details" | "activities" | "approvals" | "collections" | "followers" | "followings" | "reviews";
type ActivityPredicate = "future" | "past" | "hosting";

const tabs: Array<{ id: TabKey; label: string; icon: typeof ImageIcon }> = [
  { id: "photos", label: "Photos", icon: ImageIcon },
  { id: "details", label: "Profile Details", icon: User },
  { id: "activities", label: "Activities", icon: Activity },
  { id: "approvals", label: "Pending Approvals", icon: Clock3 },
  { id: "collections", label: "Saved & Wishlists", icon: Bookmark },
  { id: "reviews", label: "Host Reviews", icon: Star },
  { id: "followers", label: "Followers", icon: Users },
  { id: "followings", label: "Following", icon: Star },
];

const Profile = () => {
  const { user, logout } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const targetUserId = userId ?? user?.id;
  const isOwnProfile = Boolean(user?.id && targetUserId === user.id);

  const [activeTab, setActiveTab] = useState<TabKey>("photos");
  const [activityPredicate, setActivityPredicate] = useState<ActivityPredicate>("future");
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["profile", targetUserId],
    queryFn: () => profilesApi.getProfile(targetUserId!),
    enabled: Boolean(targetUserId),
  });

  const photosQuery = useQuery({
    queryKey: ["profile-photos", targetUserId],
    queryFn: () => profilesApi.getPhotos(targetUserId!),
    enabled: Boolean(targetUserId),
  });

  const followersQuery = useQuery({
    queryKey: ["profile-follow", targetUserId, "followers"],
    queryFn: () => profilesApi.getFollowList(targetUserId!, "followers"),
    enabled: Boolean(targetUserId) && activeTab === "followers",
  });

  const followingsQuery = useQuery({
    queryKey: ["profile-follow", targetUserId, "followings"],
    queryFn: () => profilesApi.getFollowList(targetUserId!, "followings"),
    enabled: Boolean(targetUserId) && activeTab === "followings",
  });

  const activitiesQuery = useQuery({
    queryKey: ["profile-activities", targetUserId, activityPredicate],
    queryFn: () => profilesApi.getActivities(targetUserId!, activityPredicate),
    enabled: Boolean(targetUserId) && activeTab === "activities",
  });

  const pendingApprovalsQuery = useQuery({
    queryKey: ["profile-hosting-approvals", targetUserId],
    queryFn: () => profilesApi.getActivities(targetUserId!, "hosting"),
    enabled: Boolean(targetUserId) && isOwnProfile && activeTab === "approvals",
  });

  const hostReviewsQuery = useQuery({
    queryKey: ["host-reviews", targetUserId],
    queryFn: () => profilesApi.getHostReviews(targetUserId!, 100),
    enabled: Boolean(targetUserId) && activeTab === "reviews",
  });

  const collectionsSavedQuery = useQuery({
    queryKey: ["saved-activities"],
    queryFn: () => activitiesApi.getSavedActivities(),
    enabled: isOwnProfile && activeTab === "collections",
  });

  const wishlistsQuery = useQuery({
    queryKey: ["wishlists"],
    queryFn: () => activitiesApi.getWishlists(),
    enabled: isOwnProfile && activeTab === "collections",
  });

  const recentActivitiesQuery = useQuery({
    queryKey: ["recently-viewed-activities"],
    queryFn: () => activitiesApi.getRecentlyViewed(20),
    enabled: isOwnProfile && activeTab === "collections",
  });

  const followMutation = useMutation({
    mutationFn: () => profilesApi.followToggle(targetUserId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] });
      await queryClient.invalidateQueries({ queryKey: ["profile-follow", targetUserId] });
    },
  });

  const editMutation = useMutation({
    mutationFn: () =>
      profilesApi.editProfile({
        displayName: displayNameDraft,
        bio: bioDraft,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => profilesApi.addPhoto(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile-photos", targetUserId] });
      await queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] });
    },
  });

  const setMainMutation = useMutation({
    mutationFn: (photoId: string) => profilesApi.setMainPhoto(photoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] });
      await queryClient.invalidateQueries({ queryKey: ["profile-photos", targetUserId] });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => profilesApi.deletePhoto(photoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] });
      await queryClient.invalidateQueries({ queryKey: ["profile-photos", targetUserId] });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => accountApi.deleteAccount(deletePassword),
    onSuccess: async () => {
      setDeleteError(null);
      setDeletePassword("");
      await logout().catch(() => undefined);
      queryClient.clear();
      navigate("/", { replace: true });
    },
    onError: (error) => {
      setDeleteError(getErrorMessage(error, "Unable to delete account."));
    },
  });

  const approveBookingMutation = useMutation({
    mutationFn: ({ activityId, userId }: { activityId: string; userId: string }) =>
      activitiesApi.approveBooking(activityId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile-hosting-approvals", targetUserId] });
      await queryClient.invalidateQueries({ queryKey: ["profile-activities", targetUserId, "hosting"] });
      await queryClient.invalidateQueries({ queryKey: ["activity"] });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const rejectBookingMutation = useMutation({
    mutationFn: ({ activityId, userId }: { activityId: string; userId: string }) =>
      activitiesApi.rejectBooking(activityId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile-hosting-approvals", targetUserId] });
      await queryClient.invalidateQueries({ queryKey: ["profile-activities", targetUserId, "hosting"] });
      await queryClient.invalidateQueries({ queryKey: ["activity"] });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const profile = profileQuery.data;
  const photos = photosQuery.data ?? [];
  const followEntries =
    activeTab === "followers" ? followersQuery.data ?? [] : followingsQuery.data ?? [];
  const profileActivities = activitiesQuery.data ?? [];
  const hostActivitiesForApprovals = pendingApprovalsQuery.data ?? [];
  const hostReviews = hostReviewsQuery.data ?? [];
  const savedActivities = collectionsSavedQuery.data ?? [];
  const wishlists = wishlistsQuery.data ?? [];
  const recentActivities = recentActivitiesQuery.data ?? [];
  const pendingApprovals = hostActivitiesForApprovals.flatMap((activity) =>
    activity.bookings
      .filter((booking) => !booking.isHost && (booking.status === "Pending" || booking.status === "Waitlisted"))
      .map((booking) => ({
        activityId: activity.id,
        activityTitle: activity.title,
        activityDate: activity.date,
        attendeeId: booking.user.id,
        attendeeName: booking.user.displayName,
        attendeeImage: booking.user.imageUrl,
        status: booking.status,
        dateJoined: booking.dateJoined,
      })),
  );

  const initials = useMemo(() => {
    const name = profile?.displayName ?? "User";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);
  }, [profile?.displayName]);

  useEffect(() => {
    if (!profile) return;
    setDisplayNameDraft(profile.displayName);
    setBioDraft(profile.bio ?? "");
  }, [profile]);

  if (!targetUserId) {
    return (
      <PageTransition>
        <div className="pt-24 container mx-auto px-6 text-center">
          <p className="text-muted-foreground">Please log in to view a profile.</p>
          <Link to="/auth" className="text-primary hover:underline">
            Go to login
          </Link>
        </div>
      </PageTransition>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <PageTransition>
        <div className="pt-24 container mx-auto px-6">Loading profile...</div>
      </PageTransition>
    );
  }

  if (!profile) {
    return (
      <PageTransition>
        <div className="pt-24 container mx-auto px-6">Profile not found.</div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="pt-16">
        <div className="relative h-48 md:h-64 overflow-hidden">
          <div className="absolute inset-0 gradient-accent opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container mx-auto px-6 -mt-20 relative z-10 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8"
          >
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-display font-bold text-primary-foreground border-4 border-background shadow-2xl overflow-hidden">
                {profile.imageUrl ? (
                  <img src={profile.imageUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {isOwnProfile && (
                <label className="absolute bottom-1 right-1 w-8 h-8 rounded-lg bg-primary flex items-center justify-center cursor-pointer">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadPhotoMutation.mutate(file);
                    }}
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold">{profile.displayName}</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">{profile.bio ?? "No bio yet."}</p>
            </div>
            {!isOwnProfile && user && (
              <Button
                variant="outline"
                size="sm"
                className="border-glass-border bg-muted/30 hover:bg-muted/60"
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
              >
                <Heart className="w-4 h-4 mr-1" />
                {profile.following ? "Unfollow" : "Follow"}
              </Button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Followers", value: String(profile.followersCount), icon: Heart },
              { label: "Following", value: String(profile.followingCount), icon: Users },
              { label: "Photos", value: String(photos.length), icon: Camera },
              { label: "Host Rating", value: profile.hostReviewsCount > 0 ? `${profile.hostRatingAverage.toFixed(1)}★` : "No ratings", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="glass p-4 rounded-xl text-center hover-lift">
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
            {tabs
              .filter((tab) => tab.id !== "collections" || isOwnProfile)
              .filter((tab) => tab.id !== "approvals" || isOwnProfile)
              .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "photos" && (
              <motion.div
                key="photos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="font-display font-semibold text-lg mb-6">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative aspect-square rounded-xl overflow-hidden glass"
                    >
                      <img
                        src={photo.url}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {isOwnProfile && (
                        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMainMutation.mutate(photo.id)}
                            className="p-2 rounded-lg bg-primary/80 text-primary-foreground hover:bg-primary transition-colors"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePhotoMutation.mutate(photo.id)}
                            className="p-2 rounded-lg bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-xl"
              >
                <h2 className="font-display font-semibold text-lg mb-6">Profile Details</h2>
                <div className="glass p-6 rounded-xl space-y-5">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Display Name</label>
                    <Input
                      value={displayNameDraft}
                      onChange={(e) => setDisplayNameDraft(e.target.value)}
                      className="bg-muted/30 border-glass-border"
                      disabled={!isOwnProfile}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Bio</label>
                    <Textarea
                      value={bioDraft}
                      onChange={(e) => setBioDraft(e.target.value)}
                      className="bg-muted/30 border-glass-border min-h-[80px] resize-none"
                      disabled={!isOwnProfile}
                    />
                  </div>
                  {isOwnProfile && (
                    <>
                      <Button
                        className="gradient-primary text-primary-foreground border-0"
                        onClick={() => editMutation.mutate()}
                        disabled={editMutation.isPending}
                      >
                        <Edit className="w-4 h-4 mr-1" /> Save Changes
                      </Button>

                      <div className="border border-destructive/30 rounded-xl p-4 bg-destructive/5 space-y-3">
                        <p className="font-semibold text-destructive">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Enter your password to permanently delete your account. You will receive a goodbye email confirmation.
                        </p>
                        <Input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Enter password to confirm"
                          className="bg-muted/30 border-glass-border"
                        />
                        {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
                        <Button
                          variant="destructive"
                          onClick={() => {
                            const confirmed = window.confirm(
                              "Are you sure you want to permanently delete your account? This action cannot be undone.",
                            );

                            if (confirmed) {
                              setDeleteError(null);
                              deleteAccountMutation.mutate();
                            }
                          }}
                          disabled={deleteAccountMutation.isPending || deletePassword.trim().length === 0}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {deleteAccountMutation.isPending ? "Deleting account..." : "Delete Account"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "activities" && (
              <motion.div
                key="activities"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex gap-2 mb-6">
                  {([
                    ["future", "Upcoming"],
                    ["hosting", "Hosting"],
                    ["past", "Past"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setActivityPredicate(value)}
                      className={activityPredicate === value ? "chip-active" : "chip-default"}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {activitiesQuery.isLoading ? (
                  <p className="text-muted-foreground">Loading activities...</p>
                ) : profileActivities.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profileActivities.map((activity, index) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        index={index}
                        currentUserId={user?.id}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No activities found for this view.</p>
                )}
              </motion.div>
            )}

            {activeTab === "approvals" && (
              <motion.div
                key="approvals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h2 className="font-display font-semibold text-lg">Clients Waiting for Approval</h2>

                {pendingApprovalsQuery.isLoading ? (
                  <p className="text-muted-foreground">Loading pending approvals...</p>
                ) : pendingApprovals.length > 0 ? (
                  <div className="space-y-3">
                    {pendingApprovals.map((item) => (
                      <div key={`${item.activityId}-${item.attendeeId}`} className="glass rounded-xl p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <Link to={`/activity/${item.activityId}`} className="font-medium text-primary hover:underline">
                              {item.activityTitle}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.activityDate).toLocaleString()} • {item.status}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-sm">
                              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground overflow-hidden">
                                {item.attendeeImage ? (
                                  <img src={item.attendeeImage} alt={item.attendeeName} className="w-full h-full object-cover" />
                                ) : (
                                  item.attendeeName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                )}
                              </div>
                              <span>{item.attendeeName}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="gradient-primary text-primary-foreground border-0"
                              onClick={() => approveBookingMutation.mutate({ activityId: item.activityId, userId: item.attendeeId })}
                              disabled={approveBookingMutation.isPending || rejectBookingMutation.isPending}
                            >
                              <Check className="mr-1 h-4 w-4" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive/40 text-destructive hover:bg-destructive/10"
                              onClick={() => rejectBookingMutation.mutate({ activityId: item.activityId, userId: item.attendeeId })}
                              disabled={approveBookingMutation.isPending || rejectBookingMutation.isPending}
                            >
                              <X className="mr-1 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No pending or waitlisted booking requests right now.</p>
                )}
              </motion.div>
            )}

            {activeTab === "collections" && (
              <motion.div
                key="collections"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-display font-semibold text-lg mb-4">Saved activities</h2>
                  {collectionsSavedQuery.isLoading ? (
                    <p className="text-muted-foreground">Loading saved activities...</p>
                  ) : savedActivities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedActivities.map((activity, index) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          index={index}
                          currentUserId={user?.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No saved activities yet.</p>
                  )}
                </div>

                <div>
                  <h2 className="font-display font-semibold text-lg mb-4">Wishlists</h2>
                  {wishlistsQuery.isLoading ? (
                    <p className="text-muted-foreground">Loading wishlists...</p>
                  ) : wishlists.length > 0 ? (
                    <div className="space-y-6">
                      {wishlists.map((wishlist) => (
                        <div key={wishlist.name}>
                          <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">{wishlist.name}</h3>
                          {wishlist.activities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {wishlist.activities.map((activity, index) => (
                                <ActivityCard
                                  key={`${wishlist.name}-${activity.id}`}
                                  activity={activity}
                                  index={index}
                                  currentUserId={user?.id}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">No activities in this wishlist.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No wishlists yet.</p>
                  )}
                </div>

                <div>
                  <h2 className="font-display font-semibold text-lg mb-4">Recently viewed</h2>
                  {recentActivitiesQuery.isLoading ? (
                    <p className="text-muted-foreground">Loading recently viewed activities...</p>
                  ) : recentActivities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recentActivities.map((activity, index) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          index={index}
                          currentUserId={user?.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No recently viewed activities yet.</p>
                  )}
                </div>
              </motion.div>
            )}

            {(activeTab === "followers" || activeTab === "followings") && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {followEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/profile/${entry.id}`}
                    className="glass p-4 rounded-xl hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground overflow-hidden">
                        {entry.imageUrl ? (
                          <img src={entry.imageUrl} alt={entry.displayName} className="w-full h-full object-cover" />
                        ) : (
                          entry.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{entry.displayName}</p>
                        <p className="text-xs text-muted-foreground">{entry.followersCount} followers</p>
                      </div>
                    </div>
                  </Link>
                ))}
                {!followEntries.length && (
                  <div className="text-sm text-muted-foreground">No users to show.</div>
                )}
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h2 className="font-display font-semibold text-lg">Host Reviews</h2>
                <p className="text-sm text-muted-foreground">
                  Average: {profile.hostReviewsCount > 0 ? profile.hostRatingAverage.toFixed(1) : "0.0"} ({profile.hostReviewsCount} review{profile.hostReviewsCount === 1 ? "" : "s"})
                </p>

                {hostReviewsQuery.isLoading ? (
                  <p className="text-muted-foreground">Loading host reviews...</p>
                ) : hostReviews.length > 0 ? (
                  <div className="space-y-3">
                    {hostReviews.map((review) => (
                      <div key={review.id} className="glass rounded-xl p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div>
                            <p className="font-medium">{review.reviewerDisplayName}</p>
                            <Link to={`/activity/${review.activityId}`} className="text-xs text-primary hover:underline">
                              {review.activityTitle}
                            </Link>
                          </div>
                          <div className="text-sm text-amber-300">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.body}</p>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No host reviews yet.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
