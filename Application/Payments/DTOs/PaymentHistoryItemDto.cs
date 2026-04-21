using Domain;

namespace Application.Payments.DTOs;

public class PaymentHistoryItemDto
{
    public required string Id { get; set; }
    public required string ActivityId { get; set; }
    public required string ActivityTitle { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public PaymentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? RefundedAt { get; set; }
    public required string InvoiceNumber { get; set; }
    public required string ReceiptNumber { get; set; }
}