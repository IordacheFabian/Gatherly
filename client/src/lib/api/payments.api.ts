import type { PaymentHistoryItem, PaymentReceipt } from "@/lib/types";
import { apiClient, downloadFile, getApiErrorMessage } from "./client";

export const paymentsApi = {
  history: async (limit = 50): Promise<PaymentHistoryItem[]> => {
    try {
      const { data } = await apiClient.get<PaymentHistoryItem[]>(`/api/payments/history?limit=${limit}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load payment history"));
    }
  },

  receipt: async (paymentId: string): Promise<PaymentReceipt> => {
    try {
      const { data } = await apiClient.get<PaymentReceipt>(`/api/payments/${paymentId}/receipt`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load receipt"));
    }
  },

  downloadReceiptPdf: async (paymentId: string): Promise<{ blob: Blob; fileName: string }> => {
    try {
      return await downloadFile(`/api/payments/${paymentId}/receipt/pdf`, `receipt-${paymentId}.pdf`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to download receipt"));
    }
  },
};
