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
} from "@mui/material";

type Props = {
  activity: Activity;
};

export default function ActivityDetailsInfo({ activity }: Props) {
  const theme = useTheme();

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
            <Chip label="In person" size="small" sx={{ ml: 1 }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
