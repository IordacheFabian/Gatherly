import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/error-utils";

type Mode = "login" | "register";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ displayName, email, password });
      }
      const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setError(getErrorMessage(e, "Authentication failed"));
    } finally {
      setSubmitting(false);
    }
  };

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
            <label className="text-sm font-medium mb-2 block">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-muted/30 border-glass-border"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={submitting}
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
