using Domain;

namespace Application.Interfaces.IRepository;

public interface INotificationRepository
{
    IQueryable<Notification> Query();
    Task<Notification?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task AddAsync(Notification notification, CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<Notification> notifications, CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
