using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Application.Notifications.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Notifications.Queries;

public class GetNotifications
{
    public class Query : IRequest<Result<List<NotificationDto>>>
    {
        public int Limit { get; set; } = 50;
    }

    public class Handler(
        INotificationRepository notificationRepository,
        IActivityRepository activityRepository,
        IUserAccessor userAccessor,
        IMapper mapper) : IRequestHandler<Query, Result<List<NotificationDto>>>
    {
        public async Task<Result<List<NotificationDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();
            var now = DateTime.UtcNow;
            var sevenDaysAhead = now.AddDays(7);

            var existingReminderActivityIds = await notificationRepository.Query()
                .Where(x => x.RecipientUserId == userId && x.Type == NotificationType.ActivityReminder && x.ActivityId != null)
                .Select(x => x.ActivityId!)
                .ToListAsync(cancellationToken);

            var upcomingAttendances = await activityRepository.QueryAttendances()
                .Where(x =>
                    x.UserId == userId &&
                    !x.IsHost &&
                    x.ActivityId != null &&
                    x.Status != BookingStatus.Cancelled &&
                    x.Status != BookingStatus.Rejected &&
                    !x.Activity.IsCancelled &&
                    x.Activity.Date >= now &&
                    x.Activity.Date <= sevenDaysAhead)
                .Select(x => new
                {
                    x.ActivityId,
                    x.Activity.Title,
                    x.Activity.Date,
                })
                .ToListAsync(cancellationToken);

            var remindersToCreate = upcomingAttendances
                .Where(x => x.ActivityId != null && !existingReminderActivityIds.Contains(x.ActivityId))
                .Select(x => new Notification
                {
                    RecipientUserId = userId,
                    ActivityId = x.ActivityId,
                    Type = NotificationType.ActivityReminder,
                    Message = $"Reminder: {x.Title} starts on {x.Date:yyyy-MM-dd HH:mm} UTC",
                })
                .ToList();

            if (remindersToCreate.Count > 0)
            {
                await notificationRepository.AddRangeAsync(remindersToCreate, cancellationToken);
                await notificationRepository.SaveChangesAsync(cancellationToken);
            }

            var items = await notificationRepository.Query()
                .Where(x => x.RecipientUserId == userId)
                .OrderBy(x => x.IsRead)
                .ThenByDescending(x => x.CreatedAt)
                .Take(Math.Clamp(request.Limit, 1, 200))
                .ProjectTo<NotificationDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<NotificationDto>>.Success(items);
        }
    }
}
