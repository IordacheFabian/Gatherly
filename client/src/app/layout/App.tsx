import { Box, Container, CssBaseline } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import NavBar from "./NavBar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<
    Activity | undefined
  >(undefined);

  useEffect(() => {
    axios
      .get<Activity[]>("https://localhost:5001/api/activities")
      .then((response) => setActivities(response.data));

    return () => {};
  }, []);

  const handleSelectAcitivity = (id: string) => {
    setSelectedActivity(activities.find((x) => x.id === id));
  };

  const handleCancelSelectActivity = () => {
    setSelectedActivity(undefined);
  };

  return (
    <Box sx={{ bgcolor: "#eeeeee" }}>
      <CssBaseline />
      <NavBar />
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <ActivityDashboard
          activities={activities}
          selectActivity={handleSelectAcitivity}
          cancelSelectActivity={handleCancelSelectActivity}
          selectedActivity={selectedActivity}
        />
      </Container>
    </Box>
  );
}

export default App;
