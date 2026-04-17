import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import type { Comment } from "@/lib/types";

export function createCommentsHub(activityId: string) {
  const connection = new HubConnectionBuilder()
    .withUrl(`/comments?activityId=${encodeURIComponent(activityId)}`, {
      withCredentials: true,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  const start = async () => {
    if (connection.state !== HubConnectionState.Disconnected) return;
    await connection.start();
  };

  const stop = async () => {
    if (connection.state === HubConnectionState.Disconnected) return;
    await connection.stop();
  };

  const onLoadComments = (handler: (comments: Comment[]) => void) => {
    connection.on("LoadComments", handler);
    return () => connection.off("LoadComments", handler);
  };

  const onReceiveComment = (handler: (comment: Comment) => void) => {
    connection.on("ReceiveComment", handler);
    return () => connection.off("ReceiveComment", handler);
  };

  const sendComment = async (body: string, parentCommentId?: string) => {
    await connection.invoke("SendComment", { activityId, body, parentCommentId });
  };

  return {
    start,
    stop,
    onLoadComments,
    onReceiveComment,
    sendComment,
  };
}
