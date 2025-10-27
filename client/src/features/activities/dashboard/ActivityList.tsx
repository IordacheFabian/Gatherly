import { Box, Grow, Typography } from "@mui/material";
import ActivityCard from "./ActivityCard";
import { useActivities } from "../../../lib/hooks/useActivities";

export default function ActivityList() {
  const { activities, isLoading } = useActivities();

  if (isLoading) return <Typography>Loading...</Typography>;

  if(!activities) return <Typography>No activities available.</Typography>;
  return (
    <Grow in appear timeout={400}>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </Box>
    </Grow>
  );
}
