using System;
using API.DTOs;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Queries;

public class GetActivityList
{
    private const int MaxPageSize = 50;

    public class Query : IRequest<Result<PageList<ActivityDto, DateTime?>>>
    {
        public DateTime? Cursor { get; set; }
        private int _pageSize = 3;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }
    }

    public class Handler(IActivityRepository activityRepository, IMapper mapper, IUserAccessor userAccessor) : 
        IRequestHandler<Query, Result<PageList<ActivityDto, DateTime?>>>
    {
        public async Task<Result<PageList<ActivityDto, DateTime?>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = activityRepository.Query()
                .OrderBy(x => x.Date)
                .AsQueryable();
            
            if(request.Cursor.HasValue)
            {
                query = query.Where(x => x.Date >= request.Cursor.Value);
            }

            var activities = await query
                .Take(request.PageSize + 1)
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider,
                    new { currentUserId = userAccessor.GetUserIdOrNull()})
                .ToListAsync(cancellationToken);

            DateTime? nextCursor = null;
            if(activities.Count > request.PageSize)
            {
                nextCursor = activities.Last().Date;
                activities.RemoveAt(activities.Count - 1);
            }

            return Result<PageList<ActivityDto, DateTime?>>.Success (
                new PageList<ActivityDto, DateTime?>
                {
                    Items = activities,
                    NextCursor = nextCursor
                }
            );
        }
    }
}