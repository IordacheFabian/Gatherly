import { useEffect, useRef, useState } from "react";
import { createCommentsHub } from "@/lib/commentsHub";
import type { Comment } from "@/lib/types";

export function useActivityComments(id: string | undefined, userId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [sendingComment, setSendingComment] = useState(false);
  const hubRef = useRef<ReturnType<typeof createCommentsHub> | null>(null);

  useEffect(() => {
    if (!id || !userId) return;

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
  }, [id, userId]);

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

  return {
    comments,
    commentBody,
    setCommentBody,
    replyTo,
    setReplyTo,
    sendingComment,
    sendComment,
    handleCommentKeyDown,
  };
}
