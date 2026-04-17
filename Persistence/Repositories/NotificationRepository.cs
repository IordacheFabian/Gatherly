using Application.Interfaces.IRepository;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Repositories;

public class NotificationRepository(AppDbContext context) : INotificationRepository
{
    public IQueryable<Notification> Query()
    {
        return context.Notifications.AsQueryable();
    }

    public Task<Notification?> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        return context.Notifications.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task AddAsync(Notification notification, CancellationToken cancellationToken)
    {
        return context.Notifications.AddAsync(notification, cancellationToken).AsTask();
    }

    public Task AddRangeAsync(IEnumerable<Notification> notifications, CancellationToken cancellationToken)
    {
        return context.Notifications.AddRangeAsync(notifications, cancellationToken);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
    {
        return context.SaveChangesAsync(cancellationToken);
    }
}
