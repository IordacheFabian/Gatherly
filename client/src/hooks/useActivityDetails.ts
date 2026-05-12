import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activitiesApi } from "@/lib/api";
import { isUserAttending, isUserHost } from "@/lib/activity-view";
import { toast } from "@/components/ui/sonner";
import type { UserInfo } from "@/lib/types";

export function useActivityDetails(id: string | undefined, user: UserInfo | null) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [wishlistName, setWishlistName] = useState("");

  const activityQuery = useQuery({
    queryKey: ["activity", id],
    queryFn: () => activitiesApi.details(id!),
    enabled: Boolean(id),
  });

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

  const activity = activityQuery.data;
  const reviews = reviewsQuery.data ?? [];
  const myReview = reviews.find((x) => x.reviewerUserId === user?.id);
  const currentWishlistNames =
    wishlistsQuery.data
      ?.filter((group) => group.activities.some((a) => a.id === id))
      .map((group) => group.name) ?? [];

  const host = activity ? isUserHost(activity, user?.id) : false;
  const joined = activity ? isUserAttending(activity, user?.id) : false;
  const currentStatus = activity?.currentUserBookingStatus;

  const canReview = Boolean(
    !host && user && currentStatus === "Approved" && activity && new Date(activity.date).getTime() <= Date.now(),
  );

  const reviewAccessMessage = (() => {
    if (!user) return "Log in to leave a review after you attend this activity.";
    if (host) return "Hosts cannot review their own activities.";
    if (currentStatus !== "Approved") return "Only approved attendees can leave a review.";
    if (activity && new Date(activity.date).getTime() > Date.now()) return "Reviews open after the activity ends.";
    return null;
  })();

  const bookingActionLabel = (() => {
    if (!currentStatus) return activity?.isPaid ? "Pay & reserve spot" : "Request booking";
    if (currentStatus === "Pending" || currentStatus === "Waitlisted" || currentStatus === "Approved") {
      return "Cancel booking";
    }
    return "Request booking again";
  })();

  const priceLabel = activity?.isPaid
    ? `${new Intl.NumberFormat("en-US", { style: "currency", currency: activity.currency }).format(activity.priceAmount)} per booking`
    : "Free activity";

  const pendingBookings =
    activity?.bookings.filter((b) => !b.isHost && (b.status === "Pending" || b.status === "Waitlisted")) ?? [];

  useEffect(() => {
    if (!id || !user) return;
    void activitiesApi.trackView(id);
  }, [id, user]);

  useEffect(() => {
    if (!myReview) return;
    setReviewRating(myReview.rating);
    setReviewBody(myReview.body);
  }, [myReview]);

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

  return {
    activityQuery,
    activity,
    reviews,
    myReview,
    currentWishlistNames,
    host,
    joined,
    currentStatus,
    canReview,
    reviewAccessMessage,
    bookingActionLabel,
    priceLabel,
    pendingBookings,
    reviewRating,
    setReviewRating,
    reviewBody,
    setReviewBody,
    wishlistName,
    setWishlistName,
    attendMutation,
    approveMutation,
    rejectMutation,
    deleteMutation,
    checkoutMutation,
    reviewMutation,
    toggleSavedMutation,
    addToWishlistMutation,
    removeFromWishlistMutation,
  };
}
