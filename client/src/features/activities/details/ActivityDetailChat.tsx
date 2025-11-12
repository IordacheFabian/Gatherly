import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Stack,
  Paper,
  Divider,
  CircularProgress,
  TextField,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
// import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useComments } from "../../../lib/hooks/useComments";
import { timeAgo } from "../../../lib/util/uitl";
import { useForm, type FieldValues } from "react-hook-form";
import { observer } from "mobx-react-lite";
import { useAccount } from "../../../lib/hooks/useAccount";

// type Msg = {
//   id: string;
//   author: string;
//   avatar?: string;
//   text: string;
//   time: string;
//   mine?: boolean;
// };



const ActivityDetailsChat =  observer(function ActivityDetailsChat() {
  const {id} = useParams();
  const {commentStore} = useComments(id);
  const {currentUser} = useAccount();

  const {register, handleSubmit, reset, formState: {isSubmitting}} = useForm();

  const addComment = async (data: FieldValues) => {
    try {
      await commentStore.hubConnection?.invoke('SendComment', {
        activityId: id,
        body: data.body
      });
      reset();
      
    } catch (error) {
      console.log(error);
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if(event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(addComment)();
    }
  }

  const send = () => {
    handleSubmit(addComment)();
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          textAlign: "center",
          background:
            "linear-gradient(90deg, rgba(123,97,255,0.12), rgba(41,182,246,0.08))",
          color: "text.primary",
          p: 2,
          borderRadius: 6,
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

      <Card
        sx={{
          mt: 2,
          borderRadius: 10,
          boxShadow: 6,
          overflow: "hidden",
          position: "relative",
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 0.9,
          minWidth: 96,
          color: "#fff",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(6px) saturate(120%)",
          WebkitBackdropFilter: "blur(6px) saturate(120%)",

          "&::before": {
            content: '""',
            position: "absolute",
            left: "-40%",
            top: "-60%",
            width: "220%",
            height: "220%",
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.16), rgba(255,255,255,0) 18%), linear-gradient(90deg, rgba(123,97,255,0.10), rgba(41,182,246,0.10))",
            transform: "rotate(20deg)",
            transition:
              "transform 560ms cubic-bezier(.2,.9,.2,1), opacity 300ms",
            opacity: 0.95,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            boxShadow: "inset 0 -8px 24px rgba(0,0,0,0.08)",
            pointerEvents: "none",
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, display: "flex", gap: 1, alignItems: "center" }}>
            <Avatar
              src={currentUser?.imageUrl}
              alt={"you"}
              sx={{ width: 40, height: 40 }}
            />

            <Paper
              component="form"
              sx={{
                p: "6px 8px",
                display: "flex",
                alignItems: "center",
                gap: 1,
                flex: 1,
                borderRadius: 3,
                boxShadow: "none",
                bgcolor: "transparent",
                ml: 1,
                // overflow: "hidden",
                color: "#fff",
                background: "transparent",
                backdropFilter: "blur(8px) saturate(120%)",
                WebkitBackdropFilter: "blur(8px) saturate(120%)",

                "& .MuiOutlinedInput-root": {
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 3,
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": { border: "none" },
                  "& input": {
                    color: "#000000ff",
                    background: "transparent",
                  },
                },

                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  WebkitTextFillColor: "rgba(255,255,255,0.7) !important",
                  transition: "background-color 9999s ease-out 0s !important",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  WebkitTextFillColor: "rgba(255,255,255,0.7) !important",
                },
              }}
            >
              <TextField
                {...register("body", { required: true })}
                label="Comment"
                variant="outlined"
                fullWidth
                multiline
                onKeyDown={handleKeyPress}
                // disabled={isSubmitting}
                slotProps={{
                  input: {
                    endAdornment: isSubmitting ? (
                      <CircularProgress size={20} />
                    ) : null,
                  },
                }}
                sx={{
                  borderRadius: 3,
                  // overflow: "hidden",
                  color: "#fff",
                  background: "transparent",
                  backdropFilter: "blur(8px) saturate(120%)",
                  WebkitBackdropFilter: "blur(8px) saturate(120%)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",

                  "& .MuiOutlinedInput-root": {
                    background: "transparent",
                    // border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 3,
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                    "& input": {
                      color: "#ffffffff",
                      // background: "transparent",
                    },
                  },

                  "& input:-webkit-autofill": {
                    WebkitBoxShadow:
                      "0 0 0 1000px transparent inset !important",
                    WebkitTextFillColor: "rgba(255,255,255,0.7) !important",
                    transition: "background-color 9999s ease-out 0s !important",
                  },
                  "& input:-webkit-autofill:focus": {
                    WebkitBoxShadow:
                      "0 0 0 1000px transparent inset !important",
                    WebkitTextFillColor: "rgba(123, 123, 123, 1) !important",
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(177, 177, 177, 0.55)",
                    // fontWeight: 600,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "gray",
                  },

                }}
              />
              <IconButton color="primary" sx={{ p: 1 }}>
                <SendIcon
                  onClick={send}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 10,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    py: 0.9,
                    minWidth: 96,
                    height: "36px",
                    color: "#1b1a1aff",
                    // subtle translucent base so backdropFilter works through
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
                    backdropFilter: "blur(6px) saturate(120%)",
                    WebkitBackdropFilter: "blur(6px) saturate(120%)",

                    // moving sheen + subtle color wash via pseudo elements
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: "-40%",
                      top: "-60%",
                      width: "220%",
                      height: "220%",
                      background:
                        "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.16), rgba(255,255,255,0) 18%), linear-gradient(90deg, rgba(123,97,255,0.10), rgba(41,182,246,0.10))",
                      transform: "rotate(20deg)",
                      transition:
                        "transform 560ms cubic-bezier(.2,.9,.2,1), opacity 300ms",
                      opacity: 0.95,
                      pointerEvents: "none",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      borderRadius: 12,
                      boxShadow: "inset 0 -8px 24px rgba(0,0,0,0.08)",
                      pointerEvents: "none",
                    },

                    // hover/tap states
                    "&:hover": {
                      transform: "translateY(-5px) scale(1.02)",
                      boxShadow: "0 18px 40px rgba(41,182,246,0.14)",
                      "&::before": {
                        transform: "rotate(20deg) translateX(8%)",
                      },
                    },
                    "&:active": {
                      transform: "translateY(-1px) scale(0.995)",
                      boxShadow: "0 8px 20px rgba(11,14,46,0.08)",
                    },
                  }}
                />
              </IconButton>
            </Paper>
          </Box>
          <Box
            // ref={listRef}
            sx={{
              maxHeight: 320,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              "@keyframes pop": {
                "0%": { opacity: 0, transform: "translateY(8px) scale(0.98)" },
                "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
              },
            }}
          >
            {commentStore.comments.map((comment) => (
              <Box
                key={comment.id}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                  // justifyContent: m.mine ? "flex-end" : "flex-start",
                  // animation: `pop 360ms ease ${i * 40}ms both`,
                }}
              >
                <Avatar
                  src={comment.imageUrl}
                  alt={"user image"}
                  sx={{ width: 36, height: 36 }}
                />

                <Box
                  sx={{
                    maxWidth: "78%",
                    px: 2.2,
                    py: 1.1,
                    borderRadius: 5,

                    overflowWrap: "anywhere",
                    textAlign: "left",

                    position: "relative",
                    overflow: "hidden",
                    textTransform: "none",
                    fontWeight: 700,

                    minWidth: 96,

                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.14)",
                    backdropFilter: "blur(6px) saturate(120%)",
                    WebkitBackdropFilter: "blur(6px) saturate(120%)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: "-40%",
                      top: "-60%",
                      width: "220%",
                      height: "220%",
                      background:
                        "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.16), rgba(255,255,255,0) 18%), linear-gradient(90deg, rgba(123,97,255,0.10), rgba(41,182,246,0.10))",
                      transform: "rotate(20deg)",
                      transition:
                        "transform 560ms cubic-bezier(.2,.9,.2,1), opacity 300ms",
                      opacity: 0.95,
                      pointerEvents: "none",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      borderRadius: 12,
                      boxShadow: "inset 0 -8px 24px rgba(0,0,0,0.08)",
                      pointerEvents: "none",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {comment.displayName}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {timeAgo(comment.createdAt)}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}
                  >
                    {comment.body}
                  </Typography>
                </Box>

                {/* <Avatar sx={{ width: 36, height: 36 }} /> */}
              </Box>
            ))}
          </Box>

          <Divider />
        </CardContent>
      </Card>
    </Box>
  );
});

export default ActivityDetailsChat;
