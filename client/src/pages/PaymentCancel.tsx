import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { paymentsApi } from "@/lib/api/payments.api";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const activityId = searchParams.get("activityId");

  useEffect(() => {
    if (activityId) {
      paymentsApi.cancelPending(activityId);
    }
  }, [activityId]);

  return (
    <PageTransition>
      <div className="pt-24 pb-20 container mx-auto px-6 max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-9 h-9 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Payment cancelled</h1>
          <p className="text-muted-foreground mb-8">
            Your payment was cancelled. No charge was made. You can try again whenever you are ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {activityId && (
              <Button asChild className="gradient-primary text-primary-foreground border-0">
                <Link to={`/activity/${activityId}`}>Back to activity</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/">Browse activities</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default PaymentCancel;
