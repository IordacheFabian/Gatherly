import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link } from "react-router";
import AvatarPopover from "../../../app/shared/components/AvatarPopover";
// import LiquidGlass from 'liquid-glass-react'Z


type Props = {
  activity: Activity;
};

export default function ActivityCard({ activity }: Props) {
  const label = activity.isHost ? "You are hosting" : "You are going";
  const color = activity.isHost ? "secondary" : activity.isGoing ? "warning" : "default";

  // const handleDeleteClick = () => {
  //   if (removing) return;
  //   // start the animation
  //   setRemoving(true);
  //   // after animation completes, call parent delete
  //   setTimeout(() => deleteActivity.mutate(activity.id), ANIM_DURATION);
  // };
  const categoryColors: Record<string, string> = {
    music: "#7b61ff",
    culture: "#ff7ab6",
    drinks: "#00bfa6",
    film: "#ffb86b",
    food: "#ff7043",
    travel: "#29b6f6",
  };

  const formattedDate: string = (() => {
    try {
      const d = new Date(activity.date);
      return isNaN(d.getTime()) ? String(activity.date) : d.toLocaleString();
    } catch {
      return String(activity.date);
    }
  })();

  const chipColor = categoryColors[(activity.category || "").toLowerCase()] as
    | string
    | undefined;

  return (
    // <Grow in appear timeout={400}>
    <Card
      elevation={3}
      sx={{
        borderRadius: 5,
        overflow: "hidden",
        position: "relative",
        // overflow: "hidden",
        // borderRadius: 10,
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
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          mt: 2,
          width: "100%",
          borderRadius: 4,
          background:
            "linear-gradient(90deg, rgba(123,97,255,0.12), rgba(41,182,246,0.08))",
        }}
      >
        <Avatar
          src={activity.hostImageUrl}
          alt="Image of host"
          sx={{ width: 64, height: 64, borderRadius: 999 }}
        >
          {activity.hostImageUrl ? (
            <img
              src={activity.hostImageUrl}
              alt={activity.hostDisplayName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 999,
              }}
            />
          ) : (
            <Avatar
              alt={activity.category}
              sx={{ width: 64, height: 64, borderRadius: 2 }}
            />
          )}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
            {activity.title}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 0.5 }}
          >
            <CalendarMonthIcon
              fontSize="small"
              sx={{ color: "text.secondary" }}
            />
            <Typography variant="body2" sx={{ color: "#fff" }} noWrap>
              {formattedDate}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            <Box sx={{ color: "lightgray" }}>
              Hosted by{" "}
              <Link
                to={`/profiles/${activity.hostId}`}
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                {activity.hostDisplayName}
              </Link>
            </Box>
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Add to favorites">
            <IconButton size="small" sx={{}}>
              <FavoriteBorderIcon
                sx={{
                  color: "#fff",
                  borderRadius: 5,
                  "&:hover": { color: "#ff0000ff" },
                }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <CardContent sx={{ pt: 1 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="flex-start"
          sx={{ mb: 1 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                color: "#fff",
              }}
            >
              {activity.description}

              <Box>
                {(activity.isHost || activity.isGoing) && (
                  <Chip label={label} color={color} sx={{ borderRadius: 3 }} />
                )}
                {activity.isCancelled && (
                  <Chip
                    label="Cancelled"
                    color="error"
                    sx={{ borderRadius: 3 }}
                  />
                )}
              </Box>
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <PlaceIcon sx={{ color: "#fff", fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: "#fff" }}>
                {activity.city} · {activity.venue}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 2 }}
            >
              {activity.attendees.map((att) => (
                <AvatarPopover profile={att} key={att.id} />
              ))}
            </Stack>
          </Box>

          <Stack spacing={1} alignItems="flex-end">
            <Chip
              label={activity.category}
              size="small"
              sx={{
                bgcolor: chipColor || "background.paper",
                color: chipColor ? "#fff" : "text.primary",
                fontWeight: 600,
              }}
            />
            <Chip
              label={activity.isCancelled ? "Cancelled" : "Open"}
              size="small"
              color={activity.isCancelled ? "error" : "success"}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Stack>
      </CardContent>

      <CardActions
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          pb: 2,
          px: 2,
        }}
      >
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
          <Button
            component={Link}
            to={`/activities/${activity.id}`}
            variant="contained"
            endIcon={<VisibilityIcon />}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 10,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 0.9,
              minWidth: 96,
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
          >
            View
          </Button>
        </Box>
      </CardActions>
    </Card>
    // </Grow>
  );
}
