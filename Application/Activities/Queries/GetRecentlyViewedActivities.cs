using API.DTOs;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Queries;

public class GetRecentlyViewedActivities
{
    public class Query : IRequest<Result<List<ActivityDto>>>
    {
        public int Limit { get; set; } = 20;
    }

    public class Handler(IActivityRepository activityRepository, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<ActivityDto>>>
    {
        public async Task<Result<List<ActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();

            var limit = request.Limit <= 0 ? 20 : Math.Min(request.Limit, 100);

            var activities = await activityRepository.QueryViewHistory()
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.ViewedAt)
                .Take(limit)
                .Select(x => x.Activity)
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider,
                    new { currentUserId = userId })
                .ToListAsync(cancellationToken);

            return Result<List<ActivityDto>>.Success(activities);
        }
    }
}
