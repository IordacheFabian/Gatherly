using API.DTOs;
using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Queries;

public class GetWishlists
{
    public class Query : IRequest<Result<List<WishlistGroupDto>>>
    {
    }

    public class Handler(IActivityRepository activityRepository, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<WishlistGroupDto>>>
    {
        public async Task<Result<List<WishlistGroupDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();

            var wishlistItems = await activityRepository.QueryWishlistActivities()
                .Where(x => x.UserId == userId)
                .Select(x => new
                {
                    x.WishlistName,
                    x.ActivityId,
                    x.AddedAt,
                })
                .ToListAsync(cancellationToken);

            if (wishlistItems.Count == 0)
            {
                return Result<List<WishlistGroupDto>>.Success([]);
            }

            var activityIds = wishlistItems
                .Select(x => x.ActivityId)
                .Distinct()
                .ToList();

            var activities = await activityRepository.Query()
                .Where(x => activityIds.Contains(x.Id))
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider,
                    new { currentUserId = userId })
                .ToListAsync(cancellationToken);

            var activityById = activities.ToDictionary(x => x.Id, x => x);

            var groups = wishlistItems
                .GroupBy(x => x.WishlistName)
                .Select(group => new WishlistGroupDto
                {
                    Name = group.Key,
                    Activities = group
                        .OrderByDescending(x => x.AddedAt)
                        .Where(x => activityById.ContainsKey(x.ActivityId))
                        .Select(x => activityById[x.ActivityId])
                        .ToList(),
                })
                .OrderBy(x => x.Name)
                .ToList();

            return Result<List<WishlistGroupDto>>.Success(groups);
        }
    }
}
