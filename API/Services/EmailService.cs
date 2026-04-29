using Application.Interfaces;
using Application.Email;
using Application.Email.DTOs;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace API.Services;

public class EmailService(
    SmtpSettings smtpSettings,
    ILogger<EmailService> logger,
    IConfiguration configuration) : IEmailService
{
    private readonly EmailTemplateBuilder _templateBuilder = new(
        configuration["AppSettings:ClientBaseUrl"] ?? configuration["AppUrl"] ?? "http://localhost:5173");

    public async Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            logger.LogWarning("Email skipped because recipient address is empty.");
            return;
        }

        if (!smtpSettings.Enabled || string.IsNullOrWhiteSpace(smtpSettings.Host) || string.IsNullOrWhiteSpace(smtpSettings.FromEmail))
        {
            logger.LogInformation(
                "Email skipped because SMTP settings are disabled or incomplete. Enabled={Enabled}, HostConfigured={HostConfigured}, FromConfigured={FromConfigured}",
                smtpSettings.Enabled,
                !string.IsNullOrWhiteSpace(smtpSettings.Host),
                !string.IsNullOrWhiteSpace(smtpSettings.FromEmail));
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(smtpSettings.FromName, smtpSettings.FromEmail));
            message.To.Add(new MailboxAddress(toEmail, toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = body };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            
            // Use StartTls for port 587 (standard for Gmail and others)
            var secureSocketOptions = smtpSettings.Port == 465 
                ? SecureSocketOptions.SslOnConnect 
                : SecureSocketOptions.StartTls;
            
            await client.ConnectAsync(smtpSettings.Host, smtpSettings.Port, secureSocketOptions, cancellationToken);

            var smtpUserName = smtpSettings.UserName?.Trim();
            var smtpPassword = smtpSettings.Password?.Trim();

            if (!string.IsNullOrWhiteSpace(smtpSettings.Host) &&
                smtpSettings.Host.Contains("gmail.com", StringComparison.OrdinalIgnoreCase))
            {
                smtpPassword = smtpPassword?.Replace(" ", string.Empty);

                if (!string.IsNullOrWhiteSpace(smtpPassword) && smtpPassword.Length != 16)
                {
                    logger.LogWarning("Configured Gmail app password does not look valid (expected 16 characters after removing spaces).");
                }
            }

            if (!smtpSettings.UseDefaultCredentials && !string.IsNullOrWhiteSpace(smtpUserName) && !string.IsNullOrWhiteSpace(smtpPassword))
            {
                await client.AuthenticateAsync(smtpUserName, smtpPassword, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            logger.LogInformation("Email sent successfully to {ToEmail}", toEmail);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error sending email to {ToEmail}", toEmail);
        }
    }

    public async Task SendBookingRequestEmailAsync(
        string userEmail,
        string userName,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        string? hostName,
        CancellationToken cancellationToken = default)
    {
        var data = new ActivityEmailData
        {
            RecipientName = userName,
            RecipientEmail = userEmail,
            ActivityId = activityId,
            ActivityTitle = activityTitle,
            ActivityDate = activityDate,
            ActivityLocation = location,
            HostName = hostName,
            StatusBadge = "Pending Approval",
            StatusBadgeColor = "#f59e0b",
            Message = "Your booking request has been received! The activity host will review your request and send you a confirmation or rejection soon.",
            SecondaryMessage = "You can view the activity details and track your booking status from your dashboard."
        };

        var htmlBody = _templateBuilder.BuildActivityEmail(
            data,
            "View Activity",
            $"/activities/{activityId}",
            "Back to Activities",
            "/activities");

        await SendEmailAsync(userEmail, "Booking Request Received - Reactivities", htmlBody, cancellationToken);
    }

    public async Task SendBookingApprovedEmailAsync(
        string userEmail,
        string userName,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        string? hostName,
        decimal? price,
        string currency,
        CancellationToken cancellationToken = default)
    {
        var data = new ActivityEmailData
        {
            RecipientName = userName,
            RecipientEmail = userEmail,
            ActivityId = activityId,
            ActivityTitle = activityTitle,
            ActivityDate = activityDate,
            ActivityLocation = location,
            HostName = hostName,
            Price = price,
            Currency = currency,
            StatusBadge = "Approved",
            StatusBadgeColor = "#10b981",
            Message = "Great news! Your booking has been approved. You're all set to join this activity!",
            SecondaryMessage = price.HasValue && price > 0
                ? "Please note: Payment may be required to complete your booking. Check the activity details for more information."
                : "See you at the activity!"
        };

        var htmlBody = _templateBuilder.BuildActivityEmail(
            data,
            "View Activity Details",
            $"/activities/{activityId}",
            "Browse More Activities",
            "/activities");

        await SendEmailAsync(userEmail, "Booking Approved! - Reactivities", htmlBody, cancellationToken);
    }

    public async Task SendActivityJoinedEmailAsync(
        string userEmail,
        string userName,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        string? hostName,
        CancellationToken cancellationToken = default)
    {
        var data = new ActivityEmailData
        {
            RecipientName = userName,
            RecipientEmail = userEmail,
            ActivityId = activityId,
            ActivityTitle = activityTitle,
            ActivityDate = activityDate,
            ActivityLocation = location,
            HostName = hostName,
            StatusBadge = "Joined",
            StatusBadgeColor = "#10b981",
            Message = $"You've successfully joined '{activityTitle}'! We're excited to see you there.",
            SecondaryMessage = "You'll receive a reminder email a few days before the activity date."
        };

        var htmlBody = _templateBuilder.BuildActivityEmail(
            data,
            "View Activity",
            $"/activities/{activityId}",
            "Browse More Activities",
            "/activities");

        await SendEmailAsync(userEmail, "You've Joined an Activity! - Reactivities", htmlBody, cancellationToken);
    }

    public async Task SendPaymentSuccessfulEmailAsync(
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
        CancellationToken cancellationToken = default)
    {
        var data = new PaymentEmailData
        {
            RecipientName = userName,
            RecipientEmail = userEmail,
            PaymentId = paymentId,
            ActivityId = activityId,
            ActivityTitle = activityTitle,
            ActivityDate = activityDate,
            ActivityLocation = location,
            HostName = hostName,
            Amount = amount,
            Currency = currency,
            StatusBadge = "Payment Confirmed",
            StatusBadgeColor = "#10b981",
            Message = "Your payment has been processed successfully. Your booking is confirmed!",
            SecondaryMessage = "A receipt has been sent to this email address. Keep it for your records."
        };

        var htmlBody = _templateBuilder.BuildPaymentEmail(
            data,
            "View Your Activity",
            $"/activities/{activityId}");

        await SendEmailAsync(userEmail, "Payment Successful - Reactivities", htmlBody, cancellationToken);
    }

    public async Task SendPaymentRequiredEmailAsync(
        string userEmail,
        string userName,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        decimal amount,
        string currency,
        string? checkoutUrl,
        CancellationToken cancellationToken = default)
    {
        var paymentUrl = !string.IsNullOrWhiteSpace(checkoutUrl) 
            ? checkoutUrl 
            : $"/payments?activityId={activityId}";

        var data = new ActivityEmailData
        {
            RecipientName = userName,
            RecipientEmail = userEmail,
            ActivityId = activityId,
            ActivityTitle = activityTitle,
            ActivityDate = activityDate,
            ActivityLocation = location,
            Price = amount,
            Currency = currency,
            StatusBadge = "Payment Required",
            StatusBadgeColor = "#f59e0b",
            Message = $"To complete your booking for '{activityTitle}', payment is required.",
            SecondaryMessage = $"Payment amount: {currency} {amount:F2}. Please complete payment to secure your spot."
        };

        var htmlBody = _templateBuilder.BuildActivityEmail(
            data,
            "Pay Now",
            paymentUrl,
            "View Activity",
            $"/activities/{activityId}");

        await SendEmailAsync(userEmail, "Payment Required - Reactivities", htmlBody, cancellationToken);
    }

    public async Task SendBookingRejectedEmailAsync(
        string userEmail,
        string userName,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        CancellationToken cancellationToken = default)
    {
        var data = new ActivityEmailData
        {
            RecipientName = userName,
            RecipientEmail = userEmail,
            ActivityId = activityId,
            ActivityTitle = activityTitle,
            ActivityDate = activityDate,
            ActivityLocation = location,
            StatusBadge = "Rejected",
            StatusBadgeColor = "#ef4444",
            Message = $"Unfortunately, your booking request for '{activityTitle}' has been rejected by the host.",
            SecondaryMessage = "You can browse other activities or contact the host if you have any questions."
        };

        var htmlBody = _templateBuilder.BuildActivityEmail(
            data,
            "Browse Other Activities",
            "/activities",
            "Contact Support",
            "/contact");

        await SendEmailAsync(userEmail, "Booking Request Rejected - Reactivities", htmlBody, cancellationToken);
    }

    public async Task SendBookingCancelledEmailAsync(
        string userEmail,
        string userName,
        string activityId,
        string activityTitle,
        DateTime activityDate,
        string location,
        CancellationToken cancellationToken = default)
    {
        var data = new ActivityEmailData
        {
            RecipientName = userName,
            RecipientEmail = userEmail,
            ActivityId = activityId,
            ActivityTitle = activityTitle,
            ActivityDate = activityDate,
            ActivityLocation = location,
            StatusBadge = "Cancelled",
            StatusBadgeColor = "#ef4444",
            Message = $"Your booking for '{activityTitle}' has been cancelled.",
            SecondaryMessage = "If you have any questions about this cancellation or would like to request a refund, please contact our support team."
        };

        var htmlBody = _templateBuilder.BuildActivityEmail(
            data,
            "Browse Other Activities",
            "/activities",
            "Contact Support",
            "/contact");

        await SendEmailAsync(userEmail, "Booking Cancelled - Reactivities", htmlBody, cancellationToken);
    }
}
