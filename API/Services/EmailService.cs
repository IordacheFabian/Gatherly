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

    // ============================================================
    // Public API: thin wrappers that dispatch to the engine below.
    // Signatures preserved for IEmailService backward compatibility.
    // ============================================================

    public Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
        => SendRawEmailAsync(toEmail, subject, body, attachments: null, cancellationToken);

    public Task SendBookingRequestEmailAsync(
        string userEmail, string userName, string activityId, string activityTitle,
        DateTime activityDate, string location, string? hostName,
        CancellationToken cancellationToken = default)
        => DispatchActivityEmailAsync(EmailScenario.BookingRequest,
            new EmailContext(userEmail, userName, activityId, activityTitle, activityDate, location, hostName),
            cancellationToken);

    public Task SendBookingApprovedEmailAsync(
        string userEmail, string userName, string activityId, string activityTitle,
        DateTime activityDate, string location, string? hostName,
        decimal? price, string currency, CancellationToken cancellationToken = default)
        => DispatchActivityEmailAsync(EmailScenario.BookingApproved,
            new EmailContext(userEmail, userName, activityId, activityTitle, activityDate, location, hostName,
                Price: price, Currency: currency),
            cancellationToken);

    public Task SendActivityJoinedEmailAsync(
        string userEmail, string userName, string activityId, string activityTitle,
        DateTime activityDate, string location, string? hostName,
        CancellationToken cancellationToken = default)
        => DispatchActivityEmailAsync(EmailScenario.ActivityJoined,
            new EmailContext(userEmail, userName, activityId, activityTitle, activityDate, location, hostName),
            cancellationToken);

    public Task SendPaymentSuccessfulEmailAsync(
        string userEmail, string userName, string paymentId, string activityId, string activityTitle,
        DateTime activityDate, string location, string? hostName,
        decimal amount, string currency, CancellationToken cancellationToken = default)
        => DispatchActivityEmailAsync(EmailScenario.PaymentSuccessful,
            new EmailContext(userEmail, userName, activityId, activityTitle, activityDate, location, hostName,
                PaymentId: paymentId, Price: amount, Currency: currency),
            cancellationToken);

    public Task SendPaymentRequiredEmailAsync(
        string userEmail, string userName, string activityId, string activityTitle,
        DateTime activityDate, string location, decimal amount, string currency,
        string? checkoutUrl, CancellationToken cancellationToken = default)
        => DispatchActivityEmailAsync(EmailScenario.PaymentRequired,
            new EmailContext(userEmail, userName, activityId, activityTitle, activityDate, location, HostName: null,
                Price: amount, Currency: currency, CheckoutUrl: checkoutUrl),
            cancellationToken);

    public Task SendBookingRejectedEmailAsync(
        string userEmail, string userName, string activityId, string activityTitle,
        DateTime activityDate, string location,
        CancellationToken cancellationToken = default)
        => DispatchActivityEmailAsync(EmailScenario.BookingRejected,
            new EmailContext(userEmail, userName, activityId, activityTitle, activityDate, location, HostName: null),
            cancellationToken);

    public Task SendBookingCancelledEmailAsync(
        string userEmail, string userName, string activityId, string activityTitle,
        DateTime activityDate, string location,
        CancellationToken cancellationToken = default)
        => DispatchActivityEmailAsync(EmailScenario.BookingCancelled,
            new EmailContext(userEmail, userName, activityId, activityTitle, activityDate, location, HostName: null),
            cancellationToken);

    // ============================================================
    // Engine
    // ============================================================

    private enum EmailScenario
    {
        BookingRequest,
        BookingApproved,
        ActivityJoined,
        PaymentSuccessful,
        PaymentRequired,
        BookingRejected,
        BookingCancelled,
    }

    private enum ReceiptAttachmentMode { None, BookingConfirmation, PaymentReceipt }

    private record EmailContext(
        string UserEmail,
        string UserName,
        string ActivityId,
        string ActivityTitle,
        DateTime ActivityDate,
        string Location,
        string? HostName,
        string? PaymentId = null,
        decimal? Price = null,
        string Currency = "USD",
        string? CheckoutUrl = null);

    private record ScenarioConfig(
        string Subject,
        string StatusBadge,
        string StatusBadgeColor,
        Func<EmailContext, string> Message,
        Func<EmailContext, string?> SecondaryMessage,
        Func<EmailContext, (string Label, string Url)> PrimaryCta,
        Func<EmailContext, (string Label, string Url)?> SecondaryCta,
        ReceiptAttachmentMode Attachment,
        string ReceiptStatusLabel = "Confirmed",
        bool UsePaymentTemplate = false);

    private static readonly Dictionary<EmailScenario, ScenarioConfig> Scenarios = new()
    {
        [EmailScenario.BookingRequest] = new(
            Subject: "Booking Request Received - Gatherly",
            StatusBadge: "Pending Approval",
            StatusBadgeColor: "#f59e0b",
            Message: _ => "Your booking request has been received! The activity host will review your request and send you a confirmation or rejection soon.",
            SecondaryMessage: _ => "You can view the activity details and track your booking status from your dashboard.",
            PrimaryCta: ctx => ("View Activity", $"/activities/{ctx.ActivityId}"),
            SecondaryCta: _ => ("Back to Activities", "/activities"),
            Attachment: ReceiptAttachmentMode.None),

        [EmailScenario.BookingApproved] = new(
            Subject: "Booking Approved! - Gatherly",
            StatusBadge: "Approved",
            StatusBadgeColor: "#10b981",
            Message: _ => "Great news! Your booking has been approved. You're all set to join this activity!",
            SecondaryMessage: ctx => ctx.Price.HasValue && ctx.Price > 0
                ? "Please note: Payment may be required to complete your booking. Check the activity details for more information."
                : "See you at the activity!",
            PrimaryCta: ctx => ("View Activity Details", $"/activities/{ctx.ActivityId}"),
            SecondaryCta: _ => ("Browse More Activities", "/activities"),
            Attachment: ReceiptAttachmentMode.BookingConfirmation,
            ReceiptStatusLabel: "Approved"),

        [EmailScenario.ActivityJoined] = new(
            Subject: "You've Joined an Activity! - Gatherly",
            StatusBadge: "Joined",
            StatusBadgeColor: "#10b981",
            Message: ctx => $"You've successfully joined '{ctx.ActivityTitle}'! We're excited to see you there.",
            SecondaryMessage: _ => "You'll receive a reminder email a few days before the activity date.",
            PrimaryCta: ctx => ("View Activity", $"/activities/{ctx.ActivityId}"),
            SecondaryCta: _ => ("Browse More Activities", "/activities"),
            Attachment: ReceiptAttachmentMode.BookingConfirmation,
            ReceiptStatusLabel: "Confirmed"),

        [EmailScenario.PaymentSuccessful] = new(
            Subject: "Payment Successful - Gatherly",
            StatusBadge: "Payment Confirmed",
            StatusBadgeColor: "#10b981",
            Message: _ => "Your payment has been processed successfully. Your booking is confirmed!",
            SecondaryMessage: _ => "A receipt has been sent to this email address. Keep it for your records.",
            PrimaryCta: ctx => ("View Activity", $"/activity/{ctx.ActivityId}"),
            SecondaryCta: _ => ("View Payments", "/payments"),
            Attachment: ReceiptAttachmentMode.PaymentReceipt,
            UsePaymentTemplate: true),

        [EmailScenario.PaymentRequired] = new(
            Subject: "Payment Required - Gatherly",
            StatusBadge: "Payment Required",
            StatusBadgeColor: "#f59e0b",
            Message: ctx => $"To complete your booking for '{ctx.ActivityTitle}', payment is required.",
            SecondaryMessage: ctx => $"Payment amount: {ctx.Currency} {ctx.Price ?? 0:F2}. Please complete payment to secure your spot.",
            PrimaryCta: ctx => ("Pay Now", !string.IsNullOrWhiteSpace(ctx.CheckoutUrl)
                ? ctx.CheckoutUrl!
                : $"/payments?activityId={ctx.ActivityId}"),
            SecondaryCta: ctx => ("View Activity", $"/activities/{ctx.ActivityId}"),
            Attachment: ReceiptAttachmentMode.None),

        [EmailScenario.BookingRejected] = new(
            Subject: "Booking Request Rejected - Gatherly",
            StatusBadge: "Rejected",
            StatusBadgeColor: "#ef4444",
            Message: ctx => $"Unfortunately, your booking request for '{ctx.ActivityTitle}' has been rejected by the host.",
            SecondaryMessage: _ => "You can browse other activities or contact the host if you have any questions.",
            PrimaryCta: _ => ("Browse Other Activities", "/activities"),
            SecondaryCta: _ => ("Contact Support", "/contact"),
            Attachment: ReceiptAttachmentMode.None),

        [EmailScenario.BookingCancelled] = new(
            Subject: "Booking Cancelled - Gatherly",
            StatusBadge: "Cancelled",
            StatusBadgeColor: "#ef4444",
            Message: ctx => $"Your booking for '{ctx.ActivityTitle}' has been cancelled.",
            SecondaryMessage: _ => "If you have any questions about this cancellation or would like to request a refund, please contact our support team.",
            PrimaryCta: _ => ("Browse Other Activities", "/activities"),
            SecondaryCta: _ => ("Contact Support", "/contact"),
            Attachment: ReceiptAttachmentMode.None),
    };

    private async Task DispatchActivityEmailAsync(EmailScenario scenario, EmailContext ctx, CancellationToken cancellationToken)
    {
        var cfg = Scenarios[scenario];
        var (primaryLabel, primaryUrl) = cfg.PrimaryCta(ctx);
        var secondary = cfg.SecondaryCta(ctx);

        string htmlBody;
        if (cfg.UsePaymentTemplate)
        {
            var data = new PaymentEmailData
            {
                RecipientName = ctx.UserName,
                RecipientEmail = ctx.UserEmail,
                PaymentId = ctx.PaymentId ?? string.Empty,
                ActivityId = ctx.ActivityId,
                ActivityTitle = ctx.ActivityTitle,
                ActivityDate = ctx.ActivityDate,
                ActivityLocation = ctx.Location,
                HostName = ctx.HostName,
                Amount = ctx.Price ?? 0m,
                Currency = ctx.Currency,
                StatusBadge = cfg.StatusBadge,
                StatusBadgeColor = cfg.StatusBadgeColor,
                Message = cfg.Message(ctx),
                SecondaryMessage = cfg.SecondaryMessage(ctx),
            };
            htmlBody = _templateBuilder.BuildPaymentEmail(data, primaryLabel, primaryUrl, secondary?.Label, secondary?.Url);
        }
        else
        {
            var data = new ActivityEmailData
            {
                RecipientName = ctx.UserName,
                RecipientEmail = ctx.UserEmail,
                ActivityId = ctx.ActivityId,
                ActivityTitle = ctx.ActivityTitle,
                ActivityDate = ctx.ActivityDate,
                ActivityLocation = ctx.Location,
                HostName = ctx.HostName,
                Price = ctx.Price,
                Currency = ctx.Currency,
                StatusBadge = cfg.StatusBadge,
                StatusBadgeColor = cfg.StatusBadgeColor,
                Message = cfg.Message(ctx),
                SecondaryMessage = cfg.SecondaryMessage(ctx),
            };
            htmlBody = _templateBuilder.BuildActivityEmail(data, primaryLabel, primaryUrl, secondary?.Label, secondary?.Url);
        }

        var attachments = cfg.Attachment switch
        {
            ReceiptAttachmentMode.PaymentReceipt when ctx.PaymentId is not null
                => await BuildPaymentReceiptAttachmentAsync(ctx.PaymentId, cancellationToken),
            ReceiptAttachmentMode.BookingConfirmation
                => await BuildBookingReceiptAttachmentAsync(ctx, cfg.ReceiptStatusLabel, cancellationToken),
            _ => null,
        };

        await SendRawEmailAsync(ctx.UserEmail, cfg.Subject, htmlBody, attachments, cancellationToken);
    }

    // ============================================================
    // SMTP send (was previously SendEmailAsync overload)
    // ============================================================

    private async Task SendRawEmailAsync(
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

    // ============================================================
    // PDF receipt attachment builders
    // ============================================================

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
                Category = p.ActivityCategory.ToString(),
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
        EmailContext ctx,
        string statusLabel,
        CancellationToken cancellationToken)
    {
        try
        {
            var activity = await dbContext.Activities
                .Where(a => a.Id == ctx.ActivityId)
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

            var resolvedAmount = ctx.Price ?? activity.PriceAmount;
            var resolvedCurrency = !string.IsNullOrWhiteSpace(ctx.Currency) ? ctx.Currency : (activity.Currency ?? "USD");
            var bookingRef = $"BKG-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

            var data = new ReceiptData
            {
                Kind = ReceiptKind.Booking,
                ReceiptNumber = bookingRef,
                RecipientName = string.IsNullOrWhiteSpace(ctx.UserName) ? ctx.UserEmail : ctx.UserName,
                RecipientEmail = ctx.UserEmail,
                ActivityId = activity.Id,
                ActivityTitle = activity.Title,
                ActivityDate = activity.Date,
                Venue = activity.Venue,
                City = activity.City,
                HostName = ctx.HostName,
                Category = activity.Category.ToString(),
                Amount = resolvedAmount,
                Currency = resolvedCurrency,
                StatusLabel = statusLabel,
                StatusColorHex = "#10b981",
                IssuedAt = DateTime.UtcNow,
            };

            var bytes = receiptPdfGenerator.Generate(data);
            return [new EmailAttachment(receiptPdfGenerator.BuildFileName(data), bytes, "application/pdf")];
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to build booking receipt PDF for activityId={ActivityId}", ctx.ActivityId);
            return null;
        }
    }
}
