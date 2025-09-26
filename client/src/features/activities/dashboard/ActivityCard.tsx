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
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
  activity: Activity;
  selectActivity: (id: string) => void;
  deleteActivity: (id: string) => void;
};

export default function ActivityCard({
  activity,
  selectActivity,
  deleteActivity,
}: Props) {
  const categoryColors: Record<string, string> = {
    music: "#7b61ff",
    culture: "#ff7ab6",
    drinks: "#00bfa6",
    film: "#ffb86b",
    food: "#ff7043",
    travel: "#29b6f6",
  };

  const formattedDate = (() => {
    try {
      const d = new Date(activity.date);
      return isNaN(d.getTime()) ? activity.date : d.toLocaleString();
    } catch {
      return activity.date;
    }
  })();

  const chipColor = categoryColors[(activity.category || "").toLowerCase()] as
    | string
    | undefined;

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        transition: "transform 200ms, box-shadow 200ms",
        boxShadow: 1,
        "&:hover": { transform: "translateY(-6px)", boxShadow: 6 },
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
        sx={{ display: "flex", justifyContent: "space-between", pb: 2, px: 2 }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            endIcon={<DeleteIcon />}
            sx={{
              background: "linear-gradient(45deg, #ff1744, #d500f9)",
              color: "#fff",
              borderRadius: 3,
              textTransform: "none",
              px: 2.2,
              py: 1,
              boxShadow: "0 8px 22px rgba(213,0,249,0.12)",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 12px 30px rgba(213,0,249,0.24)",
              },
            }}
            onClick={() => deleteActivity(activity.id)}
          >
            Delete
          </Button>

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
            onClick={() => selectActivity(activity.id)}
          >
            View
          </Button>
        </Box>

        <Typography variant="caption" sx={{ color: "text.secondary", mr: 1 }}>
          {new Date().getFullYear() === new Date(activity.date).getFullYear()
            ? new Date(activity.date).toLocaleDateString()
            : formattedDate}
        </Typography>
      </CardActions>
    </Card>
  );
}
