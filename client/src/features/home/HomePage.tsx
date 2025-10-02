import { Group } from "@mui/icons-material";
import {
  Box,
  Button,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link } from "react-router";
import BubbleBackdrop from "../../components/BubbleBackdrop"; // <- new import

export default function HomePage() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      sx={{
        position: "relative",
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        overflow: "hidden",
        backgroundImage:
          "linear-gradient(90deg, rgba(123,97,255,0.95) 0%, rgba(41,182,246,0.92) 70%)",
        // entry animation for the whole page
        "@keyframes fadeInUp": {
          "0%": { opacity: 0, transform: "translateY(18px) scale(0.995)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
      }}
    >
      {/* decorative floating bubbles */}
      <BubbleBackdrop />

      {/* content */}
      <Box
        sx={{
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          px: 3,
          transformOrigin: "center",
          animation: "fadeInUp 520ms ease both",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            bgcolor: "rgba(255,255,255,0.06)",
            px: 3,
            py: 2,
            borderRadius: 3,
            boxShadow: "0 8px 30px rgba(11,14,46,0.12)",
            backdropFilter: "blur(6px) saturate(120%)",
          }}
        >
          <Box
            sx={{
              width: isSmall ? 72 : 110,
              height: isSmall ? 72 : 110,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.06)",
              boxShadow:
                "inset 0 -6px 18px rgba(0,0,0,0.12), 0 6px 18px rgba(123,97,255,0.08)",
            }}
          >
            <Group
              sx={{
                width: isSmall ? 52 : 80,
                height: isSmall ? 52 : 100,
                color: "#fff",
              }}
            />
          </Box>

          <Box sx={{ textAlign: "left" }}>
            <Typography
              variant={isSmall ? "h4" : "h2"}
              sx={{
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: 0.2,
                textShadow: "0 8px 30px rgba(11,14,46,0.18)",
              }}
            >
              Reactivities
            </Typography>
            <Typography
              variant={isSmall ? "subtitle1" : "h6"}
              sx={{ opacity: 0.95 }}
            >
              Find events, meet people, and share great experiences.
            </Typography>
          </Box>
        </Box>

        <Typography
          variant={isSmall ? "h5" : "h3"}
          sx={{
            fontWeight: 700,
            mt: 1,
            letterSpacing: 0.3,
            textAlign: "center",
            maxWidth: 800,
            textShadow: "0 8px 30px rgba(11,14,46,0.14)",
          }}
        >
          Welcome — discover curated activities near you with a modern,
          delightful UI.
        </Typography>

        <Button
          component={Link}
          to="/activities"
          size="large"
          variant="contained"
          sx={{
            height: isSmall ? 64 : 84,
            borderRadius: 6,
            fontSize: isSmall ? "1.05rem" : "1.25rem",
            px: 5,
            mt: 1.5,
            textTransform: "none",
            background: "linear-gradient(45deg, #7b61ff, #29b6f6)",
            boxShadow: "0 12px 40px rgba(41,182,246,0.14)",
            transition: "transform 200ms ease, box-shadow 200ms ease",
            "&:hover": {
              transform: "translateY(-6px) scale(1.02)",
              boxShadow: "0 18px 60px rgba(41,182,246,0.18)",
            },
            "&:active": { transform: "translateY(-2px) scale(0.997)" },
          }}
        >
          Take me to the activities
        </Button>
      </Box>
    </Paper>
  );
}
