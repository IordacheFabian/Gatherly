import { Box, Paper, Tab, Tabs } from "@mui/material";
import { useState, type SyntheticEvent } from "react"
import ProfilePhotos from "./ProfilePhotos";
import ProfileAbout from "./ProfileAbout";

export default function ProfileContent() {
const [value, setValue] = useState(0);

const handleChange =(_: SyntheticEvent, newValue: number) => {
  setValue(newValue);
}

const tabContent = [
  { label: "About", content: <ProfileAbout /> },
  { label: "Photos", content: <ProfilePhotos /> },
  { label: "Events", content: <div>Events</div> },
  { label: "Followers", content: <div>Followers</div> },
  { label: "Following", content: <div>Following</div> },
];

  return (
    <Box
      component={Paper}
      mt={2}
      p={3}
      elevation={3}
      height={500}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        borderRadius: 10,
        mb: 3,
        position: "relative",
        overflow: "hidden",
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
    >
      <Tabs
        orientation="vertical"
        value={value}
        onChange={handleChange}
        sx={{
          borderRight: 1,
          borderColor: "divider",
          height: 450,
          minWidth: 200,
          my: "4%",
        }}
        textColor="inherit"
        indicatorColor="secondary"
        aria-label="secondary tabs example"
      >
        {tabContent.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            sx={{
              my: 1.5,
              mx: 3,
              position: "relative",
              overflow: "hidden",
              borderRadius: 10,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 0.9,
              minWidth: 96,
              color: "lightgray",

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
          />
        ))}
      </Tabs>
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          // pt: 0,
          my: "3%",
          width: "100%",
          height: "100%",
          overflowY: "auto",
        }}
      >
        {tabContent[value].content}
      </Box>
    </Box>
  );
}