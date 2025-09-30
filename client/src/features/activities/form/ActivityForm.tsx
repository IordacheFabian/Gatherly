import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grow,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import type { FormEvent } from "react";
import { useActivities } from "../../../lib/hooks/useActivities";

type Props = {
  activity?: Activity;
  closeForm: () => void;
};

export default function ActivityForm({ activity, closeForm }: Props) {
  const { updateActivity, createActivity } = useActivities();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const data: { [key: string]: FormDataEntryValue } = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    if (activity) {
      data.id = activity.id;
      await updateActivity.mutateAsync(data as unknown as Activity);
      closeForm();
    } else {
      await createActivity.mutateAsync(data as unknown as Activity);
      closeForm();
    }
  };

  const categoryColors: Record<string, string> = {
    music: "#7b61ff",
    culture: "#ff7ab6",
    drinks: "#00bfa6",
    film: "#ffb86b",
    food: "#ff7043",
    travel: "#29b6f6",
  };

  const chipColor = categoryColors[(activity?.category || "").toLowerCase()];

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
              activity?.category || ""
            ).toLowerCase()}.jpg`}
            sx={{ width: 64, height: 64, borderRadius: 2 }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6">
              {activity ? "Edit Activity" : "Create Activity"}
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
                {activity?.date ?? "Pick a date"}
              </Typography>
            </Stack>
          </Box>

          <Stack spacing={1} alignItems="flex-end">
            <Chip
              label={activity?.category ?? "Category"}
              size="small"
              sx={{
                bgcolor: chipColor || "background.paper",
                color: chipColor ? "#fff" : "text.primary",
                fontWeight: 700,
              }}
            />
            <Button
              onClick={closeForm}
              startIcon={<CloseIcon />}
              sx={{ textTransform: "none", borderRadius: 3 }}
            >
              Close
            </Button>
          </Stack>
        </Box>

        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            gap={3}
          >
            <TextField
              name="title"
              label="Title"
              defaultValue={activity?.title}
              fullWidth
            />
            <TextField
              name="description"
              label="Description"
              defaultValue={activity?.description}
              multiline
              rows={4}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                name="category"
                label="Category"
                defaultValue={activity?.category}
                fullWidth
              />
              <TextField
                name="date"
                label="Date"
                defaultValue={
                  activity?.date
                    ? new Date(activity.date).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                name="city"
                label="City"
                defaultValue={activity?.city}
                fullWidth
              />
              <TextField
                name="venue"
                label="Venue"
                defaultValue={activity?.venue}
                fullWidth
              />
            </Stack>

            <CardActions
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 1,
              }}
            >
              <Button
                onClick={closeForm}
                sx={{ textTransform: "none" }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  textTransform: "none",
                  background: "linear-gradient(90deg, #7b61ff, #29b6f6)",
                  color: "#fff",
                  borderRadius: 3,
                  px: 3,
                  py: 1.2,
                  "&:hover": {
                    background: "linear-gradient(90deg, #29b6f6, #7b61ff)",
                  },
                }}
                disabled={updateActivity.isPending || createActivity.isPending}
              >
                Submit
              </Button>
            </CardActions>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
}
