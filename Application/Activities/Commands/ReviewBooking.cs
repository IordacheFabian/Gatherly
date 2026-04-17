using Application.Core;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;

namespace Application.Activities.Commands;

public class ReviewBooking
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string ActivityId { get; set; }
        public required string UserId { get; set; }
        public required BookingStatus TargetStatus { get; set; }
    }

    public class Handler(IActivityRepository activityRepository) : IRequestHandler<Command, Result<Unit>>
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

            if (wasApproved && request.TargetStatus != BookingStatus.Approved)
            {
                PromoteWaitlist(activity);
            }

            var result = await activityRepository.SaveChangesAsync(cancellationToken) > 0;
            return result ? Result<Unit>.Success(Unit.Value) : Result<Unit>.Failure("Failed to review booking", 400);
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
