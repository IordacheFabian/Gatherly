import { Box, Button, Card } from "@mui/material";

export default function ActivityFiltersMobile() {
  return (
    <Card sx={{ mb: 2, borderRadius: 3, background: "transparent" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          p: 2,
          width: "100%",
          borderRadius: 3,
          background: "transparent",
        }}
      >
        <Button
          variant="contained"
          sx={{
            width: "200px",
            borderRadius: 3,
            background: "linear-gradient(0deg,#7b61ff,#29b6f6)",
          }}
        >
          Filters
        </Button>
        <Button
          sx={{
            width: "200px",
            borderRadius: 3,
            background: "whiteSpace",
          }}
        >
          Sort by
        </Button>
      </Box>
    </Card>
  );
}
