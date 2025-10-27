import { Box, Container, CssBaseline } from "@mui/material";
import { Outlet, useLocation } from "react-router";
import HomePage from "../../features/home/HomePage";
import NavBar from "./NavBar";
import BubbleBackdrop from "../../components/BubbleBackdrop";

function App() {
  const location = useLocation();

  return (
    <Box
      sx={{
        // backgroundImage: `linear-gradient(rgba(8,10,18,0.46), rgba(8,10,18,0.22)), url('/images/bg-gradient2.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        background: 'linear-gradient(135deg, #1d1a27 0%, #683a54ff 50%, #8e3e3eff 100%)'
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
              <BubbleBackdrop />
            </Box>
      <CssBaseline />
      {location.pathname === "/" ? (
        <HomePage />
      ) : (
        <>
          <NavBar />
          <Container maxWidth="xl" sx={{ mt: 3 }}>
            <Outlet />
          </Container>
        </>
      )}
    </Box>
  );
}

export default App;
