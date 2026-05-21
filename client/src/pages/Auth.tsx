import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MailCheck } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/error-utils";
import { ApiError } from "@/lib/api";

type Mode = "login" | "register";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (rateLimitSeconds === null || rateLimitSeconds <= 0) return;
    const timer = setInterval(() => {
      setRateLimitSeconds((s) => {
        if (s === null || s <= 1) { clearInterval(timer); return null; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const passwordReset = (location.state as { passwordReset?: boolean } | null)?.passwordReset ?? false;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email, password });
        const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";
        navigate(redirectTo, { replace: true });
      } else {
        await register({ displayName, email, password });
        setRegisteredEmail(email);
        setRegistered(true);
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        const secs = e.retryAfter ?? 900;
        setRateLimitSeconds(secs);
        setError(null);
      } else {
        setError(getErrorMessage(e, "Authentication failed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (registered) {
    return (
      <PageTransition>
        <div className="pt-24 pb-20 container mx-auto px-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-10 rounded-2xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <MailCheck className="w-9 h-9 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Check your inbox!</h1>
            <p className="text-muted-foreground mb-2">
              We've sent a confirmation email to
            </p>
            <p className="font-semibold text-foreground mb-6">{registeredEmail}</p>
            <p className="text-sm text-muted-foreground mb-8">
              Click the link in the email to activate your account. After confirming, you'll be
              able to log in.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setRegistered(false);
                setMode("login");
                setEmail(registeredEmail);
                setPassword("");
              }}
            >
              Go to login
            </Button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="pt-24 pb-20 container mx-auto px-6 max-w-xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to activities
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === "login"
              ? "Log in to attend activities, comment, and manage your profile."
              : "Join the community and start creating activities."}
          </p>

          {passwordReset && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-400">
              Password reset successfully! You can now log in with your new password.
            </div>
          )}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-2xl space-y-5"
          onSubmit={handleSubmit}
        >
          {mode === "register" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Display name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="bg-muted/30 border-glass-border"
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="bg-muted/30 border-glass-border"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Password</label>
              {mode === "login" && (
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              )}
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-muted/30 border-glass-border"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {rateLimitSeconds !== null && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
              Too many attempts. Please try again in{" "}
              <span className="font-semibold tabular-nums">
                {Math.floor(rateLimitSeconds / 60)}:{String(rateLimitSeconds % 60).padStart(2, "0")}
              </span>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || rateLimitSeconds !== null}
            className="w-full gradient-primary text-primary-foreground border-0"
          >
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
          >
            {mode === "login"
              ? "Need an account? Register"
              : "Already have an account? Log in"}
          </Button>
        </motion.form>
      </div>
    </PageTransition>
  );
};

export default Auth;
