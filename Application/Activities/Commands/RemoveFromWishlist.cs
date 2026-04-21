using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Commands;

public class RemoveFromWishlist
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string ActivityId { get; set; }
        public required string WishlistName { get; set; }
    }

    public class Handler(IActivityRepository activityRepository, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();
            var wishlistName = request.WishlistName.Trim();

            var wishlistActivity = await activityRepository.QueryWishlistActivities()
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId
                    && x.ActivityId == request.ActivityId
                    && x.WishlistName.ToLower() == wishlistName.ToLower(),
                    cancellationToken);

            if (wishlistActivity is null)
            {
                return Result<Unit>.Success(Unit.Value);
            }

            activityRepository.RemoveWishlistActivity(wishlistActivity);

            var saved = await activityRepository.SaveChangesAsync(cancellationToken) > 0;

            if (!saved)
            {
                return Result<Unit>.Failure("Failed to remove activity from wishlist", 400);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
