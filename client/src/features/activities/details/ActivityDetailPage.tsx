// import { useEffect, useRef } from "react";
import { useParams } from "react-router";
import { useActivities } from "../../../lib/hooks/useActivities";
import { Grid, Typography } from "@mui/material";
import ActivityDetailHeader from "./ActivityDetailHeader";
import ActivityDetailInfo from "./ActivityDetailInfo";
import ActivityDetailChat from "./ActivityDetailChat";
import ActivityDetailSidebar from "./ActivityDetailSidebar";

export default function ActivityDetailPage() {
  const { id } = useParams();
  const { activity, isLoadingActivity } = useActivities(id);

  // const formattedDate = (() => {
  //   if (!activity || !activity.date) return "";
  //   try {
  //     const d = new Date(activity.date);
  //     return isNaN(d.getTime()) ? activity.date : d.toLocaleString();
  //   } catch {
  //     return activity.date;
  //   }
  // })();

  // const { activities } = useActivities();
  // const activity = activities?.find((x) => x.id === selectedActivity.id);

  if (isLoadingActivity) return <Typography>Loading...</Typography>;

  if (!activity) return <Typography>Activity not found</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid size={8}>
        <ActivityDetailHeader activity={activity} />
        <ActivityDetailInfo activity={activity} />
        <ActivityDetailChat />
      </Grid>
      <Grid size={4}>
        <ActivityDetailSidebar activity={activity}/>
      </Grid>
    </Grid>
  );
}
