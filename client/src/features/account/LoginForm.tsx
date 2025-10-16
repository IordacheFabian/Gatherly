import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router";
import {
  Box,
  Button,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { LockOpen } from "@mui/icons-material";

import { loginSchema, type LoginSchema } from "../../lib/schemas/loginSchema";
import { useAccount } from "../../lib/hooks/useAccount";
// import BubbleBackdrop from "../../components/BubbleBackdrop";
import TextInput from "../../app/shared/components/TextInput";

export default function LoginForm() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAccount();

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
  } = useForm<LoginSchema>({
    mode: "onTouched",
    resolver: zodResolver(loginSchema),
  });

  const loading = loginUser.isPending || isSubmitting;

  const onSubmit = async (data: LoginSchema) => {
    try {
      await loginUser.mutateAsync(data);
      navigate((location).state?.from || "/activities");
    } catch {
      // mutation handles errors / toasts
    }
  };

  return (
    <Box
      sx={{
        position: "fixed", // cover viewport even if parent scrolls
        inset: 0, // top:0; right:0; bottom:0; left:0;
        width: "100%", // use % (avoids 100vw scrollbar issues)
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: theme.palette.mode === "light" ? "#f4f6fb" : "#080812",
        overflow: "hidden",
        px: 2,
        zIndex: 1, // keep form above backdrop
      }}
    >
      {/* full-bleed backdrop container so it truly spans the viewport */}
      {/* <Box sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <BubbleBackdrop />
      </Box> */}

      <Paper
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        elevation={10}
        sx={{
          position: "relative",
          zIndex: 2,
          width: isSmall ? "94%" : 540,
          borderRadius: 3,
          px: { xs: 3, sm: 6 },
          py: { xs: 4, sm: 6 },
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          alignItems: "center",

          // frosted glass
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.56))",
          backdropFilter: "blur(8px) saturate(120%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 18px 50px rgba(11,14,46,0.16)",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 64,
            height: 64,
            mb: 0.5,
            boxShadow: "0 8px 24px rgba(123,97,255,0.16)",
          }}
        >
          <LockOpen />
        </Avatar>

        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Sign in
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", maxWidth: 420 }}
        >
          Welcome back — enter your credentials to continue.
        </Typography>

        <Box sx={{ width: "100%", mt: 1 }}>
          <TextInput control={control} name="email" label="Email" fullWidth />
        </Box>

        <Box sx={{ width: "100%" }}>
          <TextInput
            control={control}
            name="password"
            label="Password"
            type="password"
            fullWidth
          />
        </Box>

        <Button
          type="submit"
          disabled={!isDirty || !isValid || loading}
          variant="contained"
          size="large"
          fullWidth
          sx={{
            mt: 0.5,
            height: 52,
            borderRadius: 3,
            background: "linear-gradient(90deg, #7b61ff 0%, #29b6f6 100%)",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Sign in"}
        </Button>

        <Box
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            mt: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            <Link
              to="/forgot"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Forgot password?
            </Link>
          </Typography>
          <Typography variant="caption" color="text.secondary" >
            <Link
              to="/register"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Create account
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
