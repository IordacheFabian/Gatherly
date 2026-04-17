using System;
using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces.IRepository;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Queries;

public class GetComments
{
    public class Query : IRequest<Result<List<CommentDto>>>
    {
        public required string ActivityId { get; set; }
    }

    public class Handler(IActivityRepository activityRepository, IMapper mapper)
        : IRequestHandler<Query, Result<List<CommentDto>>>
    {
        public async Task<Result<List<CommentDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var comments = await activityRepository.QueryComments()
                .Where(x => x.ActivityId == request.ActivityId)
                .OrderByDescending(x => x.CreatedAt)
                .ProjectTo<CommentDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<CommentDto>>.Success(comments);
        }
    }
}
