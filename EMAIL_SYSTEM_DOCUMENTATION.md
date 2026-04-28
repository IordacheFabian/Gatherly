# Email Confirmation System - Implementation Guide

## Overview

The Reactivities app now includes a modern, production-ready email confirmation system with HTML email templates for various booking and payment scenarios. The system uses:

- **MailKit** for SMTP email sending with async/await support
- **Responsive HTML emails** with inline CSS for maximum email client compatibility
- **Strongly-typed DTOs** for email template data
- **Reusable template builder** to avoid code duplication
- **Integration with MediatR handlers** for automatic email sending on events

## Configuration

### SMTP Settings

Configure your SMTP settings in `appsettings.json` or `appsettings.Development.json`:

```json
{
  "AppSettings": {
    "ClientBaseUrl": "http://localhost:5173"
  },
  "SmtpSettings": {
    "Enabled": true,
    "Host": "smtp.gmail.com",
    "Port": 587,
    "EnableSsl": true,
    "UseDefaultCredentials": false,
    "UserName": "your-email@gmail.com",
    "Password": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "Reactivities"
  }
}
```

**Important:** For Gmail, use an [App Password](https://myaccount.google.com/apppasswords), not your main password. Ensure 2FA is enabled on your Gmail account.

**Port Configuration:**
- **Port 587**: Use `StartTls` (default, recommended for Gmail)
- **Port 465**: Use `SslOnConnect` (implicit SSL)

## Email Scenarios

### 1. Booking Request Created

Sent when a user requests to join/book an activity that requires host confirmation.

**When triggered:**
- User requests a booking for an activity with `RequiresHostConfirmation = true`
- Status is `BookingStatus.Pending`

**Implementation location:** [UpdateAttendance.cs](../Application/Activities/Commands/UpdateAttendance.cs)

**Method signature:**
```csharp
Task SendBookingRequestEmailAsync(
    string userEmail,
    string userName,
    string activityId,
    string activityTitle,
    DateTime activityDate,
    string location,
    string? hostName,
    CancellationToken cancellationToken = default);
```

**Email content:**
- Status badge: "Pending Approval" (amber)
- Message: Request received, awaiting host approval
- Activity details card with date, location, host name
- CTAs: View Activity, Back to Activities

### 2. Booking Approved

Sent when a host approves a pending booking request.

**When triggered:**
- Host reviews booking with `TargetStatus = BookingStatus.Approved`
- User had `Status = BookingStatus.Pending`

**Implementation location:** [ReviewBooking.cs](../Application/Activities/Commands/ReviewBooking.cs)

**Method signature:**
```csharp
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
```

**Email content:**
- Status badge: "Approved" (green)
- Message: Booking approved and ready
- Activity details including price if applicable
- Secondary message: Payment info if activity is paid
- CTAs: View Activity Details, Browse More Activities

### 3. Activity Joined

Sent when a user successfully joins an activity directly (approved immediately).

**When triggered:**
- User joins an activity with no host confirmation required
- Status is `BookingStatus.Approved` immediately

**Implementation location:** [UpdateAttendance.cs](../Application/Activities/Commands/UpdateAttendance.cs)

**Method signature:**
```csharp
Task SendActivityJoinedEmailAsync(
    string userEmail,
    string userName,
    string activityId,
    string activityTitle,
    DateTime activityDate,
    string location,
    string? hostName,
    CancellationToken cancellationToken = default);
```

**Email content:**
- Status badge: "Joined" (green)
- Message: Successfully joined the activity
- Activity details card
- Reminder about upcoming email notifications
- CTAs: View Activity, Browse More Activities

### 4. Payment Successful

Sent immediately after a successful payment.

**When triggered:**
- Payment status becomes `PaymentStatus.Succeeded`
- User completes mock checkout

**Implementation location:** [SimulateCheckout.cs](../Application/Payments/Commands/SimulateCheckout.cs)

**Method signature:**
```csharp
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
```

**Email content:**
- Status badge: "Payment Confirmed" (green)
- Payment card showing amount and transaction ID
- Activity details
- Receipt information
- CTAs: View Your Activity

### 5. Payment Required

Sent when initiating payment for a paid activity.

**When triggered:**
- User needs to pay for a bookable/paid activity
- Before processing payment

**Method signature:**
```csharp
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
```

**Email content:**
- Status badge: "Payment Required" (amber)
- Message: Payment needed to secure booking
- Activity details with price
- Checkout URL
- CTAs: Pay Now (primary), View Activity (secondary)

**Integration note:** Currently this must be called manually when initiating checkout. Add to your payment initiation controller action:

```csharp
await emailService.SendPaymentRequiredEmailAsync(
    user.Email,
    user.DisplayName ?? "User",
    activity.Id,
    activity.Title,
    activity.Date,
    $"{activity.City}, {activity.Venue}",
    activity.PriceAmount,
    activity.Currency,
    checkoutUrl,
    cancellationToken);
```

### 6. Booking Cancelled

Sent when a booking is cancelled by the user or activity is cancelled by host.

**When triggered:**
- User cancels their booking: `Status` changed to `BookingStatus.Cancelled`
- Host cancels activity: All attendee bookings cancelled

**Implementation location:** 
- User cancellation: [UpdateAttendance.cs](../Application/Activities/Commands/UpdateAttendance.cs)
- Host cancellation: [UpdateAttendance.cs](../Application/Activities/Commands/UpdateAttendance.cs)

**Method signature:**
```csharp
Task SendBookingCancelledEmailAsync(
    string userEmail,
    string userName,
    string activityId,
    string activityTitle,
    DateTime activityDate,
    string location,
    CancellationToken cancellationToken = default);
```

**Email content:**
- Status badge: "Cancelled" (red)
- Message: Booking has been cancelled
- Activity details
- Refund/support information
- CTAs: Browse Other Activities, Contact Support

## Architecture

### File Structure

```
Application/
├── Email/
│   ├── DTOs/
│   │   └── EmailTemplateData.cs          # Strongly-typed DTOs for email data
│   ├── EmailTemplateBuilder.cs           # Reusable template builder
│   └── ...
└── Interfaces/
    └── IEmailService.cs                  # Extended interface with email methods

API/
├── Services/
│   ├── EmailService.cs                   # Implementation with 6 email methods
│   └── SmtpSettings.cs                   # SMTP configuration
└── appsettings.json                      # Configuration
```

### Key Classes

#### EmailTemplateData (DTOs)

Strongly-typed models for email template data:

- **EmailTemplateData**: Base class with recipient, status badge, badge color
- **ActivityEmailData**: Extends base with activity-specific fields
- **PaymentEmailData**: Extends ActivityEmailData with payment fields
- **GenericEmailData**: For simple emails without activity details

#### EmailTemplateBuilder

Builds responsive HTML emails with:

- Inline CSS for email client compatibility
- Card-based responsive layout
- Color-coded status badges
- Dynamic content sections
- Customizable CTAs

**Methods:**
```csharp
BuildActivityEmail(data, ctaText, ctaUrl, secondaryCtaText?, secondaryCtaUrl?)
BuildPaymentEmail(data, ctaText, ctaUrl)
BuildGenericEmail(data, ctaText, ctaUrl, secondaryCtaText?, secondaryCtaUrl?)
```

#### IEmailService Interface

Extended with methods for each email scenario:

```csharp
// Base method
Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken = default);

// Booking emails
Task SendBookingRequestEmailAsync(...);
Task SendBookingApprovedEmailAsync(...);
Task SendActivityJoinedEmailAsync(...);
Task SendBookingCancelledEmailAsync(...);

// Payment emails
Task SendPaymentSuccessfulEmailAsync(...);
Task SendPaymentRequiredEmailAsync(...);
```

#### EmailService Implementation

Features:

- Async SMTP communication using MailKit
- Automatic port detection (587 with StartTls, 465 with SslOnConnect)
- Null-safe optional field handling
- Comprehensive error logging
- Graceful degradation when SMTP disabled

## Integration with MediatR Handlers

### Current Integrations

#### UpdateAttendance Handler

Automatically sends emails when:
- New booking request created → `SendBookingRequestEmailAsync`
- User joins approved → `SendActivityJoinedEmailAsync`
- User cancels booking → `SendBookingCancelledEmailAsync`
- Host cancels activity → `SendBookingCancelledEmailAsync` (bulk)

#### ReviewBooking Handler

Automatically sends emails when:
- Booking approved → `SendBookingApprovedEmailAsync`

#### SimulateCheckout Handler

Automatically sends emails when:
- Payment successful → `SendPaymentSuccessfulEmailAsync`

### Adding New Integrations

To add email sending to any handler:

1. **Inject IEmailService**:
   ```csharp
   public class MyHandler(
       IEmailService emailService,
       ...) : IRequestHandler<Command, Result<Unit>>
   ```

2. **Call appropriate email method**:
   ```csharp
   await emailService.SendBookingApprovedEmailAsync(
       user.Email,
       user.DisplayName ?? "User",
       activity.Id,
       activity.Title,
       activity.Date,
       $"{activity.City}, {activity.Venue}",
       hostName,
       activity.PriceAmount > 0 ? activity.PriceAmount : null,
       activity.Currency,
       cancellationToken);
   ```

3. **Handle errors gracefully**:
   ```csharp
   try
   {
       await emailService.SendBookingApprovedEmailAsync(...);
   }
   catch (Exception ex)
   {
       logger.LogError(ex, "Failed to send email");
       // Don't fail the operation - booking was still approved
   }
   ```

## Email Design Features

### Responsive Design

- Mobile-first responsive layout
- Adapts to 600px viewport (max email width)
- Fallback styles for older email clients
- Tested on Gmail, Outlook, Apple Mail, etc.

### Visual Elements

- **Header**: Gradient background with Reactivities branding
- **Status badges**: Color-coded for quick scanning
  - Green (#10b981): Approved, Joined, Confirmed
  - Amber (#f59e0b): Pending, Required payment
  - Red (#ef4444): Cancelled
  - Blue (#667eea): Generic/informational
- **Activity cards**: Activity details in organized layout
- **Payment cards**: Payment information highlighted
- **CTAs**: Large clickable buttons with hover effects
- **Footer**: Reactivities branding, links to app sections

### Inline CSS

All styles are inline to maximize compatibility with email clients that strip `<style>` tags.

## Testing

### Manual Testing

1. **Update appsettings.json** with valid SMTP settings
2. **Enable email in config**: `"Enabled": true`
3. **Trigger email event** (e.g., create booking)
4. **Check recipient email** for HTML email

### Mock Testing (Development)

Disable SMTP emails by setting:
```json
"SmtpSettings": {
  "Enabled": false
}
```

Emails will be logged but not sent. Check logs for template output.

### Email Preview

To preview generated HTML before sending:

1. Call template builder directly:
   ```csharp
   var builder = new EmailTemplateBuilder("http://localhost:5173");
   var html = builder.BuildActivityEmail(data, "View", "/activities/123");
   ```

2. Save to `.html` file and open in browser
3. Check rendering, links, and styling

## Customization

### Styling

To modify email appearance, edit CSS in `EmailTemplateBuilder.cs`:

- Colors: Update `#667eea` (primary), `#10b981` (success), etc.
- Fonts: Change `font-family`
- Spacing: Adjust padding/margin values
- Responsive breakpoint: Modify `@media (max-width: 600px)`

### Messages

To customize email messages, update the message text in `EmailService.cs`:

```csharp
var data = new ActivityEmailData
{
    ...
    Message = "Your custom message here",
    SecondaryMessage = "Optional secondary message"
};
```

### Footer Links

Edit footer links in `EmailTemplateBuilder.BuildFooter()`:

```csharp
<a href=""{BuildAbsoluteUrl("/custom-page")}"">Custom Link</a>
```

## Best Practices

1. **Always use try-catch** when calling email methods - email failures shouldn't block business operations
2. **Log email errors** for debugging and monitoring
3. **Test with real email addresses** to verify complete flow
4. **Use app password** for Gmail (not main account password)
5. **Verify SMTP settings** in development environment settings
6. **Check email client rendering** (Gmail web, mobile, Outlook, Apple Mail, etc.)
7. **Monitor email deliverability** - watch for spam folder placement
8. **Implement email preferences** - allow users to opt-out (future enhancement)

## Troubleshooting

### Emails not sending

1. **Check SMTP enabled**: `"Enabled": true` in appsettings
2. **Verify credentials**: Email, password, host, port
3. **Check logs**: Search for "Error sending email" in application logs
4. **Verify firewall**: Port 587 or 465 may be blocked
5. **Gmail issues**: 
   - Use app password, not main password
   - Enable "Less secure app access" if not using app password
   - Check if 2FA is enabled

### Emails in spam

1. **SPF/DKIM/DMARC**: Configure DNS records for domain
2. **From address**: Use verified domain email
3. **HTML quality**: Avoid too many images, suspicious links
4. **Unsubscribe link**: Consider adding for compliance (future)

### Styling issues

1. **Inline CSS**: All styles are inline - no external stylesheets
2. **Email client**: Different clients render CSS differently
3. **Test multiple clients**: Gmail, Outlook, Apple Mail, mobile
4. **Fallback styles**: Use safe color names, standard font stacks

## Future Enhancements

1. **Email preferences**: Allow users to choose which emails they receive
2. **Unsubscribe link**: Add for compliance (CAN-SPAM, GDPR)
3. **Email scheduling**: Send reminder emails before activity
4. **Batch emails**: Combine multiple notifications into single email
5. **Email analytics**: Track opens, clicks, bounces
6. **Template variants**: A/B test different email versions
7. **Localization**: Support multiple languages
8. **Background jobs**: Use Hangfire/similar for reliable email delivery

## References

- [MailKit Documentation](https://mimekit.net/)
- [MJML Email Framework](https://mjml.io/) - Consider for complex templates
- [Email Client CSS Support](https://www.campaignmonitor.com/css/)
- [Gmail Best Practices](https://support.google.com/mail/answer/6090225)
- [Responsive Email Design](https://www.campaignmonitor.com/resources/guides/mobile-email-design/)
