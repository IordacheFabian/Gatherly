import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grow,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import { useActivities } from "../../../lib/hooks/useActivities";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  activitySchema,
  type ActivitySchema,
} from "../../../lib/schemas/activitySchema";
import TextInput from "../../../app/shared/components/TextInput";
import SelectInput from "../../../app/shared/components/SelectInput";
import { categoryOptions } from "./categoryOptions";
import LocationInput from "../../../app/shared/components/LocationInput";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ActivityForm() {
  const { control, reset, handleSubmit } = useForm<ActivitySchema>({
    mode: "onTouched",
    resolver: zodResolver(activitySchema),
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const { updateActivity, createActivity, activity, isLoadingActivity } =
    useActivities(id);

  useEffect(() => {
    if (activity) {
      reset({
        ...activity,
        location: {
          city: activity.city,
          venue: activity.venue,
          latitude: activity.latitude,
          longitude: activity.longitude,
        },
      });
    }
  }, [activity, reset]);

  const onSubmit = async (data: ActivitySchema) => {
    const { location, ...rest } = data;
    const flattenedData = { ...rest, ...location };

    try {
      if (activity) {
        updateActivity.mutate(
          { ...activity, ...flattenedData },
          {
            onSuccess: () => navigate(`/activities/${activity.id}`),
          }
        );
      } else {
        createActivity.mutate(flattenedData, {
          onSuccess: (id) => navigate(`/activities/${id}`),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoadingActivity) return <Typography>Loading activity...</Typography>;

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
            onSubmit={handleSubmit(onSubmit)}
            display="flex"
            flexDirection="column"
            gap={3}
          >
            <TextInput label="Title" control={control} name="title" />
            <TextInput
              control={control}
              label="Description"
              name="description"
              multiline
              rows={4}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <SelectInput
                control={control}
                label="Category"
                name="category"
                fullWidth
                items={categoryOptions}
              />
              <TextInput
                control={control}
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
              <LocationInput
                control={control}
                label="Enter the location"
                name="location"
                // fullWidth
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
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  px: 3,
                  py: 1.2,
                  "&:hover": {
                    background: "linear-gradient(90deg, #ffd2d2ff, #7696ffff)",
                    border: 0,
                    color: "#fff",
                    py: 1.3,
                  },
                }}
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
