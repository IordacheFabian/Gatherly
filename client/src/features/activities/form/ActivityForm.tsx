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
          city: activity.city ?? "",
          venue: activity.venue ?? "",
          latitude: activity.latitude != null ? String(activity.latitude) : "",
          longitude:
            activity.longitude != null ? String(activity.longitude) : "",
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
      <Card
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            background:
              "linear-gradient(90deg, rgba(123,97,255,0.12), rgba(41,182,246,0.08))",
            borderRadius: 7,
            height: 120,
            mt: 2,
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
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
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
