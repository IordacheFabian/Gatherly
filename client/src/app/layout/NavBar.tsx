import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import AddIcon from "@mui/icons-material/Add";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { NavLink } from "react-router";
import { useAccount } from "../../lib/hooks/useAccount";
import UserMenu from "./UserMenu";

const pages = [
  {
    label: "Activities",
    icon: <HomeIcon fontSize="small" />,
    component: NavLink,
    to: "/activities",
  },
  { label: "About", icon: <InfoIcon fontSize="small" /> },
  { label: "Contact", icon: <ContactMailIcon fontSize="small" /> },
];

export default function NavBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { currentUser } = useAccount();


  return (
    <>
      <AppBar
        position="sticky"
        elevation={3}
        sx={{
          overflow: "hidden",

          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 0.9,
          minWidth: 96,
          color: "white",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
          backdropFilter: "blur(6px) saturate(120%)",
          WebkitBackdropFilter: "blur(6px) saturate(120%)",

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
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 5 }}>
              <Box
                component="img"
                src="/images/logo/eventure-logo.png"
                alt="Eventure Logo"
                sx={{
                  height: 32,
                  ml: 1,
                  display: "inline-block",
                  color: "white",
                }}
              />
              <Typography
                variant="h5"
                fontWeight="700"
                component={NavLink}
                to="/"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                Eventure
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                <Button
                  color="inherit"
                  sx={{
                    textTransform: "none",
                    "&:hover": {
                      transform: "translateY(-5px) scale(1.02)",
                      boxShadow: "0 18px 40px rgba(41,182,246,0.14)",
                      color: "white",
                      // subtle translucent base so backdropFilter works through
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: 10,
                      // boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
                      backdropFilter: "blur(6px) saturate(120%)",
                      WebkitBackdropFilter: "blur(6px) saturate(120%)",
                      "&::before": {
                        transform: "rotate(10deg) translateX(1%)",
                      },
                    },
                    "&:active": {
                      transform: "translateY(-1px) scale(0.995)",
                      boxShadow: "0 8px 20px rgba(11,14,46,0.08)",
                    },
                  }}
                  startIcon={<HomeIcon fontSize="small" />}
                  component={NavLink}
                  to="/activities"
                >
                  Activities
                </Button>

                <Button
                  color="inherit"
                  sx={{
                    textTransform: "none",
                    "&:hover": {
                      transform: "translateY(-5px) scale(1.02)",
                      boxShadow: "0 18px 40px rgba(41,182,246,0.14)",
                      color: "white",
                      // subtle translucent base so backdropFilter works through
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: 10,
                      // boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
                      backdropFilter: "blur(6px) saturate(120%)",
                      WebkitBackdropFilter: "blur(6px) saturate(120%)",
                      "&::before": {
                        transform: "rotate(10deg) translateX(1%)",
                      },
                    },
                    "&:active": {
                      transform: "translateY(-1px) scale(0.995)",
                      boxShadow: "0 8px 20px rgba(11,14,46,0.08)",
                    },
                  }}
                  startIcon={<InfoIcon fontSize="small" />}
                >
                  About
                </Button>
                <Button
                  color="inherit"
                  sx={{
                    textTransform: "none",

                    "&:hover": {
                      transform: "translateY(-5px) scale(1.02)",
                      boxShadow: "0 18px 40px rgba(41,182,246,0.14)",
                      color: "white",
                      // subtle translucent base so backdropFilter works through
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: 10,
                      // boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
                      backdropFilter: "blur(6px) saturate(120%)",
                      WebkitBackdropFilter: "blur(6px) saturate(120%)",
                      "&::before": {
                        transform: "rotate(10deg) translateX(1%)",
                      },
                    },
                    "&:active": {
                      transform: "translateY(-1px) scale(0.995)",
                      boxShadow: "0 8px 20px rgba(11,14,46,0.08)",
                    },
                  }}
                  startIcon={<ContactMailIcon fontSize="small" />}
                >
                  Contact
                </Button>
                <Button
                  color="inherit"
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.95)",
                  }}
                  component={NavLink}
                  to="/errors"
                >
                  Errors
                </Button>
              </Box>
            )}

            {/* desktop search (hidden on tablet and below) */}
            {!isTablet && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: 2,
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "rgba(255,255,255,0.06)",
                    px: 1,
                    py: 0.35,
                    borderRadius: 3,
                    width: 360,
                    maxWidth: "50%",
                  }}
                >
                  <SearchIcon
                    sx={{ color: "rgba(255, 255, 255, 0.76)", mr: 1 }}
                  />
                  <InputBase
                    placeholder="Search activities…"
                    sx={{ color: "inherit", width: "100%" }}
                  />
                </Box>
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!isMobile && currentUser && <UserMenu />}

              {!isMobile && !currentUser && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}

                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 700,

                    // color: "#1b1a1aff",
                    color: "white",
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
                  component={NavLink}
                  to="/login"
                >
                  Sign In
                </Button>
              )}

              {isMobile && (
                <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

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
          </List>
        </Box>
      </Drawer>
    </>
  );
}
