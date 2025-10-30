import { CalendarToday, Info, Place } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Chip,
  useTheme,
  Button,
} from "@mui/material";
import { useState } from "react";
import MapComponent from "../../../app/shared/components/MapComponent";

type Props = {
  activity: Activity;
};

export default function ActivityDetailsInfo({ activity }: Props) {
  const theme = useTheme();
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <Card
      sx={{
        mb: 2,
        // borderRadius: 2,
        // boxShadow: 2,
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
          transition: "transform 560ms cubic-bezier(.2,.9,.2,1), opacity 300ms",
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
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Info sx={{ color: theme.palette.primary.main, fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                About this activity
              </Typography>
              <Typography variant="body2" color="lightgray">
                {activity.description}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <CalendarToday
              sx={{ color: theme.palette.info.main, fontSize: 30 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                When
              </Typography>
              <Typography variant="body2" color="lightgray">
                {new Date(activity.date).toLocaleString()}
              </Typography>
            </Box>
            <Chip label="Free" size="small" sx={{ ml: 1 }} />
          </Box>

          <Divider />

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Place sx={{ color: theme.palette.success.main, fontSize: 30 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Where
              </Typography>
              <Typography variant="body2" color="lightgray">
                {activity.venue}, {activity.city}
              </Typography>
            </Box>
            <Button
              onClick={() => setMapOpen(!mapOpen)}
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 10,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 0.9,
                // minWidth: 96,
                width: "120px",
                height: "36px",
                fontSize: "14px",
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
              {mapOpen ? "Hide Map" : "Show Map"}
            </Button>
            <Chip label="In person" size="small" sx={{ ml: 1 }} />
          </Box>
          {mapOpen && (
            <Box sx={{ height: 200, zIndex: 1000, display: "block", borderRadius: 5 , overflow: 'hidden'  }}>
              <MapComponent
                position={[activity.latitude, activity.longitude]}
                venue={activity.venue}
              />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
