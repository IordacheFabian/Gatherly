import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { paymentsApi } from "@/lib/api";

const Payments = () => {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ["payments", "history"],
    queryFn: () => paymentsApi.history(100),
  });

  const receiptQuery = useQuery({
    queryKey: ["payments", "receipt", selectedPaymentId],
    queryFn: () => paymentsApi.receipt(selectedPaymentId!),
    enabled: Boolean(selectedPaymentId),
  });

  const rows = historyQuery.data ?? [];

  const totals = useMemo(() => {
    const paid = rows.filter((x) => x.status === "Succeeded").reduce((acc, item) => acc + item.amount, 0);
    const refunded = rows.filter((x) => x.status === "Refunded").reduce((acc, item) => acc + item.amount, 0);
    return { paid, refunded };
  }, [rows]);

  return (
    <PageTransition>
      <div className="pt-24 pb-20 container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text">Payment History</h1>
          <p className="text-muted-foreground mt-2">Invoices, receipts, and refund statuses for your bookings.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="glass rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Successful payments</p>
            <p className="text-2xl font-display font-bold mt-2">{totals.paid.toFixed(2)}</p>
          </div>
          <div className="glass rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Refunded total</p>
            <p className="text-2xl font-display font-bold mt-2">{totals.refunded.toFixed(2)}</p>
          </div>
          <div className="glass rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Entries</p>
            <p className="text-2xl font-display font-bold mt-2">{rows.length}</p>
          </div>
        </div>

        <div className="glass rounded-xl p-4 overflow-auto mb-6">
          {historyQuery.isLoading ? (
            <p className="text-sm text-muted-foreground py-3">Loading payments...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">No payments yet.</p>
          ) : (
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-glass-border">
                  <th className="py-2">Activity</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Invoice</th>
                  <th className="py-2">Receipt</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-b border-glass-border/60">
                    <td className="py-3 pr-3">
                      <Link to={`/activity/${item.activityId}`} className="hover:text-primary">
                        {item.activityTitle}
                      </Link>
                    </td>
                    <td className="py-3">{item.amount.toFixed(2)} {item.currency}</td>
                    <td className="py-3">{item.status}</td>
                    <td className="py-3">{item.invoiceNumber}</td>
                    <td className="py-3">{item.receiptNumber}</td>
                    <td className="py-3">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPaymentId(item.id)}
                      >
                        View receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {receiptQuery.data && (
          <div className="glass rounded-xl p-6 space-y-2">
            <h2 className="font-display font-semibold text-lg">Receipt Detail</h2>
            <p>Activity: {receiptQuery.data.activityTitle}</p>
            <p>When: {new Date(receiptQuery.data.activityDate).toLocaleString()}</p>
            <p>Location: {receiptQuery.data.venue}, {receiptQuery.data.city}</p>
            <p>Invoice: {receiptQuery.data.invoiceNumber}</p>
            <p>Receipt: {receiptQuery.data.receiptNumber}</p>
            <p>Session: {receiptQuery.data.checkoutSessionId}</p>
            <p>Status: {receiptQuery.data.status}</p>
            <p>Amount: {receiptQuery.data.amount.toFixed(2)} {receiptQuery.data.currency}</p>
            <p>Paid at: {receiptQuery.data.paidAt ? new Date(receiptQuery.data.paidAt).toLocaleString() : "-"}</p>
            <p>Refunded at: {receiptQuery.data.refundedAt ? new Date(receiptQuery.data.refundedAt).toLocaleString() : "-"}</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Payments;
