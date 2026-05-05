import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api";
import { toast } from "@/components/ui/sonner";

export const paymentQueryKeys = {
  history: (limit: number) => ["payments", "history", limit] as const,
  receipt: (paymentId: string | null) => ["payments", "receipt", paymentId] as const,
};

export function usePaymentHistory(limit = 100) {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: paymentQueryKeys.history(limit),
    queryFn: () => paymentsApi.history(limit),
  });

  const receiptQuery = useQuery({
    queryKey: paymentQueryKeys.receipt(selectedPaymentId),
    queryFn: () => paymentsApi.receipt(selectedPaymentId!),
    enabled: Boolean(selectedPaymentId),
  });

  const totals = useMemo(() => {
    const rows = historyQuery.data ?? [];
    const paid = rows
      .filter((x) => x.status === "Succeeded")
      .reduce((acc, item) => acc + item.amount, 0);
    const refunded = rows
      .filter((x) => x.status === "Refunded")
      .reduce((acc, item) => acc + item.amount, 0);
    return { paid, refunded };
  }, [historyQuery.data]);

  const downloadReceiptPdf = async (paymentId: string) => {
    try {
      setDownloadingId(paymentId);
      const { blob, fileName } = await paymentsApi.downloadReceiptPdf(paymentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download receipt");
    } finally {
      setDownloadingId(null);
    }
  };

  return {
    historyQuery,
    receiptQuery,
    rows: historyQuery.data ?? [],
    totals,
    selectedPaymentId,
    setSelectedPaymentId,
    downloadingId,
    downloadReceiptPdf,
  };
}
