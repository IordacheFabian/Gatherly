import { Grid, useMediaQuery, useTheme } from "@mui/material";
import ActivityList from "./ActivityList";
import ActivityFilters from "./ActivityFilters";
import ActivityFiltersMobile from "./ActivityFiltersMobile";

export default function ActivityDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <>
    b
      <Grid container spacing={3}>
        {isMobile && (
          <Grid>
            <ActivityFiltersMobile />
          </Grid>
        )}
        {!isMobile && (
          <Grid size={8}>
            <ActivityList />
          </Grid>
        )}

        {isMobile && (
          <Grid size={12}>
            <ActivityList />
          </Grid>
        )}
        {!isMobile && (
          <Grid size={4}>
            <ActivityFilters />
          </Grid>
        )}

      </Grid>
    </>
  );
}
