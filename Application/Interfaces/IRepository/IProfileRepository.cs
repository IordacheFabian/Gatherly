using Domain;

namespace Application.Interfaces.IRepository;

public interface IProfileRepository
{
    IQueryable<User> QueryUsers();
    IQueryable<UserFollowing> QueryFollowings();
    Task<User?> GetUserByIdAsync(string userId, CancellationToken cancellationToken);
    Task<UserFollowing?> GetFollowingAsync(string observerId, string targetId, CancellationToken cancellationToken);
    void AddPhoto(Photo photo);
    void RemovePhoto(Photo photo);
    void AddFollowing(UserFollowing following);
    void RemoveFollowing(UserFollowing following);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
