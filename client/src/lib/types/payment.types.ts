export type PaymentStatus = "Pending" | "Succeeded" | "Refunded" | "Failed";

export interface CheckoutSession {
  paymentId: string;
  checkoutSessionId: string;
  checkoutUrl: string;
  status: string;
}

export interface PaymentHistoryItem {
  id: string;
  activityId: string;
  activityTitle: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string | null;
  refundedAt?: string | null;
  invoiceNumber: string;
  receiptNumber: string;
}

export interface PaymentReceipt {
  paymentId: string;
  invoiceNumber: string;
  receiptNumber: string;
  checkoutSessionId: string;
  provider: string;
  activityId: string;
  activityTitle: string;
  activityDate: string;
  venue: string;
  city: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string | null;
  refundedAt?: string | null;
}
