import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Edit,
  Heart,
  Users,
  Trash2,
  Star,
  Image as ImageIcon,
  User,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageTransition from "@/components/PageTransition";
import { profilesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type TabKey = "photos" | "details" | "followers" | "followings";

const tabs: Array<{ id: TabKey; label: string; icon: typeof ImageIcon }> = [
  { id: "photos", label: "Photos", icon: ImageIcon },
  { id: "details", label: "Profile Details", icon: User },
  { id: "followers", label: "Followers", icon: Users },
  { id: "followings", label: "Following", icon: Star },
];

const Profile = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  const queryClient = useQueryClient();

  const targetUserId = userId ?? user?.id;
  const isOwnProfile = Boolean(user?.id && targetUserId === user.id);

  const [activeTab, setActiveTab] = useState<TabKey>("photos");
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");

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

  const profile = profileQuery.data;
  const photos = photosQuery.data ?? [];
  const followEntries =
    activeTab === "followers" ? followersQuery.data ?? [] : followingsQuery.data ?? [];

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
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
          >
            {[
              { label: "Followers", value: String(profile.followersCount), icon: Heart },
              { label: "Following", value: String(profile.followingCount), icon: Users },
              { label: "Photos", value: String(photos.length), icon: Camera },
            ].map((stat) => (
              <div key={stat.label} className="glass p-4 rounded-xl text-center hover-lift">
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
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
                    <Button
                      className="gradient-primary text-primary-foreground border-0"
                      onClick={() => editMutation.mutate()}
                      disabled={editMutation.isPending}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Save Changes
                    </Button>
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
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
