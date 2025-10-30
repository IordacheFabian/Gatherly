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

type Props = {
  activity: Activity;
}

export default function ActivityDetailsSidebar({ activity }: Props) {
  

  return (
    <Card
      sx={{
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
          transition: "transform 560ms cubic-bezier(.2,.9,.2,1), opacity 300ms",
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
      }}
    >
      <Box
        sx={{
          p: 2,
          mt: 2,
          mb: 2,
          background:
            "linear-gradient(90deg, rgba(123,97,255,0.12), rgba(41,182,246,0.08))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 7,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {activity.attendees.length} people going
          </Typography>
          <Typography variant="body2" sx={{ color: "lightgray" }}>
            See who&apos;s attending and connect
          </Typography>
        </Box>
        <Button
          size="small"
          sx={{
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
          Join
        </Button>
      </Box>

      <CardContent>
        <Stack spacing={2}>
          {activity.attendees.map((a) => (
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
                  src={a.imageUrl}
                  alt={a.displayName + " image"}
                  sx={{ width: 48, height: 48, borderRadius: 10 }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {a.displayName}
                  </Typography>
                  <Typography variant="caption" color="lightgray">
                    {activity.isHost  ? "Following" : ""}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {activity.hostId === a.id && (
                  <Chip
                    label="Host"
                    color="warning"
                    size="small"
                    sx={{ borderRadius: 1 }}
                  />
                )}
                
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
