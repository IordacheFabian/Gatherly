import { Person } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import { Link } from "react-router";

type Props = {
  profile: Profile;
};

export default function ProfileCard({ profile }: Props) {
  const following = false;

  return (
    <Link to={`/profiles/${profile.id}`} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          borderRadius: 10,
          p: 3,
          maxWidth: 300,
          textDecoration: "none",
          // borderRadius: 5,
          overflow: "visible",
          position: "relative",
          // overflow: "hidden",
          // borderRadius: 10,
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
          border: "3px solid rgba(255,255,255,0.14)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
          backdropFilter: "blur(6px) saturate(120%)",
          WebkitBackdropFilter: "blur(6px) saturate(120%)",
        }}
        elevation={4}
      >
        <CardMedia
          component="img"
          src={profile?.imageUrl || "/image/user.png"}
          sx={{ width: '100%', zIndex: 50, borderRadius: 8, mt: 1.5 }}
          alt={profile.displayName + " image"}
        />
        <CardContent>
          <Box display="flex" flexDirection='column' gap={1}>
            <Typography variant="h5">{profile.displayName}</Typography>
            {profile.bio && (
              <Typography
                variant="body2"
                sx={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap"
                }}
              >
                {profile.bio}
              </Typography>
            )}

            {following && (
              <Chip
                size="small"
                label="Following"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
            mb: 1.5
          }}
        >
          <Person />
          <Typography sx={{ ml: 1 }}> 2000 Followers</Typography>
        </Box>
      </Card>
    </Link>
  );
}
