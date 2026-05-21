using Application.Core;
using Application.Email;
using Application.Email.DTOs;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Application.Account.Commands;

public class DeleteAccount
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Password { get; set; }
    }

    public class Handler(
        UserManager<User> userManager,
        IUserAccessor userAccessor,
        IEmailService emailService,
        IPhotoService photoService,
        IActivityRepository activityRepository,
        IPaymentRepository paymentRepository,
        IProfileRepository profileRepository,
        IConfiguration configuration) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Password))
                return Result<Unit>.Failure("Password is required.", 400);

            var user = await userAccessor.GetUserAsync();

            var isPasswordValid = await userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid)
                return Result<Unit>.Failure("Invalid password.", 400);

            // 1. Cancel all activities the user hosts and notify their attendees
            var hostedActivities = await activityRepository.Query()
                .Include(a => a.Attendees).ThenInclude(a => a.User)
                .Where(a => a.Attendees.Any(att => att.IsHost && att.UserId == user.Id) && !a.IsCancelled)
                .ToListAsync(cancellationToken);

            foreach (var activity in hostedActivities)
            {
                activity.IsCancelled = true;
                activityRepository.Update(activity);

                // Notify each non-host attendee their event was cancelled
                foreach (var attendee in activity.Attendees.Where(a => !a.IsHost && a.User?.Email != null))
                {
                    try
                    {
                        var clientUrl = configuration["AppSettings:ClientBaseUrl"] ?? "http://localhost:8080";
                        var tpl = new EmailTemplateBuilder(clientUrl);
                        var html = tpl.BuildGenericEmail(new GenericEmailData
                        {
                            RecipientName = attendee.User!.DisplayName ?? attendee.User.Email!,
                            RecipientEmail = attendee.User.Email!,
                            StatusBadge = "Event Cancelled",
                            StatusBadgeColor = "#ef4444",
                            Title = "An event you joined has been cancelled",
                            Message = $"Unfortunately, <strong>{activity.Title}</strong> (scheduled for {activity.Date:MMMM d, yyyy}) has been cancelled because the organiser deleted their account.",
                            SecondaryMessage = "If you made a payment, a refund will be processed automatically."
                        },
                        ctaButtonText: "Browse Activities",
                        ctaButtonUrl: "/");
                        await emailService.SendEmailAsync(attendee.User.Email!, $"\"{activity.Title}\" has been cancelled", html, cancellationToken);
                    }
                    catch { /* best-effort */ }
                }
            }

            // 2. Cancel user's own pending/active bookings at other events
            var attendances = await activityRepository.QueryAttendances()
                .Include(a => a.Activity)
                .Where(a => a.UserId == user.Id && !a.IsHost &&
                            (a.Status == BookingStatus.Approved ||
                             a.Status == BookingStatus.Waitlisted ||
                             a.Status == BookingStatus.Pending))
                .ToListAsync(cancellationToken);

            foreach (var attendance in attendances)
            {
                attendance.Status = BookingStatus.Cancelled;
                attendance.StatusUpdatedAt = DateTime.UtcNow;
            }

            // 3. Mark any pending payments as cancelled/failed
            var pendingPayments = await paymentRepository.Query()
                .Where(p => p.UserId == user.Id && p.Status == PaymentStatus.Pending)
                .ToListAsync(cancellationToken);

            foreach (var payment in pendingPayments)
            {
                payment.Status = PaymentStatus.Failed;
                paymentRepository.Update(payment);
            }

            await activityRepository.SaveChangesAsync(cancellationToken);

            // 4. Delete profile photos from cloud storage
            var photos = await profileRepository.QueryUsers()
                .Where(u => u.Id == user.Id)
                .SelectMany(u => u.Photos)
                .ToListAsync(cancellationToken);

            foreach (var photo in photos)
            {
                try { await photoService.DeletePhoto(photo.PublicId); }
                catch { /* best-effort */ }
            }

            // 5. Send goodbye email before account is wiped
            var clientBaseUrl = configuration["AppSettings:ClientBaseUrl"] ?? "http://localhost:8080";
            var templateBuilder = new EmailTemplateBuilder(clientBaseUrl);
            var htmlBody = templateBuilder.BuildGenericEmail(
                new GenericEmailData
                {
                    RecipientName = user.DisplayName ?? user.Email!,
                    RecipientEmail = user.Email!,
                    StatusBadge = "Account Deleted",
                    StatusBadgeColor = "#ef4444",
                    Title = "We will miss you",
                    Message = $"We are sorry to see you leave, <strong>{user.DisplayName}</strong>. Your account and all associated personal data have been permanently deleted as requested.",
                    SecondaryMessage = "Payment records may be retained for up to 7 years as required by financial regulations, but all personal identifiers have been removed."
                },
                ctaButtonText: "Contact Support",
                ctaButtonUrl: "/contact"
            );

            try
            {
                if (!string.IsNullOrWhiteSpace(user.Email))
                    await emailService.SendEmailAsync(user.Email, "Your Gatherly account has been deleted", htmlBody, cancellationToken);
            }
            catch { /* best-effort */ }

            // 6. Delete the Identity user (cascades to remaining related data via EF)
            var result = await userManager.DeleteAsync(user);

            if (result.Succeeded)
                return Result<Unit>.Success(Unit.Value);

            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return Result<Unit>.Failure(errors, 400);
        }
    }
}
