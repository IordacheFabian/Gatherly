import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  MessageCircle,
  Edit,
  Trash2,
  Star,
  Bookmark,
  ListPlus,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { activitiesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { createCommentsHub } from "@/lib/commentsHub";
import type { Comment } from "@/lib/types";
import { getActivityImage, isUserAttending, isUserHost } from "@/lib/activity-view";
import { toast } from "@/components/ui/sonner";

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [sendingComment, setSendingComment] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [wishlistName, setWishlistName] = useState("");
  const hubRef = useRef<ReturnType<typeof createCommentsHub> | null>(null);

  const activityQuery = useQuery({
    queryKey: ["activity", id],
    queryFn: () => activitiesApi.details(id!),
    enabled: Boolean(id),
  });

  const activity = activityQuery.data;

  useEffect(() => {
    if (!id || !user) return;
    void activitiesApi.trackView(id);
  }, [id, user]);

  const reviewsQuery = useQuery({
    queryKey: ["activity-reviews", id],
    queryFn: () => activitiesApi.getReviews(id!, 100),
    enabled: Boolean(id),
  });

  const wishlistsQuery = useQuery({
    queryKey: ["wishlists"],
    queryFn: () => activitiesApi.getWishlists(),
    enabled: Boolean(id && user),
  });
  const reviews = reviewsQuery.data ?? [];
  const myReview = reviews.find((x) => x.reviewerUserId === user?.id);
  const currentWishlistNames =
    wishlistsQuery.data
      ?.filter((group) => group.activities.some((a) => a.id === id))
      .map((group) => group.name) ?? [];

  useEffect(() => {
    if (!myReview) return;
    setReviewRating(myReview.rating);
    setReviewBody(myReview.body);
  }, [myReview]);

  useEffect(() => {
    if (!id || !user) return;

    const hub = createCommentsHub(id);
    hubRef.current = hub;
    const cleanupLoad = hub.onLoadComments((loaded) => setComments(loaded));
    const cleanupReceive = hub.onReceiveComment((comment) => {
      setComments((prev) => [comment, ...prev]);
    });

    void hub.start();

    return () => {
      cleanupLoad();
      cleanupReceive();
      hubRef.current = null;
      void hub.stop();
    };
  }, [id, user]);

  const attendMutation = useMutation({
    mutationFn: () => activitiesApi.toggleAttendance(id!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activity", id] });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => activitiesApi.approveBooking(id!, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activity", id] });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => activitiesApi.rejectBooking(id!, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activity", id] });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => activitiesApi.remove(id!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      navigate("/");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => activitiesApi.mockCheckout(id!),
    onSuccess: async (session) => {
      await queryClient.invalidateQueries({ queryKey: ["activity", id] });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      await queryClient.invalidateQueries({ queryKey: ["payments", "history"] });
      toast.success(`Mock Stripe checkout succeeded. Receipt ${session.paymentId.slice(0, 8)} created.`);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => activitiesApi.addOrUpdateReview(id!, { rating: reviewRating, body: reviewBody.trim() }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activity-reviews", id] });
      await queryClient.invalidateQueries({ queryKey: ["activity", id] });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      await queryClient.invalidateQueries({ queryKey: ["profile", activity?.hostId] });
    },
  });

  const toggleSavedMutation = useMutation({
    mutationFn: () => activitiesApi.toggleSaved(id!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activity", id] });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      await queryClient.invalidateQueries({ queryKey: ["saved-activities"] });
      await queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (name: string) => activitiesApi.addToWishlist(id!, name),
    onSuccess: async () => {
      setWishlistName("");
      await queryClient.invalidateQueries({ queryKey: ["activity", id] });
      await queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (name: string) => activitiesApi.removeFromWishlist(id!, name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activity", id] });
      await queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });

  const sendComment = async () => {
    if (!hubRef.current || !commentBody.trim()) return;

    setSendingComment(true);
    try {
      await hubRef.current.start();
      await hubRef.current.sendComment(commentBody.trim(), replyTo?.id);
      setCommentBody("");
      setReplyTo(null);
    } finally {
      setSendingComment(false);
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    if (!sendingComment && commentBody.trim()) {
      void sendComment();
    }
  };

  if (activityQuery.isLoading) {
    return (
      <PageTransition>
        <div className="pt-24 container mx-auto px-6">Loading activity...</div>
      </PageTransition>
    );
  }

  if (!activity) {
    return (
      <PageTransition>
        <div className="pt-24 container mx-auto px-6 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Activity not found</h1>
          <Link to="/" className="text-primary hover:underline">
            Back to activities
          </Link>
        </div>
      </PageTransition>
    );
  }

  const host = isUserHost(activity, user?.id);
  const joined = isUserAttending(activity, user?.id);
  const mapQuery = encodeURIComponent(`${activity.venue}, ${activity.city}`);
  const currentStatus = activity.currentUserBookingStatus;
  const canReview = Boolean(!host && user && currentStatus === "Approved" && new Date(activity.date).getTime() <= Date.now());
  const pendingBookings = activity.bookings.filter((b) => !b.isHost && (b.status === "Pending" || b.status === "Waitlisted"));
  const reviewAccessMessage = (() => {
    if (!user) return "Log in to leave a review after you attend this activity.";
    if (host) return "Hosts cannot review their own activities.";
    if (currentStatus !== "Approved") return "Only approved attendees can leave a review.";
    if (new Date(activity.date).getTime() > Date.now()) return "Reviews open after the activity ends.";
    return null;
  })();

  const bookingActionLabel = (() => {
    if (!currentStatus) return activity.isPaid ? "Pay & reserve spot" : "Request booking";
    if (currentStatus === "Pending" || currentStatus === "Waitlisted" || currentStatus === "Approved") {
      return "Cancel booking";
    }

    return "Request booking again";
  })();

  const priceLabel = activity.isPaid
    ? `${new Intl.NumberFormat("en-US", { style: "currency", currency: activity.currency }).format(activity.priceAmount)} per booking`
    : "Free activity";

  return (
    <PageTransition>
      <div className="pt-16">
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img
            src={getActivityImage(activity)}
            alt={activity.title}
            className="w-full h-full object-cover"
            width={800}
            height={512}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <Link
              to="/"
              className="glass px-3 py-2 rounded-lg inline-flex items-center gap-2 text-sm text-foreground hover:bg-card/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-6 -mt-20 relative z-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {activity.isCancelled && (
                <div className="glass border border-destructive/40 text-destructive p-4 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span>This activity is currently cancelled.</span>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-xl"
              >
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <span className="chip-active text-xs mb-2 inline-block">{activity.category}</span>
                    <h1 className="text-2xl md:text-3xl font-display font-bold mt-2">{activity.title}</h1>
                  </div>
                  {host && (
                    <div className="flex items-center gap-2">
                      <Link to={`/create?edit=${activity.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-glass-border bg-muted/30 hover:bg-muted/60"
                        >
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>
                      {new Date(activity.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-coral" />
                    <span>
                      {activity.venue}, {activity.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-cyan" />
                    <span>{activity.approvedParticipantsCount}/{activity.maxParticipants} approved</span>
                  </div>
                </div>

                <div className="mb-4 rounded-lg border border-glass-border bg-muted/20 px-3 py-2 text-sm">
                  <span className={activity.isPaid ? "text-foreground" : "text-emerald-300"}>{priceLabel}</span>
                </div>

                <div className="mb-4 rounded-lg border border-glass-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Star className="w-4 h-4 fill-amber-300" /> {activity.ratingAverage.toFixed(1)}
                  </span>
                  <span className="ml-2">({activity.ratingCount} review{activity.ratingCount === 1 ? "" : "s"})</span>
                </div>

                <div className="mb-6 rounded-lg border border-glass-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                  <p>Pending: {activity.pendingBookingsCount} | Waiting list: {activity.waitlistCount}</p>
                  {activity.bookingDeadline && (
                    <p>
                      Booking deadline: {new Date(activity.bookingDeadline).toLocaleString()}
                    </p>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed">{activity.description}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-6 rounded-xl"
              >
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" /> Discussion
                </h2>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/20">
                      <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center flex-shrink-0 text-xs font-bold text-foreground overflow-hidden">
                        {comment.imageUrl ? (
                          <img
                            src={comment.imageUrl}
                            alt={comment.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          comment.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.displayName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.body}</p>
                        {user && comment.userId !== user.id && (
                          <button
                            type="button"
                            onClick={() => setReplyTo(comment)}
                            className="mt-2 text-xs text-primary hover:underline"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!comments.length && (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  )}
                </div>
                {user ? (
                  <div className="mt-4 flex gap-2">
                    {replyTo && (
                      <div className="w-full mb-2 rounded-lg border border-glass-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                        Replying to {replyTo.displayName}
                        <button
                          type="button"
                          className="ml-2 text-primary hover:underline"
                          onClick={() => setReplyTo(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <input
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      onKeyDown={handleCommentKeyDown}
                      placeholder={replyTo ? `Reply to ${replyTo.displayName}...` : "Add a comment..."}
                      className="flex-1 bg-muted/30 border border-glass-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <Button
                      size="sm"
                      className="gradient-primary text-primary-foreground border-0"
                      disabled={sendingComment}
                      onClick={() => void sendComment()}
                    >
                      Send
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-4">Log in to join the discussion.</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass p-6 rounded-xl"
              >
                <h2 className="font-display font-semibold text-lg mb-4">Reviews</h2>

                <div className="mb-6 rounded-lg border border-glass-border bg-muted/20 p-4">
                  <p className="text-sm font-medium mb-2">{myReview ? "Update your review" : "Leave a review"}</p>
                  <div className="flex items-center gap-2 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            if (canReview) setReviewRating(value);
                          }}
                          className={`text-amber-300 ${canReview ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                          disabled={!canReview}
                        >
                          <Star className={`w-5 h-5 ${value <= reviewRating ? "fill-amber-300" : ""}`} />
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    className="w-full min-h-[90px] bg-muted/30 border border-glass-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-70"
                    placeholder="Share your experience with this activity and host..."
                    disabled={!canReview}
                  />
                  {reviewAccessMessage && (
                    <p className="mt-3 text-sm text-muted-foreground">{reviewAccessMessage}</p>
                  )}
                  <Button
                    className="mt-3"
                    onClick={() => reviewMutation.mutate()}
                    disabled={!canReview || reviewMutation.isPending || reviewBody.trim().length < 5}
                  >
                    {myReview ? "Update review" : "Submit review"}
                  </Button>
                </div>

                <div className="space-y-3">
                  {reviews.length === 0 && (
                    <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  )}
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-glass-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="font-medium">{review.reviewerDisplayName}</p>
                        <p className="text-amber-300 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                className="glass p-6 rounded-xl"
              >
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Attendees
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activity.attendees.map((attendee) => (
                    <Link
                      key={attendee.id}
                      to={`/profile/${attendee.id}`}
                      className="flex items-center gap-3 rounded-lg bg-muted/20 p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground overflow-hidden">
                        {attendee.imageUrl ? (
                          <img src={attendee.imageUrl} alt={attendee.displayName} className="w-full h-full object-cover" />
                        ) : (
                          attendee.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{attendee.displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {attendee.id === activity.hostId ? "Host" : attendee.following ? "Following" : "Attendee"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {host && pendingBookings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="glass p-6 rounded-xl"
                >
                  <h2 className="font-display font-semibold text-lg mb-4">Booking requests</h2>
                  <div className="space-y-3">
                    {pendingBookings.map((booking) => (
                      <div key={booking.user.id} className="rounded-lg border border-glass-border bg-muted/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{booking.user.displayName}</p>
                            <p className="text-xs text-muted-foreground">Status: {booking.status}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate(booking.user.id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectMutation.mutate(booking.user.id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-6 rounded-xl"
              >
                <h3 className="font-display font-semibold mb-4">Organizer</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {activity.hostDisplayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <Link to={`/profile/${activity.hostId}`} className="font-medium hover:text-primary">
                      {activity.hostDisplayName}
                    </Link>
                    <p className="text-xs text-muted-foreground">Event Organizer</p>
                  </div>
                </div>

                {host ? (
                  <div className="space-y-3">
                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      You host this activity
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => attendMutation.mutate()}
                      disabled={attendMutation.isPending}
                    >
                      {activity.isCancelled ? "Reopen activity" : "Cancel activity"}
                    </Button>
                  </div>
                ) : user ? (
                  <Button
                    variant={joined ? "outline" : "default"}
                    className="w-full"
                    onClick={() => {
                      if (!currentStatus && activity.isPaid) {
                        checkoutMutation.mutate();
                        return;
                      }

                      attendMutation.mutate();
                    }}
                    disabled={attendMutation.isPending || checkoutMutation.isPending}
                  >
                    {bookingActionLabel}
                  </Button>
                ) : (
                  <Link to="/auth" className="block">
                    <Button className="w-full">Log in to join</Button>
                  </Link>
                )}

                {!!currentStatus && !host && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Your booking status: {currentStatus}
                  </p>
                )}

                {!host && activity.isPaid && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Paid bookings are automatically refunded if cancelled or rejected.
                  </p>
                )}

                {user && (
                  <div className="mt-5 pt-5 border-t border-glass-border space-y-3">
                    <Button
                      type="button"
                      variant={activity.isSavedByCurrentUser ? "default" : "outline"}
                      className="w-full"
                      onClick={() => toggleSavedMutation.mutate()}
                      disabled={toggleSavedMutation.isPending}
                    >
                      <Bookmark className="w-4 h-4 mr-1" />
                      {activity.isSavedByCurrentUser ? "Saved" : "Save activity"}
                    </Button>

                    <div className="flex gap-2">
                      <input
                        value={wishlistName}
                        onChange={(e) => setWishlistName(e.target.value)}
                        placeholder="Wishlist name"
                        className="flex-1 bg-muted/30 border border-glass-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const name = wishlistName.trim();
                          if (!name) return;
                          addToWishlistMutation.mutate(name);
                        }}
                        disabled={addToWishlistMutation.isPending || wishlistName.trim().length === 0}
                      >
                        <ListPlus className="w-4 h-4" />
                      </Button>
                    </div>

                    {currentWishlistNames.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentWishlistNames.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => removeFromWishlistMutation.mutate(name)}
                            className="px-2.5 py-1 rounded-full text-xs border border-primary/30 text-primary hover:bg-primary/10"
                            disabled={removeFromWishlistMutation.isPending}
                          >
                            {name} x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-6 rounded-xl"
              >
                <h3 className="font-display font-semibold mb-4">Location</h3>
                <p className="text-sm text-muted-foreground mb-2">{activity.venue}, {activity.city}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Coordinates: {activity.latitude}, {activity.longitude}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  Open in Google Maps
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ActivityDetails;
