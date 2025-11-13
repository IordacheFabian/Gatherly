import * as React from "react";
import Popover from "@mui/material/Popover";
import { useState } from "react";
import { Avatar } from "@mui/material";
import { Link } from "react-router";
import ProfileCard from "../../../features/profile/ProfileCard";

type Props = {
    profile: Profile;   
};

export default function AvatarPopover({profile}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Avatar
        alt={profile.displayName + " image"}
        src={profile.imageUrl}
        sx={{
          border: profile.following ? 3 : 0,
          borderColor: "rgba(70, 70, 70, 0.59)",
        }}
        component={Link}
        to={`/profiles/${profile.id}`}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      />
      <Popover
        id="mouse-over-popover"
        sx={{ pointerEvents: "none" }}
        PaperProps={{
          sx: {
            borderRadius: 10,
            overflow: "visible",
            bgcolor: "transparent",
            boxShadow: "none",
          },
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <ProfileCard profile={profile} />
      </Popover>
    </>
  );
}
