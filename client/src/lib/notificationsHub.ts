import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import type { Notification } from "@/lib/types";

export function createNotificationsHub() {
  const connection = new HubConnectionBuilder()
    .withUrl("/notifications", {
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

  const onReceiveNotification = (handler: (notification: Notification) => void) => {
    connection.on("ReceiveNotification", handler);
    return () => connection.off("ReceiveNotification", handler);
  };

  return {
    start,
    stop,
    onReceiveNotification,
  };
}
