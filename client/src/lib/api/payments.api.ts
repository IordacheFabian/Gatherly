import type { PaymentHistoryItem, PaymentReceipt } from "@/lib/types";
import { downloadFile, request } from "./base";

export const paymentsApi = {
  history: (limit = 50) =>
    request<PaymentHistoryItem[]>(`/api/payments/history?limit=${limit}`),
  receipt: (paymentId: string) =>
    request<PaymentReceipt>(`/api/payments/${paymentId}/receipt`),
  downloadReceiptPdf: (paymentId: string) =>
    downloadFile(`/api/payments/${paymentId}/receipt/pdf`, `receipt-${paymentId}.pdf`),
};
