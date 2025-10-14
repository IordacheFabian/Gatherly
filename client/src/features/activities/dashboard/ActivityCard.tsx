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
import type { Activity } from "../../../lib/types";

type Props = {
  activity: Activity;
};

export default function ActivityCard({ activity }: Props) {
  const isHost = false;
  const isGoing = false;
  const label = isHost ? "You are hosting" : "You are going";
  const isCanceled = false;
  const color = isHost ? "secondary" : isGoing ? "warning" : "default";

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
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          background:
            "linear-gradient(90deg, rgba(123,97,255,0.12), rgba(41,182,246,0.08))",
        }}
      >
        <Avatar
          src={`/images/categoryImages/${(
            activity.category || ""
          ).toLowerCase()}.jpg`}
          alt={activity.category}
          sx={{ width: 64, height: 64, borderRadius: 2 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>
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
            <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
              {formattedDate}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            <Box>
              Hosted by <Link to={`/profiles/Bob`}>Bob</Link>
            </Box>
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Add to favorites">
            <IconButton size="small" sx={{}}>
              <FavoriteBorderIcon
                sx={{
                  color: "#797979ff",
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
                color: "text.secondary",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {activity.description}

              <Box>
                {(isHost || isGoing) && (
                  <Chip label={label} color={color} sx={{ borderRadius: 3 }} />
                )}
                {isCanceled && (
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
              <PlaceIcon sx={{ color: "text.secondary", fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {activity.city} · {activity.venue}
              </Typography>
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
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            endIcon={<VisibilityIcon />}
            sx={{
              background: "linear-gradient(45deg, #7b61ff, #29b6f6)",
              color: "#fff",
              borderRadius: 3,
              textTransform: "none",
              px: 2.2,
              py: 1,
              boxShadow: "0 8px 22px rgba(41,182,246,0.12)",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 12px 30px rgba(41,182,246,0.24)",
              },
            }}
            component={Link}
            to={`/activities/${activity.id}`}
          >
            View
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}
