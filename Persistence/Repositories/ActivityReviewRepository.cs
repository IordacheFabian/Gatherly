using Application.Interfaces.IRepository;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Repositories;

public class ActivityReviewRepository(AppDbContext context) : IActivityReviewRepository
{
    public IQueryable<ActivityReview> Query()
    {
        return context.ActivityReviews.AsQueryable();
    }

    public Task<ActivityReview?> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        return context.ActivityReviews.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task AddAsync(ActivityReview review, CancellationToken cancellationToken)
    {
        return context.ActivityReviews.AddAsync(review, cancellationToken).AsTask();
    }

    public void Update(ActivityReview review)
    {
        context.ActivityReviews.Update(review);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
    {
        return context.SaveChangesAsync(cancellationToken);
    }
}