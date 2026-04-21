using API.DTOs;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Queries;

public class GetSavedActivities
{
    public class Query : IRequest<Result<List<ActivityDto>>>
    {
    }

    public class Handler(IActivityRepository activityRepository, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<ActivityDto>>>
    {
        public async Task<Result<List<ActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();

            var activities = await activityRepository.QuerySavedActivities()
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.SavedAt)
                .Select(x => x.Activity)
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider,
                    new { currentUserId = userId })
                .ToListAsync(cancellationToken);

            return Result<List<ActivityDto>>.Success(activities);
        }
    }
}
