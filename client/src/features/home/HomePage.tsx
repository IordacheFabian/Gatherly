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
import BubbleBackdrop from "../../components/BubbleBackdrop"; 

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
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1d1a27 0%, #683a54ff 50%, #8e3e3eff 100%)",
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
            borderRadius: 999,
            boxShadow: "0 8px 30px rgba(11,14,46,0.12)",
            backdropFilter: "blur(6px) saturate(120%)",
          }}
        >
          <Box
            sx={{
              width: isSmall ? 72 : 110,
              height: isSmall ? 72 : 110,
              borderRadius: 999,
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
                borderRadius: 999
              }}
            />
          </Box>

          <Box sx={{ textAlign: "left"}}>
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
            fontSize: isSmall ? "1.05rem" : "1.25rem",
            px: 5,
            mt: 1.5,
            position: "relative",
            overflow: "hidden",
            borderRadius: 10,
            textTransform: "none",
            fontWeight: 700,
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
          Take me to the activities
        </Button>
      </Box>
    </Paper>
  );
}
