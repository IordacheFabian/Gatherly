import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  InputBase,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  time: string;
  mine?: boolean;
};

export default function ActivityDetailsChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "1",
      author: "Alice",
      avatar: "/images/user.png",
      text: "Looking forward to this event! Anyone healthy snacks recommendations?",
      time: "2h",
    },
    {
      id: "2",
      author: "You",
      avatar: "/images/user.png",
      text: "I can bring fruit skewers 🍓",
      time: "1h",
      mine: true,
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const msg: Msg = {
      id: Date.now().toString(),
      author: "You",
      avatar: "/images/user.png",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      mine: true,
    };
    setMessages((m) => [...m, msg]);
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <Box
        sx={{
          textAlign: "center",
          background:
            "linear-gradient(90deg, rgba(123,97,255,0.12), rgba(41,182,246,0.08))",
          color: "text.primary",
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Chat about this event
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Discuss logistics, ask questions, and coordinate with attendees.
        </Typography>
      </Box>

      <Card sx={{ mt: 2, borderRadius: 3, boxShadow: 6, overflow: "hidden" }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            ref={listRef}
            sx={{
              maxHeight: 320,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "background.paper",
              // simple pop animation for messages
              "@keyframes pop": {
                "0%": { opacity: 0, transform: "translateY(8px) scale(0.98)" },
                "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
              },
            }}
          >
            {messages.map((m, i) => (
              <Box
                key={m.id}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                  justifyContent: m.mine ? "flex-end" : "flex-start",
                  animation: `pop 360ms ease ${i * 40}ms both`,
                }}
              >
                {!m.mine && (
                  <Avatar
                    src={m.avatar}
                    alt={m.author}
                    sx={{ width: 36, height: 36 }}
                  />
                )}

                <Box
                  sx={{
                    maxWidth: "78%",
                    bgcolor: m.mine ? "#7b61ff" : "grey.100",
                    background: m.mine
                      ? "linear-gradient(135deg,#7b61ff,#29b6f6)"
                      : undefined,
                    color: m.mine ? "common.white" : "text.primary",
                    px: 2.2,
                    py: 1.1,
                    borderRadius: 2,
                    borderTopLeftRadius: m.mine ? 2 : 0,
                    borderTopRightRadius: m.mine ? 0 : 2,
                    boxShadow: m.mine
                      ? "0 6px 18px rgba(123,97,255,0.12)"
                      : "none",
                    overflowWrap: "anywhere",
                    textAlign: "left",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {m.mine ? "You" : m.author}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {m.time}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}
                  >
                    {m.text}
                  </Typography>
                </Box>

                {m.mine && (
                  <Avatar
                    src={m.avatar}
                    alt={m.author}
                    sx={{ width: 36, height: 36 }}
                  />
                )}
              </Box>
            ))}
          </Box>

          <Divider />

          <Box sx={{ p: 2, display: "flex", gap: 1, alignItems: "center" }}>
            <Avatar
              src={"/images/user.png"}
              alt={"you"}
              sx={{ width: 40, height: 40 }}
            />

            <Paper
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              sx={{
                p: "6px 8px",
                display: "flex",
                alignItems: "center",
                gap: 1,
                flex: 1,
                borderRadius: 3,
                boxShadow: "none",
                bgcolor: "background.default",
              }}
            >
              <InputBase
                multiline
                maxRows={4}
                placeholder="Write a message — Enter to send, Shift+Enter for newline"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                sx={{ flex: 1, ml: 1 }}
              />
              <IconButton onClick={send} color="primary" sx={{ p: 1 }}>
                <SendIcon />
              </IconButton>
            </Paper>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
