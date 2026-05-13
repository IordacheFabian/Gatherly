import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { accountApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-utils";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = searchParams.get("userId") ?? "";
  const token = searchParams.get("token") ?? "";

  if (!userId || !token) {
    return (
      <PageTransition>
        <div className="pt-24 pb-20 container mx-auto px-6 max-w-lg text-center">
          <div className="glass p-10 rounded-2xl">
            <h1 className="text-2xl font-display font-bold mb-4 text-destructive">Invalid Link</h1>
            <p className="text-muted-foreground mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Button asChild variant="outline">
              <Link to="/forgot-password">Request a new link</Link>
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await accountApi.resetPassword(userId, token, newPassword);
      navigate("/auth", { state: { passwordReset: true } });
    } catch (err) {
      setError(getErrorMessage(err, "Password reset failed. The link may be expired."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="pt-24 pb-20 container mx-auto px-6 max-w-xl">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">Reset Password</h1>
          <p className="text-muted-foreground mb-8">Enter and confirm your new password below.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-2xl space-y-5"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="text-sm font-medium mb-2 block">New Password</label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-muted/30 border-glass-border pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Retype New Password</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-muted/30 border-glass-border pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full gradient-primary text-primary-foreground border-0"
          >
            {submitting ? "Resetting…" : "Reset Password"}
          </Button>
        </motion.form>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
