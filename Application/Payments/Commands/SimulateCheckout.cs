using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Application.Payments.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Payments.Commands;

public class SimulateCheckout
{
    public class Command : IRequest<Result<CheckoutSessionDto>>
    {
        public required string ActivityId { get; set; }
    }

    public class Handler(
        IUserAccessor userAccessor,
        IActivityRepository activityRepository,
        IPaymentRepository paymentRepository,
        INotificationService notificationService,
        IEmailService emailService) : IRequestHandler<Command, Result<CheckoutSessionDto>>
    {
        public async Task<Result<CheckoutSessionDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserAsync();
            var activity = await activityRepository.GetByIdWithAttendeesAsync(request.ActivityId, cancellationToken);

            if (activity == null)
            {
                return Result<CheckoutSessionDto>.Failure("Activity not found", 404);
            }

            var isHost = activity.Attendees.Any(x => x.IsHost && x.UserId == user.Id);
            if (isHost)
            {
                return Result<CheckoutSessionDto>.Failure("Host does not need to pay for own activity", 400);
            }

            if (activity.IsCancelled)
            {
                return Result<CheckoutSessionDto>.Failure("Cannot book a cancelled activity", 400);
            }

            if (activity.BookingDeadline.HasValue && DateTime.UtcNow > activity.BookingDeadline.Value)
            {
                return Result<CheckoutSessionDto>.Failure("Booking deadline has passed", 400);
            }

            if (activity.PriceAmount <= 0)
            {
                return Result<CheckoutSessionDto>.Failure("This activity is free. Use regular booking.", 400);
            }

            var existingBooking = activity.Attendees.FirstOrDefault(x => x.UserId == user.Id && !x.IsHost);
            if (existingBooking != null &&
                (existingBooking.Status == BookingStatus.Pending ||
                 existingBooking.Status == BookingStatus.Waitlisted ||
                 existingBooking.Status == BookingStatus.Approved))
            {
                return Result<CheckoutSessionDto>.Failure("You already have an active booking", 409);
            }

            var existingUnrefunded = await paymentRepository.Query()
                .Where(x => x.ActivityId == activity.Id && x.UserId == user.Id && x.Status == PaymentStatus.Succeeded)
                .AnyAsync(cancellationToken);

            if (existingUnrefunded)
            {
                return Result<CheckoutSessionDto>.Failure("An active payment already exists for this booking", 409);
            }

            var sessionId = $"cs_test_{Guid.NewGuid():N}";
            var payment = new Payment
            {
                ActivityId = activity.Id,
                UserId = user.Id,
                Amount = activity.PriceAmount,
                Currency = activity.Currency,
                Provider = "StripeMock",
                CheckoutSessionId = sessionId,
                CheckoutUrl = $"https://checkout.stripe.com/pay/{sessionId}",
                InvoiceNumber = BuildInvoiceNumber(),
                ReceiptNumber = BuildReceiptNumber(),
                Status = PaymentStatus.Succeeded,
                PaidAt = DateTime.UtcNow,
            };

            await paymentRepository.AddAsync(payment, cancellationToken);
            BookingStatus? hostNotificationStatus = null;

            if (existingBooking == null)
            {
                var newStatus = ResolveRequestedStatus(activity);
                activity.Attendees.Add(new ActivityAttendee
                {
                    UserId = user.Id,
                    ActivityId = activity.Id,
                    IsHost = false,
                    Status = newStatus,
                    StatusUpdatedAt = DateTime.UtcNow,
                });
                hostNotificationStatus = newStatus;
            }
            else
            {
                var newStatus = ResolveRequestedStatus(activity);
                existingBooking.Status = newStatus;
                existingBooking.StatusUpdatedAt = DateTime.UtcNow;
                hostNotificationStatus = newStatus;
            }

            var saved = await paymentRepository.SaveChangesAsync(cancellationToken) > 0;
            if (!saved)
            {
                return Result<CheckoutSessionDto>.Failure("Failed to complete mock checkout", 400);
            }

            // Send payment success email
            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                var hostName = activity.Attendees.FirstOrDefault(x => x.IsHost)?.User?.DisplayName;
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

            if (hostNotificationStatus.HasValue)
            {
                await NotifyHostBookingSubmissionAsync(
                    notificationService,
                    activity,
                    user,
                    hostNotificationStatus.Value,
                    cancellationToken);
            }

            return Result<CheckoutSessionDto>.Success(new CheckoutSessionDto
            {
                PaymentId = payment.Id,
                CheckoutSessionId = payment.CheckoutSessionId,
                CheckoutUrl = payment.CheckoutUrl,
                Status = "succeeded",
            });
        }

        private static BookingStatus ResolveRequestedStatus(Activity activity)
        {
            var approvedCount = activity.Attendees.Count(x => !x.IsHost && x.Status == BookingStatus.Approved);
            var noSlotsLeft = approvedCount >= activity.MaxParticipants;

            if (noSlotsLeft)
            {
                return BookingStatus.Waitlisted;
            }

            return activity.RequiresHostConfirmation ? BookingStatus.Pending : BookingStatus.Approved;
        }

        private static string BuildInvoiceNumber()
        {
            return $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
        }

        private static string BuildReceiptNumber()
        {
            return $"RCPT-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
        }

        private static async Task NotifyHostBookingSubmissionAsync(
            INotificationService notificationService,
            Activity activity,
            User user,
            BookingStatus status,
            CancellationToken cancellationToken)
        {
            var hostUserId = activity.Attendees.FirstOrDefault(x => x.IsHost)?.UserId;
            if (string.IsNullOrWhiteSpace(hostUserId))
            {
                return;
            }

            var actorName = string.IsNullOrWhiteSpace(user.DisplayName) ? "Someone" : user.DisplayName;
            var message = status == BookingStatus.Approved
                ? $"{actorName} booked a spot in {activity.Title}"
                : status == BookingStatus.Waitlisted
                    ? $"{actorName} requested a booking for {activity.Title} and is now waitlisted"
                    : $"{actorName} requested a booking for {activity.Title}";

            await notificationService.NotifyAsync(new Notification
            {
                RecipientUserId = hostUserId,
                ActorUserId = user.Id,
                ActivityId = activity.Id,
                Type = NotificationType.BookingSubmitted,
                Message = message,
            }, cancellationToken);
        }
    }
}