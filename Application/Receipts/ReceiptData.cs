namespace Application.Receipts;

public enum ReceiptKind
{
    Payment,
    Booking
}

public class ReceiptData
{
    public ReceiptKind Kind { get; set; } = ReceiptKind.Payment;

    // Identifiers
    public string ReceiptNumber { get; set; } = string.Empty;
    public string? InvoiceNumber { get; set; }
    public string? CheckoutSessionId { get; set; }
    public string? Provider { get; set; }

    // Recipient
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientEmail { get; set; } = string.Empty;

    // Activity
    public string ActivityId { get; set; } = string.Empty;
    public string ActivityTitle { get; set; } = string.Empty;
    public DateTime ActivityDate { get; set; }
    public string? Venue { get; set; }
    public string? City { get; set; }
    public string? HostName { get; set; }
    public string? Category { get; set; }

    // Money
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";

    // Status
    public string StatusLabel { get; set; } = "Confirmed";
    public string StatusColorHex { get; set; } = "#10b981"; // green

    // Dates
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public DateTime? RefundedAt { get; set; }

    // Branding
    public string AppName { get; set; } = "Gatherly";
    public string AppTagline { get; set; } = "Discover. Connect. Activate.";
    public string SupportEmail { get; set; } = "support@gatherly.app";
}
