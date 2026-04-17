using Domain;

namespace Application.Interfaces;

public interface INotificationService
{
    Task NotifyAsync(Notification notification, CancellationToken cancellationToken);
    Task NotifyManyAsync(IEnumerable<Notification> notifications, CancellationToken cancellationToken);
}
