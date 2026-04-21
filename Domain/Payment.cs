using System;
using Microsoft.EntityFrameworkCore;

namespace Domain;

[Index(nameof(UserId), nameof(CreatedAt))]
[Index(nameof(ActivityId), nameof(UserId), nameof(Status))]
[Index(nameof(CheckoutSessionId), IsUnique = true)]
public class Payment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ActivityId { get; set; } = null!;
    public Activity Activity { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string Provider { get; set; } = "StripeMock";
    public string CheckoutSessionId { get; set; } = null!;
    public string CheckoutUrl { get; set; } = null!;
    public string InvoiceNumber { get; set; } = null!;
    public string ReceiptNumber { get; set; } = null!;
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public DateTime? RefundedAt { get; set; }
}