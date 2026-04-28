namespace Application.Email.DTOs;

/// <summary>
/// Base model for email template data
/// </summary>
public class EmailTemplateData
{
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientEmail { get; set; } = string.Empty;
    public string StatusBadge { get; set; } = string.Empty;
    public string StatusBadgeColor { get; set; } = "#007bff"; // Default blue
}

/// <summary>
/// Activity booking-related email data
/// </summary>
public class ActivityEmailData : EmailTemplateData
{
    public string ActivityId { get; set; } = string.Empty;
    public string ActivityTitle { get; set; } = string.Empty;
    public DateTime ActivityDate { get; set; }
    public string ActivityLocation { get; set; } = string.Empty; // City, Venue
    public decimal? Price { get; set; }
    public string Currency { get; set; } = "USD";
    public string? HostName { get; set; }
    public string? Message { get; set; }
    public string? SecondaryMessage { get; set; }
}

/// <summary>
/// Payment-related email data
/// </summary>
public class PaymentEmailData : ActivityEmailData
{
    public string PaymentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? CheckoutUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Generic email data for simple emails
/// </summary>
public class GenericEmailData : EmailTemplateData
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? SecondaryMessage { get; set; }
}
