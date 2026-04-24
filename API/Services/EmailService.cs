using System.Net;
using System.Net.Mail;
using Application.Interfaces;

namespace API.Services;

public class EmailService(
    SmtpSettings smtpSettings,
    ILogger<EmailService> logger) : IEmailService
{
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

        using var message = new MailMessage
        {
            From = new MailAddress(smtpSettings.FromEmail, smtpSettings.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = false,
        };

        message.To.Add(toEmail);

        using var client = new SmtpClient(smtpSettings.Host, smtpSettings.Port)
        {
            EnableSsl = smtpSettings.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = smtpSettings.UseDefaultCredentials,
        };

        if (!smtpSettings.UseDefaultCredentials && !string.IsNullOrWhiteSpace(smtpSettings.UserName))
        {
            client.Credentials = new NetworkCredential(smtpSettings.UserName, smtpSettings.Password);
        }

        cancellationToken.ThrowIfCancellationRequested();

        try
        {
            logger.LogInformation(
                "Sending email via SMTP host {Host}:{Port} to {ToEmail}",
                smtpSettings.Host,
                smtpSettings.Port,
                toEmail);

            await client.SendMailAsync(message);

            logger.LogInformation("Email sent successfully to {ToEmail}", toEmail);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
        }
    }
}
