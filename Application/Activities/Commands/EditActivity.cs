using System;
using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Activities.Commands;

public class EditActivity
{
    public class Command : IRequest<Result<Unit>>
    {
        public required EditActivityDto ActivityDto { get; set; }
    }

    public class Handler(
        IActivityRepository activityRepository,
        IMapper mapper,
        INotificationService notificationService) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await activityRepository.GetByIdWithAttendeesAsync(request.ActivityDto.Id, cancellationToken);

            if (activity == null) return Result<Unit>.Failure("Activity not found", 404);

            var oldDate = activity.Date;

            mapper.Map(request.ActivityDto, activity);

            activityRepository.Update(activity);

            var result = await activityRepository.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<Unit>.Failure("Failed to update the activity", 400);

            var dateChanged = oldDate != activity.Date;
            if (dateChanged)
            {
                var notifications = activity.Attendees
                    .Where(x => !x.IsHost && x.UserId != null && x.Status != BookingStatus.Cancelled && x.Status != BookingStatus.Rejected)
                    .Select(x => new Notification
                    {
                        RecipientUserId = x.UserId!,
                        ActivityId = activity.Id,
                        Type = NotificationType.ActivityDateChanged,
                        Message = $"{activity.Title} date changed to {activity.Date:yyyy-MM-dd HH:mm} UTC",
                    })
                    .ToList();

                await notificationService.NotifyManyAsync(notifications, cancellationToken);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
