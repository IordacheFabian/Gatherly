using API.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Queries;

public class GetUserActivities
{
    public class Query : IRequest<Result<List<ActivityDto>>>
    {
        public required string UserId { get; set; }
        public string Predicate { get; set; } = "future";
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<ActivityDto>>>
    {
        public async Task<Result<List<ActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = context.Activities
                .OrderBy(x => x.Date)
                .AsQueryable();

            query = request.Predicate switch
            {
                "hosting" => query.Where(x => x.Attendees.Any(a => a.UserId == request.UserId && a.IsHost)),
                "past" => query.Where(x => x.Attendees.Any(a => a.UserId == request.UserId) && x.Date < DateTime.UtcNow),
                _ => query.Where(x => x.Attendees.Any(a => a.UserId == request.UserId) && x.Date >= DateTime.UtcNow),
            };

            var activities = await query
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider,
                    new { currentUserId = userAccessor.GetUserIdOrNull() })
                .ToListAsync(cancellationToken);

            return Result<List<ActivityDto>>.Success(activities);
        }
    }
}