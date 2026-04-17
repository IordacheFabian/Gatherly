using API.SignalR;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Application.Notifications.DTOs;
using Domain;
using Microsoft.AspNetCore.SignalR;

namespace API.Services;

public class NotificationService(
    INotificationRepository notificationRepository,
    IHubContext<NotificationHub> hubContext) : INotificationService
{
    public async Task NotifyAsync(Notification notification, CancellationToken cancellationToken)
    {
        await notificationRepository.AddAsync(notification, cancellationToken);

        var saved = await notificationRepository.SaveChangesAsync(cancellationToken) > 0;
        if (!saved)
        {
            return;
        }

        await hubContext.Clients.Group(notification.RecipientUserId).SendAsync(
            "ReceiveNotification",
            ToDto(notification),
            cancellationToken);
    }

    public async Task NotifyManyAsync(IEnumerable<Notification> notifications, CancellationToken cancellationToken)
    {
        var buffered = notifications.ToList();
        if (buffered.Count == 0)
        {
            return;
        }

        await notificationRepository.AddRangeAsync(buffered, cancellationToken);

        var saved = await notificationRepository.SaveChangesAsync(cancellationToken) > 0;
        if (!saved)
        {
            return;
        }

        foreach (var notification in buffered)
        {
            await hubContext.Clients.Group(notification.RecipientUserId).SendAsync(
                "ReceiveNotification",
                ToDto(notification),
                cancellationToken);
        }
    }

    private static NotificationDto ToDto(Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            Type = notification.Type,
            Message = notification.Message,
            CreatedAt = notification.CreatedAt,
            IsRead = notification.IsRead,
            ActivityId = notification.ActivityId,
            CommentId = notification.CommentId,
        };
    }
}
