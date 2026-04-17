using System;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;

namespace Application.Activities.Commands;

public class UpdateAttendance
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
    }

    public class Handler(IUserAccessor userAccessor, IActivityRepository activityRepository) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await activityRepository
                .GetByIdWithAttendeesAsync(request.Id, cancellationToken);

            if (activity == null) return Result<Unit>.Failure("Activity not found", 404);

            var user = await userAccessor.GetUserAsync();

            var booking = activity.Attendees.FirstOrDefault(x => x.UserId == user.Id);
            var isHost = activity.Attendees.Any(x => x.IsHost && x.UserId == user.Id);

            if (isHost)
            {
                activity.IsCancelled = !activity.IsCancelled;
            }
            else
            {
                if (activity.IsCancelled)
                {
                    return Result<Unit>.Failure("Cannot request booking for a cancelled activity", 400);
                }

                if (activity.BookingDeadline.HasValue && DateTime.UtcNow > activity.BookingDeadline.Value)
                {
                    return Result<Unit>.Failure("Booking deadline has passed", 400);
                }

                if (booking == null)
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
                }
                else
                {
                    if (booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Waitlisted || booking.Status == BookingStatus.Approved)
                    {
                        var wasApproved = booking.Status == BookingStatus.Approved;
                        booking.Status = BookingStatus.Cancelled;
                        booking.StatusUpdatedAt = DateTime.UtcNow;

                        if (wasApproved)
                        {
                            PromoteWaitlist(activity);
                        }
                    }
                    else
                    {
                        booking.Status = ResolveRequestedStatus(activity);
                        booking.StatusUpdatedAt = DateTime.UtcNow;
                    }
                }
            }

            var result = await activityRepository.SaveChangesAsync(cancellationToken) > 0;

            return result ? Result<Unit>.Success(Unit.Value) : Result<Unit>.Failure("Failed to update attendance", 400);
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
