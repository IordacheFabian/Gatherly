using Application.Interfaces.IRepository;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Repositories;

public class ProfileRepository(AppDbContext context) : IProfileRepository
{
    public IQueryable<User> QueryUsers()
    {
        return context.Users.AsQueryable();
    }

    public IQueryable<UserFollowing> QueryFollowings()
    {
        return context.UserFollowings.AsQueryable();
    }

    public Task<User?> GetUserByIdAsync(string userId, CancellationToken cancellationToken)
    {
        return context.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);
    }

    public Task<UserFollowing?> GetFollowingAsync(string observerId, string targetId, CancellationToken cancellationToken)
    {
        return context.UserFollowings
            .FirstOrDefaultAsync(x => x.ObserverId == observerId && x.TargetId == targetId, cancellationToken);
    }

    public void AddPhoto(Photo photo)
    {
        context.Photos.Add(photo);
    }

    public void RemovePhoto(Photo photo)
    {
        context.Photos.Remove(photo);
    }

    public void AddFollowing(UserFollowing following)
    {
        context.UserFollowings.Add(following);
    }

    public void RemoveFollowing(UserFollowing following)
    {
        context.UserFollowings.Remove(following);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
    {
        return context.SaveChangesAsync(cancellationToken);
    }
}
