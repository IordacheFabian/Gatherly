using Domain;

namespace Application.Payments.DTOs;

public class PaymentReceiptDto
{
    public required string PaymentId { get; set; }
    public required string InvoiceNumber { get; set; }
    public required string ReceiptNumber { get; set; }
    public required string CheckoutSessionId { get; set; }
    public required string Provider { get; set; }
    public required string ActivityId { get; set; }
    public required string ActivityTitle { get; set; }
    public DateTime ActivityDate { get; set; }
    public required string Venue { get; set; }
    public required string City { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public PaymentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? RefundedAt { get; set; }
}