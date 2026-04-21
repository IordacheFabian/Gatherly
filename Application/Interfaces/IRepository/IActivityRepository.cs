using System;
using Domain;

namespace Application.Interfaces.IRepository;

public interface IActivityRepository
{
    IQueryable<Activity> Query();
    IQueryable<ActivityAttendee> QueryAttendances();
    IQueryable<Comment> QueryComments();
    IQueryable<SavedActivity> QuerySavedActivities();
    IQueryable<WishlistActivity> QueryWishlistActivities();
    IQueryable<ActivityViewHistory> QueryViewHistory();
    Task<Activity?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<Activity?> GetByIdWithAttendeesAsync(string id, CancellationToken cancellationToken);
    Task<Activity?> GetByIdWithCommentsAsync(string id, CancellationToken cancellationToken);
    Task AddAsync(Activity activity, CancellationToken cancellationToken);
    void AddSavedActivity(SavedActivity savedActivity);
    void RemoveSavedActivity(SavedActivity savedActivity);
    void AddWishlistActivity(WishlistActivity wishlistActivity);
    void RemoveWishlistActivity(WishlistActivity wishlistActivity);
    void AddViewHistory(ActivityViewHistory viewHistory);
    void Update(Activity activity);
    void Remove(Activity activity);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
