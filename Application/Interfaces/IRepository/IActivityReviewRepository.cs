using Domain;

namespace Application.Interfaces.IRepository;

public interface IActivityReviewRepository
{
    IQueryable<ActivityReview> Query();
    Task<ActivityReview?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task AddAsync(ActivityReview review, CancellationToken cancellationToken);
    void Update(ActivityReview review);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}