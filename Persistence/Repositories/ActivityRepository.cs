using System;
using Application.Interfaces.IRepository;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Repositories;

public class ActivityRepository(AppDbContext context) : IActivityRepository
{
    public IQueryable<Activity> Query()
    {
        return context.Activities.AsQueryable();
    }

    public IQueryable<ActivityAttendee> QueryAttendances()
    {
        return context.ActivityAttendees.AsQueryable();
    }

    public IQueryable<Comment> QueryComments()
    {
        return context.Comments.AsQueryable();
    }

    public IQueryable<SavedActivity> QuerySavedActivities()
    {
        return context.SavedActivities.AsQueryable();
    }

    public IQueryable<WishlistActivity> QueryWishlistActivities()
    {
        return context.WishlistActivities.AsQueryable();
    }

    public IQueryable<ActivityViewHistory> QueryViewHistory()
    {
        return context.ActivityViewHistory.AsQueryable();
    }

    public Task<Activity?> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        return context.Activities.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task<Activity?> GetByIdWithAttendeesAsync(string id, CancellationToken cancellationToken)
    {
        return context.Activities
            .Include(x => x.Attendees)
            .ThenInclude(x => x.User)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task<Activity?> GetByIdWithCommentsAsync(string id, CancellationToken cancellationToken)
    {
        return context.Activities
            .Include(x => x.Comments)
            .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task AddAsync(Activity activity, CancellationToken cancellationToken)
    {
        await context.Activities.AddAsync(activity, cancellationToken);
    }

    public void AddSavedActivity(SavedActivity savedActivity)
    {
        context.SavedActivities.Add(savedActivity);
    }

    public void RemoveSavedActivity(SavedActivity savedActivity)
    {
        context.SavedActivities.Remove(savedActivity);
    }

    public void AddWishlistActivity(WishlistActivity wishlistActivity)
    {
        context.WishlistActivities.Add(wishlistActivity);
    }

    public void RemoveWishlistActivity(WishlistActivity wishlistActivity)
    {
        context.WishlistActivities.Remove(wishlistActivity);
    }

    public void AddViewHistory(ActivityViewHistory viewHistory)
    {
        context.ActivityViewHistory.Add(viewHistory);
    }

    public void Update(Activity activity)
    {
        context.Activities.Update(activity);
    }

    public void Remove(Activity activity)
    {
        context.Activities.Remove(activity);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
    {
        return context.SaveChangesAsync(cancellationToken);
    }
}
