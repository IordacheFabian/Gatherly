import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

export default function ActivityDetailsSidebar() {
  const attendees = [
    {
      id: "1",
      name: "Alice",
      avatar: "/images/user.png",
      following: true,
      isHost: false,
    },
    {
      id: "2",
      name: "Bob",
      avatar: "/images/user.png",
      following: false,
      isHost: true,
    },
  ];

  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
      <Box
        sx={{
          p: 2,
          background:
            "linear-gradient(90deg, rgba(123,97,255,0.12), rgba(41,182,246,0.08))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {attendees.length} people going
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            See who&apos;s attending and connect
          </Typography>
        </Box>
        <Button
          size="small"
          sx={{
            background: "linear-gradient(90deg,#7b61ff,#29b6f6)",
            color: "#fff",
            textTransform: "none",
            borderRadius: 2,
            px: 2,
          }}
        >
          Join
        </Button>
      </Box>

      <CardContent>
        <Stack spacing={2}>
          {attendees.map((a) => (
            <Box
              key={a.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  src={a.avatar}
                  alt={a.name}
                  sx={{ width: 48, height: 48, borderRadius: 1 }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {a.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {a.isHost ? "Host" : a.following ? "Following" : ""}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {a.isHost && (
                  <Chip
                    label="Host"
                    color="warning"
                    size="small"
                    sx={{ borderRadius: 1 }}
                  />
                )}
                {a.following ? (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: "none" }}
                  >
                    Following
                  </Button>
                ) : (
                  <Button size="small" sx={{ textTransform: "none" }}>
                    Follow
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
