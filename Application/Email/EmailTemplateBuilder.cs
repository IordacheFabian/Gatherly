using Application.Email.DTOs;

namespace Application.Email;

/// <summary>
/// Generates modern, responsive HTML email templates
/// Uses inline CSS for maximum email client compatibility
/// </summary>
public class EmailTemplateBuilder
{
    private readonly string _baseUrl;

    public EmailTemplateBuilder(string baseUrl)
    {
        _baseUrl = baseUrl.TrimEnd('/');
    }

    /// <summary>
    /// Builds an activity-related email with activity details
    /// </summary>
    public string BuildActivityEmail(ActivityEmailData data, string ctaButtonText, string ctaButtonUrl, string? secondaryCtaText = null, string? secondaryCtaUrl = null)
    {
        return BuildEmail(
            header: BuildActivityHeader(data),
            content: BuildActivityContent(data),
            mainCta: (ctaButtonText, BuildAbsoluteUrl(ctaButtonUrl)),
            secondaryCta: secondaryCtaText != null && secondaryCtaUrl != null ? (secondaryCtaText, BuildAbsoluteUrl(secondaryCtaUrl)) : null
        );
    }

    /// <summary>
    /// Builds a payment-related email
    /// </summary>
    public string BuildPaymentEmail(PaymentEmailData data, string ctaButtonText, string ctaButtonUrl)
    {
        return BuildEmail(
            header: BuildPaymentHeader(data),
            content: BuildPaymentContent(data),
            mainCta: (ctaButtonText, BuildAbsoluteUrl(ctaButtonUrl)),
            secondaryCta: ("View Activity", BuildAbsoluteUrl($"/activities/{data.ActivityId}"))
        );
    }

    /// <summary>
    /// Builds a generic email without activity details
    /// </summary>
    public string BuildGenericEmail(GenericEmailData data, string ctaButtonText, string ctaButtonUrl, string? secondaryCtaText = null, string? secondaryCtaUrl = null)
    {
        return BuildEmail(
            header: BuildGenericHeader(data),
            content: BuildGenericContent(data),
            mainCta: (ctaButtonText, BuildAbsoluteUrl(ctaButtonUrl)),
            secondaryCta: secondaryCtaText != null && secondaryCtaUrl != null ? (secondaryCtaText, BuildAbsoluteUrl(secondaryCtaUrl)) : null
        );
    }

    /// <summary>
    /// Core email template structure
    /// </summary>
    private string BuildEmail(
        string header,
        string content,
        (string text, string url) mainCta,
        (string text, string url)? secondaryCta = null)
    {
        var secondaryCtaHtml = secondaryCta.HasValue
            ? BuildSecondaryButton(secondaryCta.Value.text, secondaryCta.Value.url)
            : string.Empty;

        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Reactivities</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }}
        .email-container {{
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        .email-header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }}
        .email-header h1 {{
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
        }}
        .email-header .tagline {{
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
        }}
        .email-body {{
            padding: 40px 30px;
        }}
        .greeting {{
            margin: 0 0 20px 0;
            font-size: 16px;
            color: #333;
        }}
        .greeting strong {{
            color: #667eea;
        }}
        .status-badge {{
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: white;
            margin-bottom: 15px;
        }}
        .content {{
            color: #555;
            line-height: 1.8;
            margin-bottom: 30px;
        }}
        .activity-card {{
            background-color: #f9f9f9;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .activity-card h3 {{
            margin: 0 0 10px 0;
            color: #333;
            font-size: 18px;
        }}
        .activity-detail {{
            display: flex;
            align-items: flex-start;
            margin: 10px 0;
            font-size: 14px;
        }}
        .activity-detail-icon {{
            width: 20px;
            margin-right: 10px;
            color: #667eea;
            font-weight: bold;
        }}
        .activity-detail-text {{
            flex: 1;
        }}
        .payment-card {{
            background-color: #f0f9ff;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .payment-card h3 {{
            margin: 0 0 15px 0;
            color: #333;
            font-size: 16px;
        }}
        .payment-amount {{
            font-size: 28px;
            font-weight: 700;
            color: #10b981;
            margin: 10px 0;
        }}
        .cta-container {{
            text-align: center;
            margin: 40px 0;
        }}
        .btn {{
            display: inline-block;
            padding: 14px 32px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            margin: 10px;
        }}
        .btn-primary {{
            background-color: #667eea;
            color: white;
        }}
        .btn-primary:hover {{
            background-color: #5568d3;
            text-decoration: none;
        }}
        .btn-secondary {{
            background-color: #e0e7ff;
            color: #667eea;
            border: 1px solid #667eea;
        }}
        .btn-secondary:hover {{
            background-color: #c7d2fd;
            text-decoration: none;
        }}
        .email-footer {{
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
            font-size: 13px;
            color: #666;
        }}
        .footer-links {{
            margin: 15px 0;
        }}
        .footer-links a {{
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }}
        .footer-links a:hover {{
            text-decoration: underline;
        }}
        .divider {{
            height: 1px;
            background-color: #e0e0e0;
            margin: 20px 0;
        }}
        @media (max-width: 600px) {{
            .email-container {{
                margin: 0;
                border-radius: 0;
            }}
            .email-body {{
                padding: 20px;
            }}
            .btn {{
                display: block;
                width: 100%;
                margin: 10px 0;
                box-sizing: border-box;
            }}
            .activity-card {{
                padding: 15px;
            }}
        }}
    </style>
