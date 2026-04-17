using System;
using Application.Core;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Profiles.Queries;

public class GetProfilePhotos
{
    public class Query : IRequest<Result<List<Photo>>>
    {
        public required string UserId { get; set; }
    }

    public class Handler(IProfileRepository profileRepository) : IRequestHandler<Query, Result<List<Photo>>>
    {
        public async Task<Result<List<Photo>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var photos = await profileRepository.QueryUsers()
                .Where(x => x.Id == request.UserId)
                .SelectMany(x => x.Photos)
                .ToListAsync(cancellationToken);
            
            return Result<List<Photo>>.Success(photos);
        }
    }
}
