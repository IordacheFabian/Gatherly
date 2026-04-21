using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Commands;

public class AddToWishlist
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

            if (string.IsNullOrWhiteSpace(wishlistName))
            {
                return Result<Unit>.Failure("Wishlist name is required", 400);
            }

            var activityExists = await activityRepository.Query()
                .AnyAsync(x => x.Id == request.ActivityId, cancellationToken);

            if (!activityExists)
            {
                return Result<Unit>.Failure("Activity not found", 404);
            }

            var exists = await activityRepository.QueryWishlistActivities()
                .AnyAsync(x =>
                    x.UserId == userId
                    && x.ActivityId == request.ActivityId
                    && x.WishlistName.ToLower() == wishlistName.ToLower(),
                    cancellationToken);

            if (exists)
            {
                return Result<Unit>.Success(Unit.Value);
            }

            activityRepository.AddWishlistActivity(new WishlistActivity
            {
                UserId = userId,
                ActivityId = request.ActivityId,
                WishlistName = wishlistName,
                AddedAt = DateTime.UtcNow,
            });

            var saved = await activityRepository.SaveChangesAsync(cancellationToken) > 0;

            if (!saved)
            {
                return Result<Unit>.Failure("Failed to add activity to wishlist", 400);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
