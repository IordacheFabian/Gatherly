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

type Props = {
  activity: Activity;
};

export default function ActivityDetailsHeader({ activity }: Props) {
  const isCancelled = false;
  const isHost = true;
  const isGoing = true;
  const loading = false;

  return (
    <Card
      sx={{ position: "relative", mb: 3, borderRadius: 3, overflow: "hidden" }}
    >
      {/* hero image */}
      <CardMedia
        component="img"
        height="320"
        image={`/images/categoryImages/${activity.category}.jpg`}
        alt={`${activity.category} image`}
      />

      {/* gradient overlay */}
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
            sx={{ width: 72, height: 72, borderRadius: 2, boxShadow: 4 }}
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
                to={`/profiles/username`}
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                Bob
              </Link>
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {isCancelled && (
            <Tooltip title="This event is cancelled">
              <Chip
                icon={<EventBusyIcon />}
                label="Cancelled"
                color="error"
                sx={{ fontWeight: 700 }}
              />
            </Tooltip>
          )}

          {isHost ? (
            <>
              <Button
                onClick={() => {}}
                startIcon={<CancelIcon />}
                sx={{
                  bgcolor: isCancelled ? "success.main" : "error.main",
                  color: "common.white",
                  "&:hover": { opacity: 0.95 },
                  borderRadius: 2,
                  px: 2,
                  textTransform: "none",
                }}
                disabled={false}
              >
                {isCancelled ? "Re-activate" : "Cancel"}
              </Button>

              <Button
                component={Link}
                to={`/manage/activityId`}
                sx={{
                  background: "linear-gradient(90deg,#7b61ff,#29b6f6)",
                  color: "#fff",
                  borderRadius: 2,
                  px: 2,
                  textTransform: "none",
                  "&:hover": { opacity: 0.95 },
                }}
                disabled={isCancelled}
              >
                Manage
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {}}
              sx={{
                background: isGoing
                  ? "linear-gradient(90deg,#7b61ff,#29b6f6)"
                  : "linear-gradient(90deg,#81c784,#4caf50)",
                color: "#fff",
                borderRadius: 2,
                px: 2,
                textTransform: "none",
                "&:hover": { opacity: 0.95 },
              }}
              disabled={isCancelled || loading}
            >
              {isGoing ? "Cancel Attendance" : "Join Activity"}
            </Button>
          )}
        </Stack>
      </Box>
    </Card>
  );
}
