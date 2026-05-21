using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Payments.Commands;

public class CompletePayment
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string CheckoutSessionId { get; set; }
    }

    public class Handler(
        IPaymentRepository paymentRepository,
        IActivityRepository activityRepository,
        INotificationService notificationService,
        IEmailService emailService) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var payment = await paymentRepository.Query()
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.CheckoutSessionId == request.CheckoutSessionId, cancellationToken);

            if (payment == null)
                return Result<Unit>.Failure("Payment not found", 404);

            if (payment.Status == PaymentStatus.Succeeded)
                return Result<Unit>.Success(Unit.Value); // Already processed (idempotent)

            payment.Status = PaymentStatus.Succeeded;
            payment.PaidAt = DateTime.UtcNow;
            paymentRepository.Update(payment);

            var activity = await activityRepository.GetByIdWithAttendeesAsync(payment.ActivityId, cancellationToken);
            if (activity == null)
                return Result<Unit>.Failure("Activity not found", 404);

            var attendee = activity.Attendees.FirstOrDefault(a => a.UserId == payment.UserId && !a.IsHost);
            BookingStatus newStatus;

            if (attendee == null)
            {
                newStatus = ResolveBookingStatus(activity);
                activity.Attendees.Add(new ActivityAttendee
                {
                    UserId = payment.UserId,
                    ActivityId = activity.Id,
                    IsHost = false,
                    Status = newStatus,
                    StatusUpdatedAt = DateTime.UtcNow,
                });
            }
            else
            {
                newStatus = ResolveBookingStatus(activity);
                attendee.Status = newStatus;
                attendee.StatusUpdatedAt = DateTime.UtcNow;
            }

            await paymentRepository.SaveChangesAsync(cancellationToken);

            var user = payment.User;
            if (user != null && !string.IsNullOrWhiteSpace(user.Email))
            {
                var hostName = activity.Attendees.FirstOrDefault(x => x.IsHost)?.User?.DisplayName;
                try
                {
                    await emailService.SendPaymentSuccessfulEmailAsync(
                        user.Email,
                        user.DisplayName ?? "User",
                        payment.Id,
                        activity.Id,
                        activity.Title,
                        activity.Date,
                        $"{activity.City}, {activity.Venue}",
                        hostName,
                        payment.Amount,
                        payment.Currency,
                        cancellationToken);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Payment email failed: {ex.Message}");
                }
            }

            var hostUserId = activity.Attendees.FirstOrDefault(x => x.IsHost)?.UserId;
            if (!string.IsNullOrWhiteSpace(hostUserId))
            {
                var actorName = user?.DisplayName ?? "Someone";
                var message = newStatus == BookingStatus.Approved
                    ? $"{actorName} booked a spot in {activity.Title}"
                    : newStatus == BookingStatus.Waitlisted
                        ? $"{actorName} paid for {activity.Title} and is waitlisted"
                        : $"{actorName} requested a booking for {activity.Title}";

                try
                {
                    await notificationService.NotifyAsync(new Notification
                    {
                        RecipientUserId = hostUserId,
                        ActorUserId = payment.UserId,
                        ActivityId = activity.Id,
                        Type = NotificationType.BookingSubmitted,
                        Message = message,
                    }, cancellationToken);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Host notification failed: {ex.Message}");
                }
            }

            return Result<Unit>.Success(Unit.Value);
        }

        private static BookingStatus ResolveBookingStatus(Activity activity)
        {
            var approvedCount = activity.Attendees.Count(x => !x.IsHost && x.Status == BookingStatus.Approved);
            var noSlotsLeft = approvedCount >= activity.MaxParticipants;

            if (noSlotsLeft) return BookingStatus.Waitlisted;

            return activity.RequiresHostConfirmation ? BookingStatus.Pending : BookingStatus.Approved;
        }
    }
}
