import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MailCheck } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { accountApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-utils";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await accountApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
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
            <p className="text-muted-foreground mb-2">If an account exists for</p>
            <p className="font-semibold text-foreground mb-6">{email}</p>
            <p className="text-sm text-muted-foreground mb-8">
              you'll receive a password reset link shortly. The link expires in 1 hour.
            </p>
            <Button variant="outline" asChild>
              <Link to="/auth">Back to login</Link>
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
          to="/auth"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground mb-8">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-2xl space-y-5"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="text-sm font-medium mb-2 block">Email address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
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
            {submitting ? "Sending…" : "Send Reset Link"}
          </Button>
        </motion.form>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;
