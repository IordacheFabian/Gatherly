import { useEffect } from "react";
import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";
import { Box, Card, CardContent, TextField, Button, Stack } from "@mui/material";
import { editProfileSchema, type EditProfileSchema } from "../../lib/schemas/editProfileSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ProfileEdit() {
  const { id } = useParams();
  const { profile, editProfile } = useProfile(id);

  const { control, handleSubmit, reset } = useForm<EditProfileSchema>({
    mode: "onTouched",
    resolver: zodResolver(editProfileSchema),
    defaultValues: { displayName: "", bio: "" },
  });

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName ?? "",
        bio: profile.bio ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: EditProfileSchema) => {
    editProfile.mutate(data); 
    window.location.reload(); 
  };

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
        color: "#fff",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
        backdropFilter: "blur(6px) saturate(120%)",
        WebkitBackdropFilter: "blur(6px) saturate(120%)",
      }}
    >
      <CardContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <Controller
            name="displayName"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Name"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{ width: "25%" }}
              />
            )}
          />

          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Bio" multiline rows={5}/>
            )}
          />

          <Stack direction="row" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 10,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 0.9,
                minWidth: 96,
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
            >
              Save
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}