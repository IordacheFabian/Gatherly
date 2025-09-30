import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Grow from "@mui/material/Grow";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useActivities } from "../../../lib/hooks/useActivities";

type Props = {
  selectedActivity: Activity;
  cancelSelectActivity: () => void;
  openForm: (id: string) => void;
};

export default function ActivityDetails({
  selectedActivity,
  cancelSelectActivity,
  openForm,
}: Props) {
  const formattedDate = (() => {
    try {
      const d = new Date(selectedActivity.date);
      return isNaN(d.getTime()) ? selectedActivity.date : d.toLocaleString();
    } catch {
      return selectedActivity.date;
    }
  })();

  const { activities } = useActivities();
  const activity = activities?.find((x) => x.id === selectedActivity.id);

  if (!activity) return <Typography>Loading...</Typography>;

  return (
    <Grow in timeout={360} style={{ transformOrigin: "top center" }}>
      <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
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
            sx={{ width: 80, height: 80, borderRadius: 2 }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" noWrap>
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
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {formattedDate}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 0.5 }}
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
              sx={{ fontWeight: 700 }}
            />
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Add to favorites">
                <IconButton size="small">
                  <FavoriteBorderIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        <CardMedia
          component="img"
          src={`/images/categoryImages/${(
            activity.category || ""
          ).toLowerCase()}.jpg`}
          sx={{ height: 260, objectFit: "cover" }}
        />

        <CardContent>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 1 }}>
            {activity.description}
          </Typography>
        </CardContent>

        <CardActions
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            pb: 2,
            px: 2,
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditIcon />}
            sx={{
              background: "linear-gradient(90deg, #7B61FF, #29B6F6)",
              color: "#fff",
              borderRadius: 3,
              textTransform: "none",
              px: 3,
              py: 1.5,
              boxShadow: "0 3px 5px 2px rgba(123,97,255,0.3)",
              "&:hover": {
                background: "linear-gradient(90deg, #29B6F6, #7B61FF)",
              },
            }}
            onClick={() => openForm(activity.id)}
          >
            Edit
          </Button>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={cancelSelectActivity}
            variant="contained"
            color="secondary"
            sx={{
              background: "linear-gradient(90deg, #E0E0E0, #BDBDBD)",
              color: "#000",
              borderRadius: 3,
              textTransform: "none",
              px: 3,
              py: 1.5,
              boxShadow: "0 3px 5px 2px rgba(189,189,189,0.3)",
              "&:hover": {
                background: "linear-gradient(90deg, #BDBDBD, #E0E0E0)",
              },
            }}
          >
            Back
          </Button>
        </CardActions>
      </Card>
    </Grow>
  );
}
