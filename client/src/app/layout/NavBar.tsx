import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import GroupIcon from "@mui/icons-material/Group";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import AddIcon from "@mui/icons-material/Add";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";

const pages = [
  { label: "Activities", icon: <HomeIcon fontSize="small" /> },
  { label: "About", icon: <InfoIcon fontSize="small" /> },
  { label: "Contact", icon: <ContactMailIcon fontSize="small" /> },
];

export default function NavBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const openProfile = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const closeProfile = () => setAnchorEl(null);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={3}
        sx={{
          background:
            "linear-gradient(135deg, rgba(24,42,115,0.95) 0%, rgba(33,138,174,0.95) 69%, rgba(32,167,172,0.95) 89%)",
          backdropFilter: "saturate(140%) blur(6px)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton color="inherit" edge="start" sx={{ mr: 1 }}>
                <GroupIcon fontSize="large" />
              </IconButton>
              <Typography
                variant="h5"
                fontWeight="700"
                component="a"
                href="/"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                Reactivities
              </Typography>
            </Box>

            {/* center nav (hidden on small screens) */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                {pages.map((p) => (
                  <Button
                    key={p.label}
                    color="inherit"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.95)",
                    }}
                    startIcon={p.icon}
                  >
                    {p.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "warning.main",
                  color: "common.white",
                  borderRadius: 3,
                  textTransform: "none",
                  px: 2.2,
                  py: 0.8,
                  boxShadow: "0 6px 18px rgba(33,138,174,0.18)",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 10px 24px rgba(33,138,174,0.22)",
                  },
                }}
              >
                Create activity
              </Button>

              <IconButton onClick={openProfile} sx={{ ml: 1 }}>
                <Avatar sx={{ width: 36, height: 36 }}>U</Avatar>
              </IconButton>

              {isMobile && (
                <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* profile menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeProfile}>
        <MenuItem onClick={closeProfile}>Profile</MenuItem>
        <MenuItem onClick={closeProfile}>Settings</MenuItem>
        <Divider />
        <MenuItem onClick={closeProfile}>Logout</MenuItem>
      </Menu>

      {/* drawer for mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: 260 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
        >
          <List>
            <ListItemButton component="a" href="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>

            {pages.map((p) => (
              <ListItemButton key={p.label}>
                <ListItemIcon>{p.icon}</ListItemIcon>
                <ListItemText primary={p.label} />
              </ListItemButton>
            ))}

            <Divider sx={{ my: 1 }} />

            <ListItemButton>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Create activity" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

// **** OLD CODE ****

// import { Group } from "@mui/icons-material";
// import {
//   AppBar,
//   Box,
//   Button,
//   Container,
//   MenuItem,
//   Toolbar,
//   Typography,
// } from "@mui/material";

// export default function NavBar() {
//   return (
//     <Box sx={{ flexGrow: 1 }}>
//       <AppBar
//         position="static"
//         sx={{
//           backgroundImage:
//             "linear-gradient(135deg, #182a73 0%, #218aae 69%, #20a7ac 89%)",
//         }}
//       >
//         <Container maxWidth="xl">
//           <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Box>
//               <MenuItem sx={{ display: "flex", gap: 2 }}>
//                 <Group fontSize="large" />
//                 <Typography variant="h4" fontWeight="bold">
//                   Reactivities
//                 </Typography>
//               </MenuItem>
//             </Box>
//             <Box sx={{ display: "flex" }}>
//               <MenuItem
//                 sx={{
//                   fontSize: "1.2rem",
//                   textTransform: "uppercase",
//                   fontWeight: "bold",
//                 }}
//               >
//                 Activities
//               </MenuItem>
//               <MenuItem
//                 sx={{
//                   fontSize: "1.2rem",
//                   textTransform: "uppercase",
//                   fontWeight: "bold",
//                 }}
//               >
//                 About
//               </MenuItem>
//               <MenuItem
//                 sx={{
//                   fontSize: "1.2rem",
//                   textTransform: "uppercase",
//                   fontWeight: "bold",
//                 }}
//               >
//                 Contact
//               </MenuItem>
//             </Box>
//             <Button size="large" variant="contained" color="warning">
//               Create activity
//             </Button>
//           </Toolbar>
//         </Container>
//       </AppBar>
//     </Box>
//   );
// }
