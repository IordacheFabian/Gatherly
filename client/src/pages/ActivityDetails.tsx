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
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { activitiesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { createCommentsHub } from "@/lib/commentsHub";
import type { Comment } from "@/lib/types";
import { getActivityImage, isUserAttending, isUserHost } from "@/lib/activity-view";

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const hubRef = useRef<ReturnType<typeof createCommentsHub> | null>(null);

  const activityQuery = useQuery({
    queryKey: ["activity", id],
    queryFn: () => activitiesApi.details(id!),
    enabled: Boolean(id),
  });

  const activity = activityQuery.data;

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

  const deleteMutation = useMutation({
    mutationFn: () => activitiesApi.remove(id!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      navigate("/");
    },
  });

  const sendComment = async () => {
    if (!hubRef.current || !commentBody.trim()) return;

    setSendingComment(true);
    try {
      await hubRef.current.start();
      await hubRef.current.sendComment(commentBody.trim());
      setCommentBody("");
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
                    <span>{activity.attendees.length} joined</span>
                  </div>
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
                      </div>
                    </div>
                  ))}
                  {!comments.length && (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  )}
                </div>
                {user ? (
                  <div className="mt-4 flex gap-2">
                    <input
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      onKeyDown={handleCommentKeyDown}
                      placeholder="Add a comment..."
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
                    onClick={() => attendMutation.mutate()}
                    disabled={attendMutation.isPending}
                  >
                    {joined ? "Leave activity" : "Join activity"}
                  </Button>
                ) : (
                  <Link to="/auth" className="block">
                    <Button className="w-full">Log in to join</Button>
                  </Link>
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
