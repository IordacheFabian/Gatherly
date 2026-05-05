using Application.Interfaces;
using Application.Email;
using Application.Email.DTOs;
using Application.Receipts;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Services;

public record EmailAttachment(string FileName, byte[] Content, string ContentType);

public class EmailService(
    SmtpSettings smtpSettings,
    ILogger<EmailService> logger,
    IConfiguration configuration,
    IReceiptPdfGenerator receiptPdfGenerator,
    AppDbContext dbContext) : IEmailService
{
    private readonly EmailTemplateBuilder _templateBuilder = new(
        configuration["AppSettings:ClientBaseUrl"] ?? configuration["AppUrl"] ?? "http://localhost:5173");

    public Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
        => SendEmailAsync(toEmail, subject, body, attachments: null, cancellationToken);

    public async Task SendEmailAsync(
        string toEmail,
        string subject,
        string body,
        IEnumerable<EmailAttachment>? attachments,
        CancellationToken cancellationToken = default)
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
            if (attachments != null)
            {
                foreach (var att in attachments)
                {
                    if (att?.Content == null || att.Content.Length == 0) continue;
                    bodyBuilder.Attachments.Add(att.FileName, att.Content, ContentType.Parse(att.ContentType));
                }
            }
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

        var attachments = await BuildBookingReceiptAttachmentAsync(
            activityId, userEmail, userName, hostName, price ?? 0m, currency, "Approved", cancellationToken);

        await SendEmailAsync(userEmail, "Booking Approved! - Reactivities", htmlBody, attachments, cancellationToken);
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

        var attachments = await BuildBookingReceiptAttachmentAsync(
            activityId, userEmail, userName, hostName, 0m, "USD", "Confirmed", cancellationToken);

        await SendEmailAsync(userEmail, "You've Joined an Activity! - Reactivities", htmlBody, attachments, cancellationToken);
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
            "View Activity",
            $"/activity/{activityId}",
            "View Payments",
            "/payments");

        var attachments = await BuildPaymentReceiptAttachmentAsync(paymentId, cancellationToken);

        await SendEmailAsync(userEmail, "Payment Successful - Reactivities", htmlBody, attachments, cancellationToken);
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

    // ---------- PDF receipt helpers ----------

    private async Task<IEnumerable<EmailAttachment>?> BuildPaymentReceiptAttachmentAsync(
        string paymentId, CancellationToken cancellationToken)
    {
        try
        {
            var p = await dbContext.Payments
                .Where(x => x.Id == paymentId)
                .Select(x => new
                {
                    x.Id,
                    UserDisplayName = x.User.DisplayName,
                    UserEmail = x.User.Email,
                    x.InvoiceNumber,
                    x.ReceiptNumber,
                    x.CheckoutSessionId,
                    x.Provider,
                    x.ActivityId,
                    ActivityTitle = x.Activity.Title,
                    ActivityDate = x.Activity.Date,
                    ActivityCategory = x.Activity.Category,
                    x.Activity.Venue,
                    x.Activity.City,
                    HostDisplayName = x.Activity.Attendees
                        .Where(a => a.IsHost)
                        .Select(a => a.User.DisplayName)
                        .FirstOrDefault(),
                    x.Amount,
                    x.Currency,
                    x.Status,
                    x.CreatedAt,
                    x.PaidAt,
                    x.RefundedAt,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (p == null) return null;

            var (statusLabel, statusColor) = p.Status switch
            {
                Domain.PaymentStatus.Succeeded => ("Paid", "#10b981"),
                Domain.PaymentStatus.Refunded => ("Refunded", "#64748b"),
                Domain.PaymentStatus.Failed => ("Failed", "#ef4444"),
                _ => ("Pending", "#f59e0b"),
            };

            var data = new ReceiptData
            {
                Kind = ReceiptKind.Payment,
                ReceiptNumber = p.ReceiptNumber,
                InvoiceNumber = p.InvoiceNumber,
                CheckoutSessionId = p.CheckoutSessionId,
                Provider = p.Provider,
                RecipientName = p.UserDisplayName ?? p.UserEmail ?? "Customer",
                RecipientEmail = p.UserEmail ?? string.Empty,
                ActivityId = p.ActivityId,
                ActivityTitle = p.ActivityTitle,
                ActivityDate = p.ActivityDate,
                Venue = p.Venue,
                City = p.City,
                HostName = p.HostDisplayName,
                Category = p.ActivityCategory,
                Amount = p.Amount,
                Currency = p.Currency,
                StatusLabel = statusLabel,
                StatusColorHex = statusColor,
                IssuedAt = p.CreatedAt,
                PaidAt = p.PaidAt,
                RefundedAt = p.RefundedAt,
            };

            var bytes = receiptPdfGenerator.Generate(data);
            return [new EmailAttachment(receiptPdfGenerator.BuildFileName(data), bytes, "application/pdf")];
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to build payment receipt PDF for paymentId={PaymentId}", paymentId);
            return null;
        }
    }

    private async Task<IEnumerable<EmailAttachment>?> BuildBookingReceiptAttachmentAsync(
        string activityId,
        string userEmail,
        string userName,
        string? hostName,
        decimal amount,
        string currency,
        string statusLabel,
        CancellationToken cancellationToken)
    {
        try
        {
            var activity = await dbContext.Activities
                .Where(a => a.Id == activityId)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Date,
                    a.Category,
                    a.Venue,
                    a.City,
                    a.PriceAmount,
                    a.Currency,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (activity == null) return null;

            var resolvedAmount = amount > 0 ? amount : activity.PriceAmount;
            var resolvedCurrency = !string.IsNullOrWhiteSpace(currency) ? currency : (activity.Currency ?? "USD");

            var bookingRef = $"BKG-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

            var data = new ReceiptData
            {
                Kind = ReceiptKind.Booking,
                ReceiptNumber = bookingRef,
                RecipientName = string.IsNullOrWhiteSpace(userName) ? userEmail : userName,
                RecipientEmail = userEmail,
                ActivityId = activity.Id,
                ActivityTitle = activity.Title,
                ActivityDate = activity.Date,
                Venue = activity.Venue,
                City = activity.City,
                HostName = hostName,
                Category = activity.Category,
                Amount = resolvedAmount,
                Currency = resolvedCurrency,
                StatusLabel = statusLabel,
                StatusColorHex = statusLabel.Equals("Approved", StringComparison.OrdinalIgnoreCase) ? "#10b981" : "#10b981",
                IssuedAt = DateTime.UtcNow,
            };

            var bytes = receiptPdfGenerator.Generate(data);
            return [new EmailAttachment(receiptPdfGenerator.BuildFileName(data), bytes, "application/pdf")];
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to build booking receipt PDF for activityId={ActivityId}", activityId);
            return null;
        }
    }
}
