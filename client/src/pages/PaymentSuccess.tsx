import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [ready, setReady] = useState(false);

  // Give the webhook a moment to process before showing the page
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageTransition>
      <div className="pt-24 pb-20 container mx-auto px-6 max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-2xl"
        >
          {!ready ? (
            <>
              <Loader2 className="w-14 h-14 mx-auto mb-5 text-primary animate-spin" />
              <h1 className="text-2xl font-display font-bold mb-2">Confirming your payment…</h1>
              <p className="text-muted-foreground">Please wait a moment.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-9 h-9 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2 text-emerald-600 dark:text-emerald-400">
                Payment successful!
              </h1>
              <p className="text-muted-foreground mb-2">
                Your booking is confirmed. Check your email for the receipt.
              </p>
              {sessionId && (
                <p className="text-xs text-muted-foreground mb-6 font-mono">
                  Session: {sessionId.slice(0, 24)}…
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="gradient-primary text-primary-foreground border-0">
                  <Link to="/payments">View receipt</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Browse activities</Link>
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default PaymentSuccess;
