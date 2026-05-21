using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Commands;

public class ReviewBooking
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string ActivityId { get; set; }
        public required string UserId { get; set; }
        public required BookingStatus TargetStatus { get; set; }
    }

    public class Handler(
        IActivityRepository activityRepository,
        INotificationService notificationService,
        IPaymentRepository paymentRepository,
        IEmailService emailService) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            if (request.TargetStatus != BookingStatus.Approved && request.TargetStatus != BookingStatus.Rejected)
            {
                return Result<Unit>.Failure("Only approve or reject transitions are allowed", 400);
            }

            var activity = await activityRepository.GetByIdWithAttendeesAsync(request.ActivityId, cancellationToken);
            if (activity == null) return Result<Unit>.Failure("Activity not found", 404);

            var booking = activity.Attendees.FirstOrDefault(x => !x.IsHost && x.UserId == request.UserId);
            if (booking == null) return Result<Unit>.Failure("Booking request not found", 404);

            if (booking.Status == BookingStatus.Cancelled)
            {
                return Result<Unit>.Failure("Cannot review a cancelled booking", 400);
            }

            if (booking.Status == BookingStatus.Pending && activity.PriceAmount > 0)
            {
                return Result<Unit>.Failure("Cannot approve a booking that is awaiting payment", 400);
            }

            if (request.TargetStatus == BookingStatus.Approved)
            {
                var approvedCount = activity.Attendees.Count(x => !x.IsHost && x.Status == BookingStatus.Approved);
                if (booking.Status != BookingStatus.Approved && approvedCount >= activity.MaxParticipants)
                {
                    booking.Status = BookingStatus.Waitlisted;
                    booking.StatusUpdatedAt = DateTime.UtcNow;

                    var savedWaitlist = await activityRepository.SaveChangesAsync(cancellationToken) > 0;
                    return savedWaitlist
                        ? Result<Unit>.Failure("No slot available. Booking moved to waiting list.", 409)
                        : Result<Unit>.Failure("Failed to update booking", 400);
                }
            }

            var wasApproved = booking.Status == BookingStatus.Approved;
            booking.Status = request.TargetStatus;
            booking.StatusUpdatedAt = DateTime.UtcNow;

            if (request.TargetStatus == BookingStatus.Rejected && booking.UserId != null)
            {
                await TryRefundLatestPaymentAsync(paymentRepository, activity.Id, booking.UserId, cancellationToken);
            }

            if (wasApproved && request.TargetStatus != BookingStatus.Approved)
            {
                PromoteWaitlist(activity);
            }

            var result = await activityRepository.SaveChangesAsync(cancellationToken) > 0;
            if (!result)
            {
                return Result<Unit>.Failure("Failed to review booking", 400);
            }

            if (request.TargetStatus == BookingStatus.Approved || request.TargetStatus == BookingStatus.Rejected)
            {
                await notificationService.NotifyAsync(new Notification
                {
                    RecipientUserId = booking.UserId!,
                    ActivityId = activity.Id,
                    Type = request.TargetStatus == BookingStatus.Approved
                        ? NotificationType.BookingApproved
                        : NotificationType.BookingRejected,
                    Message = request.TargetStatus == BookingStatus.Approved
                        ? $"Your booking for {activity.Title} was approved"
                        : $"Your booking for {activity.Title} was rejected",
                }, cancellationToken);

                // Send approval/rejection emails
                if (booking.User?.Email != null)
                {
                    if (request.TargetStatus == BookingStatus.Approved)
                    {
                        var hostName = activity.Attendees
                            .FirstOrDefault(x => x.IsHost)?.User?.DisplayName;

                        await emailService.SendBookingApprovedEmailAsync(
                            booking.User.Email,
                            booking.User.DisplayName ?? "User",
                            activity.Id,
                            activity.Title,
                            activity.Date,
                            $"{activity.City}, {activity.Venue}",
                            hostName,
                            activity.PriceAmount > 0 ? activity.PriceAmount : null,
                            activity.Currency,
                            cancellationToken);
                    }
                    else
                    {
                        await emailService.SendBookingRejectedEmailAsync(
                            booking.User.Email,
                            booking.User.DisplayName ?? "User",
                            activity.Id,
                            activity.Title,
                            activity.Date,
                            $"{activity.City}, {activity.Venue}",
                            cancellationToken);
                    }
                }
            }

            return Result<Unit>.Success(Unit.Value);
        }

        private static async Task TryRefundLatestPaymentAsync(
            IPaymentRepository paymentRepository,
            string activityId,
            string userId,
            CancellationToken cancellationToken)
        {
            var payment = await paymentRepository.Query()
                .Where(x => x.ActivityId == activityId && x.UserId == userId && x.Status == PaymentStatus.Succeeded)
                .OrderByDescending(x => x.PaidAt ?? x.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (payment == null)
            {
                return;
            }

            payment.Status = PaymentStatus.Refunded;
            payment.RefundedAt = DateTime.UtcNow;
        }

        private static void PromoteWaitlist(Activity activity)
        {
            var approvedCount = activity.Attendees.Count(x => !x.IsHost && x.Status == BookingStatus.Approved);
            var freeSlots = activity.MaxParticipants - approvedCount;

            if (freeSlots <= 0)
            {
                return;
            }

            var waitlisted = activity.Attendees
                .Where(x => !x.IsHost && x.Status == BookingStatus.Waitlisted)
                .OrderBy(x => x.DateJoined)
                .Take(freeSlots)
                .ToList();

            foreach (var candidate in waitlisted)
            {
                candidate.Status = activity.RequiresHostConfirmation ? BookingStatus.Pending : BookingStatus.Approved;
                candidate.StatusUpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
