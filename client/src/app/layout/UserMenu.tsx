import * as React from "react";
import { useState } from "react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  Button,
  useTheme,
} from "@mui/material";
import { Link } from "react-router";
import { Add, Logout, Person, ChevronRight } from "@mui/icons-material";
import { useAccount } from "../../lib/hooks/useAccount";

export default function UserMenu() {
  const theme = useTheme();
  const { currentUser, logoutUser } = useAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await logoutUser.mutateAsync();
    } finally {
      handleClose();
    }
  };

  const initials = (name?: string) =>
    name ? name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "U";

  return (
    <>
      <Tooltip title={currentUser ? currentUser.displayName : "Account"}>
        <IconButton
          onClick={handleOpen}
          size="large"
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          sx={{
            ml: 1,
            p: 0.5,
            borderRadius: 2,
            bgcolor: "transparent",
            transition: "transform 160ms ease, box-shadow 160ms ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: `0 8px 20px ${
                theme.palette.mode === "light"
                  ? "rgba(123,97,255,0.12)"
                  : "rgba(0,0,0,0.6)"
              }`,
            },
          }}
        >
          <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
            {currentUser?.imageUrl ? (
              <img
                src={currentUser.imageUrl}
                alt={currentUser.displayName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 999,
                }}
              />
            ) : (
              initials(currentUser?.displayName)
            )}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 220,
            borderRadius: 2,
            overflow: "hidden",
            backdropFilter: "blur(6px) saturate(120%)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            display: "flex",
            gap: 1.5,
            alignItems: "center",
          }}
        >
          <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main" }}>
            {currentUser?.imageUrl ? (
              <img
                src={currentUser.imageUrl}
                alt={currentUser.displayName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 999,
                }}
              />
            ) : (
              initials(currentUser?.displayName)
            )}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700 }}>
              {currentUser?.displayName ?? "Guest"}
            </Typography>
            <Typography
              noWrap
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", maxWidth: "18rem" }}
            >
              {currentUser?.email ?? "Not signed in"}
            </Typography>
          </Box>
          <ChevronRight color="action" />
        </Box>

        <Divider />

        <MenuItem component={Link} to="/createActivity" sx={{ gap: 1.25 }}>
          <ListItemIcon>
            <Add fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create activity</ListItemText>
        </MenuItem>

        <MenuItem component={Link} to="/profile" sx={{ gap: 1.25 }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>My profile</ListItemText>
        </MenuItem>

        <Divider />

        <Box sx={{ px: 1.25, py: 0.75 }}>
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={handleLogout}
            startIcon={<Logout />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              ":hover": {
                background:
                  "linear-gradient(90deg, rgba(123,97,255,0.95) 0%, rgba(41,182,246,0.92) 70%)",
                backdropFilter: "saturate(120%) blur(6px)",
                // give the inner container a subtle rounded bottom to echo card corners
                "& .MuiContainer-root": {
                  borderRadius: "0 0 12px 12px",
                  overflow: "visible",
                },
                color: "#fff",
                borderColor: "transparent",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </>
  );
}
