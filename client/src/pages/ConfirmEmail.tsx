import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { accountApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-utils";

type Status = "loading" | "success" | "error";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const token = searchParams.get("token");

    if (!userId || !token) {
      setStatus("error");
      setMessage("Invalid confirmation link. Please check your email and try again.");
      return;
    }

    accountApi
      .confirmEmail(userId, token)
      .then(() => {
        setStatus("success");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(
          getErrorMessage(e, "Email confirmation failed. The link may be invalid or expired.")
        );
      });
  }, [searchParams]);

  return (
    <PageTransition>
      <div className="pt-24 pb-20 container mx-auto px-6 max-w-lg flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-2xl w-full text-center"
        >
          {status === "loading" && (
            <>
              <Loader2 className="w-14 h-14 mx-auto mb-5 text-primary animate-spin" />
              <h1 className="text-2xl font-display font-bold mb-2">Confirming your email…</h1>
              <p className="text-muted-foreground">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-9 h-9 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2 text-emerald-600 dark:text-emerald-400">
                Email confirmed!
              </h1>
              <p className="text-muted-foreground mb-8">
                Your account is now active. Welcome to Reactivities — you can log in and start
                exploring activities.
              </p>
              <Button asChild className="gradient-primary text-primary-foreground border-0 gap-2">
                <Link to="/auth">
                  Log in now <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-9 h-9 text-destructive" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2">Confirmation failed</h1>
              <p className="text-muted-foreground mb-8">{message}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/">Back to home</Link>
                </Button>
                <Button asChild className="gradient-primary text-primary-foreground border-0">
                  <Link to="/auth">Go to login</Link>
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ConfirmEmail;
