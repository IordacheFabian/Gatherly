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
import type { Activity } from "../../../lib/types";
import { useState } from "react";
import MapComponent from "../../../app/shared/components/MapComponent";

type Props = {
  activity: Activity;
};

export default function ActivityDetailsInfo({ activity }: Props) {
  const theme = useTheme();
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Info sx={{ color: theme.palette.primary.main, fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                About this activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
              <Typography variant="body2" color="text.secondary">
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
              <Typography variant="body2" color="text.secondary">
                {activity.venue}, {activity.city}
              </Typography>
            </Box>
            <Button
              onClick={() => setMapOpen(!mapOpen)}
              sx={{
                background: "linear-gradient(90deg,#7b61ff,#29b6f6)",
                borderRadius: 3,
                color: "#fff",
                fontSize: 11,
                ":hover": {
                  background: "linear-gradient(0deg,#7b61ff,#29b6f6)",
                  fontSize: 11.2,
                },
              }}
            >
              {mapOpen ? "Hide Map" : "Show Map"}
            </Button>
            <Chip label="In person" size="small" sx={{ ml: 1 }} />
          </Box>
          {mapOpen && (
            <Box sx={{ height: 200, zIndex: 1000, display: "block" }}>
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