</head>
<body>
    <div class=""email-container"">
        {header}
        <div class=""email-body"">
            {content}
            
            <div class=""cta-container"">
                <a href=""{mainCta.url}"" class=""btn btn-primary"">{mainCta.text}</a>
                {secondaryCtaHtml}
            </div>
        </div>
        {BuildFooter()}
    </div>
</body>
</html>";
    }

    private string BuildActivityHeader(ActivityEmailData data)
    {
        return $@"
<div class=""email-header"">
    <h1>Reactivities</h1>
    <p class=""tagline"">Your activity booking confirmed ✓</p>
</div>";
    }

    private string BuildPaymentHeader(PaymentEmailData data)
    {
        return $@"
<div class=""email-header"">
    <h1>Reactivities</h1>
    <p class=""tagline"">Payment Confirmation ✓</p>
</div>";
    }

    private string BuildGenericHeader(GenericEmailData data)
    {
        return $@"
<div class=""email-header"">
    <h1>Reactivities</h1>
    <p class=""tagline"">{data.Title}</p>
</div>";
    }

    private string BuildActivityContent(ActivityEmailData data)
    {
        var locationText = !string.IsNullOrWhiteSpace(data.ActivityLocation) 
            ? data.ActivityLocation 
            : "Location TBA";

        var hostText = !string.IsNullOrWhiteSpace(data.HostName)
            ? $"<div class=\"activity-detail\"><div class=\"activity-detail-icon\">👤</div><div class=\"activity-detail-text\">Host: {data.HostName}</div></div>"
            : string.Empty;

        var priceText = data.Price.HasValue && data.Price > 0
            ? $"<div class=\"activity-detail\"><div class=\"activity-detail-icon\">💰</div><div class=\"activity-detail-text\">{data.Currency} {data.Price:F2}</div></div>"
            : string.Empty;

        var message = !string.IsNullOrWhiteSpace(data.Message)
            ? $"<p class=\"content\">{data.Message}</p>"
            : string.Empty;

        var secondaryMessage = !string.IsNullOrWhiteSpace(data.SecondaryMessage)
            ? $"<p class=\"content\" style=\"color: #666; font-size: 14px;\">{data.SecondaryMessage}</p>"
            : string.Empty;

        var badgeColor = GetBadgeBackgroundColor(data.StatusBadgeColor);

        return $@"
<p class=""greeting"">Hi <strong>{data.RecipientName}</strong>,</p>

<div class=""status-badge"" style=""background-color: {badgeColor};"">{data.StatusBadge}</div>

{message}
<div class=""activity-card"">
    <h3>{data.ActivityTitle}</h3>
    <div class=""activity-detail"">
        <div class=""activity-detail-icon"">📅</div>
        <div class=""activity-detail-text"">{data.ActivityDate:MMMM dd, yyyy 'at' HH:mm}</div>
    </div>
    <div class=""activity-detail"">
        <div class=""activity-detail-icon"">📍</div>
        <div class=""activity-detail-text"">{locationText}</div>
    </div>
    {hostText}
    {priceText}
</div>
{secondaryMessage}";
    }

    private string BuildPaymentContent(PaymentEmailData data)
    {
        var locationText = !string.IsNullOrWhiteSpace(data.ActivityLocation)
            ? data.ActivityLocation
            : "Location TBA";

        var hostText = !string.IsNullOrWhiteSpace(data.HostName)
            ? $"<div class=\"activity-detail\"><div class=\"activity-detail-icon\">👤</div><div class=\"activity-detail-text\">Host: {data.HostName}</div></div>"
            : string.Empty;

        var message = !string.IsNullOrWhiteSpace(data.Message)
            ? $"<p class=\"content\">{data.Message}</p>"
            : string.Empty;

        var badgeColor = GetBadgeBackgroundColor(data.StatusBadgeColor);

        return $@"
<p class=""greeting"">Hi <strong>{data.RecipientName}</strong>,</p>

<div class=""status-badge"" style=""background-color: {badgeColor};"">{data.StatusBadge}</div>

{message}
<div class=""payment-card"">
    <h3>Payment Confirmation</h3>
    <div class=""payment-amount"">{data.Currency} {data.Amount:F2}</div>
    <p style=""margin: 10px 0; color: #666; font-size: 14px;"">For: {data.ActivityTitle}</p>
    <p style=""margin: 5px 0; color: #666; font-size: 13px;"">Transaction ID: {data.PaymentId}</p>
</div>

<div class=""activity-card"">
    <h3>{data.ActivityTitle}</h3>
    <div class=""activity-detail"">
        <div class=""activity-detail-icon"">📅</div>
        <div class=""activity-detail-text"">{data.ActivityDate:MMMM dd, yyyy 'at' HH:mm}</div>
    </div>
    <div class=""activity-detail"">
        <div class=""activity-detail-icon"">📍</div>
        <div class=""activity-detail-text"">{locationText}</div>
    </div>
    {hostText}
</div>";
    }

    private string BuildGenericContent(GenericEmailData data)
    {
        var secondaryMessage = !string.IsNullOrWhiteSpace(data.SecondaryMessage)
            ? $"<p class=\"content\" style=\"color: #666; font-size: 14px;\">{data.SecondaryMessage}</p>"
            : string.Empty;

        var badgeColor = GetBadgeBackgroundColor(data.StatusBadgeColor);

        return $@"
<p class=""greeting"">Hi <strong>{data.RecipientName}</strong>,</p>

<div class=""status-badge"" style=""background-color: {badgeColor};"">{data.StatusBadge}</div>

<div class=""content"">
    {data.Message}
</div>
{secondaryMessage}";
    }

    private string BuildSecondaryButton(string text, string url)
    {
        return $@"<a href=""{url}"" class=""btn btn-secondary"">{text}</a>";
    }

    private string BuildFooter()
    {
        return $@"
<div class=""email-footer"">
    <p style=""margin: 0 0 10px 0; font-weight: 600; color: #333;"">Reactivities</p>
    <p style=""margin: 0 0 15px 0; font-size: 12px; color: #999;"">
        Discover and join amazing activities in your community.
    </p>
    <div class=""footer-links"">
        <a href=""{BuildAbsoluteUrl("/activities")}"">Browse Activities</a>
        <a href=""{BuildAbsoluteUrl("/about")}"">About Us</a>
        <a href=""{BuildAbsoluteUrl("/contact")}"">Contact</a>
    </div>
    <div class=""divider""></div>
    <p style=""margin: 10px 0 0 0; font-size: 11px; color: #999;"">
        © 2026 Reactivities. All rights reserved.
    </p>
</div>";
    }

    private string BuildAbsoluteUrl(string path)
    {
        return $"{_baseUrl}{path}";
    }

    private string GetBadgeBackgroundColor(string colorCode)
    {
        return colorCode switch
        {
            "#10b981" => "#d1fae5", // Green
            "#f59e0b" => "#fef3c7", // Amber
            "#ef4444" => "#fee2e2", // Red
            "#6366f1" => "#e0e7ff", // Indigo
            "#8b5cf6" => "#ede9fe", // Violet
            _ => "#dbeafe", // Default blue
        };
    }
}
