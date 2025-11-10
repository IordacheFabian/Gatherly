import { useParams } from "react-router";
import { Box, Button, Divider, ImageList, ImageListItem, Typography } from "@mui/material";
import { useProfile } from "../../lib/hooks/useProfile";
import { useState } from "react";
import PhotoUploadWidget from "../../app/shared/components/PhotoUploadWidget";
import StarButton from "../../app/shared/components/StarButton";
import DeleteButton from "../../app/shared/components/DeleteButton";

export default function ProfilePhotos() {
  const { id } = useParams();
  const { photos, loadingPhotos, isCurrentUser, uploadPhoto, profile, setMainPhoto, deletePhoto } = useProfile(id);
  const [ editMode, setEditMode ] = useState(false);

  const handlePhotoUpload = (file: Blob) => {
    uploadPhoto.mutate(file, {
      onSuccess: () => {
        setEditMode(false);
      }
    })
  }

  if (loadingPhotos) return <Typography>Loading photos...</Typography>;

  if (!photos)
    return <Typography>No photos available</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h5">Photos</Typography>
        {isCurrentUser && (
          <Button
            onClick={() => setEditMode(!editMode)}
            sx={{
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
            {editMode ? "Cancel" : "Add Photo"}
          </Button>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />

      {editMode ? (
        <PhotoUploadWidget
          uploadPhoto={handlePhotoUpload}
          loading={uploadPhoto.isPending}
        />
      ) : (
        <>
          {photos.length === 0 ? (
            <Typography>No photos available.</Typography>
          ) : (
            <ImageList sx={{ height: 450 }} cols={6} rowHeight={164}>
              {photos.map((item) => (
                <ImageListItem key={item.id}>
                  <img
                    srcSet={`${item.url.replace(
                      "/upload/",
                      "/upload/w_164,h_164,c_fill,f_auto,dpr_2,g_face/"
                    )}`}
                    src={`${item.url.replace(
                      "/upload/",
                      "/upload/w_164,h_164,c_fill,f_auto,g_face/"
                    )}`}
                    alt={"user profile image"}
                    loading="lazy"
                    style={{ borderRadius: 13 }}
                  />
                  {isCurrentUser && (
                    <div>
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                        onClick={() => {
                          setMainPhoto.mutate(item);
                        }}
                      >
                        <StarButton selected={item.url === profile?.imageUrl} />
                      </Box>
                      {profile?.imageUrl !== item.url && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                          }}
                          onClick={() => {
                            deletePhoto.mutate(item.id);
                          }}
                        >
                          <DeleteButton />
                        </Box>
                      )}
                    </div>
                  )}
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </>
      )}
    </Box>
  );
}
