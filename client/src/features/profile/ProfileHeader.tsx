import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

type Props = {
  profile: Profile;
};

export default function ProfileHeader({ profile }: Props) {
  const isFollowing = true;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        borderRadius: 999,
        overflow: "hidden",
        position: "relative",
        // overflow: "hidden",
        // borderRadius: 10,
        textTransform: "none",
        fontWeight: 700,
        px: 1,
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
      }}
    >
      <Grid container spacing={2}>
        <Grid size={8}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              src={profile.imageUrl}
              alt={profile.displayName + " image"}
              sx={{
                width: 150,
                height: 150,
              }}
            />
            <Box display="flex" flexDirection={"column"} gap={2}>
              <Typography variant="h4">{profile.displayName}</Typography>
              {isFollowing && (
                <Chip
                  variant="outlined"
                  color="secondary"
                  label="Following"
                  sx={{
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 10,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    py: 0.9,
                    minWidth: 96,
                    color: "#1b1a1aff",
                    // subtle translucent base so backdropFilter works through
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
                    backdropFilter: "blur(6px) saturate(120%)",
                    WebkitBackdropFilter: "blur(6px) saturate(120%)",
                  }}
                />
              )}
            </Box>
          </Stack>
        </Grid>
        <Grid size={4}>
          <Stack spacing={2} alignItems="center">
            <Box display={"flex"} justifyContent={"space-around"} width="100%">
              <Box textAlign="center">
                <Typography variant="h6">Followers</Typography>
                <Typography variant="h6">200</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6">Following</Typography>
                <Typography variant="h6">223</Typography>
              </Box>
            </Box>
            <Divider sx={{ width: "100%" }} />
            <Button
              fullWidth
              variant="outlined"
              color={isFollowing ? "error" : "success"}
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 10,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 0.9,
                // minWidth: 96,
                width: "50%",
                color: "#1b1a1aff",
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
                },
              }}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
