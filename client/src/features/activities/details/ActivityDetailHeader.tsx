import {
  Card,
  CardMedia,
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router";
import CancelIcon from "@mui/icons-material/Cancel";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import { useActivities } from "../../../lib/hooks/useActivities";

type Props = {
  activity: Activity;
};

export default function ActivityDetailsHeader({ activity }: Props) {
  const {updateAttendance} = useActivities(activity.id);

  return (
    <Card
      sx={{ position: "relative", mb: 3, borderRadius: 3, overflow: "hidden" }}
    >
      <CardMedia
        component="img"
        height="320"
        image={`/images/categoryImages/${activity.category}.jpg`}
        alt={`${activity.category} image`}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.65) 100%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 24,
          right: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          sx={{ display: "flex", gap: 2, alignItems: "center", minWidth: 0 }}
        >
          <Avatar
            src="/images/user.png"
            alt="host"
            sx={{ width: 72, height: 72, borderRadius: 10, boxShadow: 4 }}
          />

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "common.white" }}
              noWrap
            >
              {activity.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
              {new Date(activity.date).toLocaleString()} •{" "}
              <strong>{activity.category}</strong>
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              Hosted by{" "}
              <Link
                to={`/profiles/${activity.hostId}`}
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                {activity.hostDisplayName}
              </Link>
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {activity.isCancelled && (
            <Tooltip title="This event is cancelled">
              <Chip
                icon={<EventBusyIcon />}
                label="Cancelled"
                color="error"
                sx={{ fontWeight: 700 }}
              />
            </Tooltip>
          )}

          {activity.isHost ? (
            <>
              <Button
                onClick={() => updateAttendance.mutate(activity.id)}
                disabled={updateAttendance.isPending}
                startIcon={<CancelIcon />}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 10,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 0.9,
                  minWidth: 96,
                  // color: "#1b1a1aff",
                  color: "#fff",
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
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 10,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    py: 0.9,
                    minWidth: 96,
                    // color: "#1b1a1aff",
                    color: "#fff",
                    // subtle translucent base so backdropFilter works through
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.14)",
                    // boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
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
                  },
                }}
              >
                {activity.isCancelled ? "Re-activate" : "Cancel"}
              </Button>

              <Button
                component={Link}
                to={`/manage/${activity.id}`}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 5,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 0.9,
                  minWidth: 96,
                  // color: "#1b1a1aff",
                  color: "#fff",
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
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 10,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    py: 0.9,
                    minWidth: 96,
                    // color: "#1b1a1aff",
                    color: "#fff",
                    // subtle translucent base so backdropFilter works through
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.14)",
                    // boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
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
                  },
                }}
                disabled={activity.isCancelled}
              >
                Manage
              </Button>
            </>
          ) : (
            <Button
              onClick={() => updateAttendance.mutate(activity.id)}
              disabled={updateAttendance.isPending || activity.isCancelled}
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 10,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 0.9,
                minWidth: 96,
                // color: "#1b1a1aff",
                color: "#fff",
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
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 10,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 0.9,
                  minWidth: 96,
                  // color: "#1b1a1aff",
                  color: "#fff",
                  // subtle translucent base so backdropFilter works through
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.14)",
                  // boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
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
                },
              }}
            >
              {activity.isGoing ? "Cancel Attendance" : "Join Activity"}
            </Button>
          )}
        </Stack>
      </Box>
    </Card>
  );
}
