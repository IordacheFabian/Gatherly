namespace Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default);

    // Booking confirmation emails
    Task SendBookingRequestEmailAsync(
        string userEmail,
        string userName,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        string? hostName,
        CancellationToken cancellationToken = default);

    Task SendBookingApprovedEmailAsync(
        string userEmail,
        string userName,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        string? hostName,
        decimal? price,
        string currency,
        CancellationToken cancellationToken = default);

    Task SendActivityJoinedEmailAsync(
        string userEmail,
        string userName,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        string? hostName,
        CancellationToken cancellationToken = default);

    // Payment emails
    Task SendPaymentSuccessfulEmailAsync(
        string userEmail,
        string userName,
        string paymentId,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        string? hostName,
        decimal amount,
        string currency,
        CancellationToken cancellationToken = default);

    Task SendPaymentRequiredEmailAsync(
        string userEmail,
        string userName,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        decimal amount,
        string currency,
        string? checkoutUrl,
        CancellationToken cancellationToken = default);

    // Cancellation email
    Task SendBookingCancelledEmailAsync(
        string userEmail,
        string userName,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        CancellationToken cancellationToken = default);
}
