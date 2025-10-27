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
  Grow,
} from "@mui/material";
import { LockOpen } from "@mui/icons-material";

import { loginSchema, type LoginSchema } from "../../lib/schemas/loginSchema";
import { useAccount } from "../../lib/hooks/useAccount";
// import BubbleBackdrop from "../../components/BubbleBackdrop";
import TextInput from "../../app/shared/components/TextInput";
import BubbleBackdrop from "../../components/BubbleBackdrop";

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

      await loginUser.mutateAsync(data);
      navigate((location).state?.from || "/activities");
      console.log("Login successful");
    
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
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        background: 'linear-gradient(135deg, #1d1a27 0%, #683a54ff 50%, #8e3e3eff 100%)'   

      }}
    >
      {/* <BubbleBackdrop />  */}
      {/* { full-bleed backdrop container so it truly spans the viewport } */}
      <Box sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <BubbleBackdrop />
      </Box>
          <Grow in appear timeout={400}>
      
      <Paper
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        elevation={10}
        // sx={{
          // position: "relative",
          // zIndex: 2,
          // width: isSmall ? "94%" : 540,
          // borderRadius: 3,
          // px: { xs: 3, sm: 6 },
          // py: { xs: 4, sm: 6 },
          // display: "flex",
          // flexDirection: "column",
          // gap: 2.5,
          // alignItems: "center",

        //   // frosted glass
        //   background:
        //     "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.56))",
        //   backdropFilter: "blur(8px) saturate(120%)",
        //   border: "1px solid rgba(255,255,255,0.12)",
        //   boxShadow: "0 18px 50px rgba(11,14,46,0.16)",
        // }}

        sx={{

          position: "relative",
          zIndex: 2,
          width: isSmall ? "94%" : 540,
          borderRadius: 11,
          px: { xs: 3, sm: 6 },
          py: { xs: 4, sm: 6 },
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          alignItems: "center",
              overflow: "hidden",
              textTransform: "none",
              fontWeight: 700,
              minWidth: 96,
              color: "#1b1a1aff",
              // subtle translucent base so backdropFilter works through
              background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
              backdropFilter: "blur(6px) saturate(120%)",
              WebkitBackdropFilter: "blur(6px) saturate(120%)",

              // moving sheen + subtle color wash via pseudo elements
              "&::before": {
                content: '""',
                position: "absolute",
                left: "-100%",
                top: "-100%",
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
        
        <Avatar
          sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 20,
              textTransform: "none",
              fontWeight: 700,
              width: 64,
              height: 64,
              // px: 3,
              // py: 0.9,
              // minWidth: 96,
              // color: "#1b1a1aff",
              color: "white",
              // subtle translucent base so backdropFilter works through
              background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
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
          <LockOpen />
        </Avatar>

        <Typography variant="h5" sx={{ fontWeight: 800, color: "white" }}>
          Sign in
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", maxWidth: 420 , color: "white"}}
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
          // sx={{
          //   mt: 0.5,
          //   height: 52,
          //   borderRadius: 3,
          //   background: "linear-gradient(90deg, #7b61ff 0%, #29b6f6 100%)",
          //   textTransform: "none",
          //   fontWeight: 700,
          // }}

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
              background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
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
                boxShadow: "0 8px 20px rgba(11,14,46,0.08)",position: "relative",
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
              background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
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
              style={{ textDecoration: "none", color: "white", }}
            >
              Forgot password?
            </Link>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <Link
              to="/register"
              style={{ textDecoration: "none", color: "white", }}
            >
              Create account
            </Link>
          </Typography>
        </Box>
      </Paper>
      </Grow>
    </Box>
  );
}
