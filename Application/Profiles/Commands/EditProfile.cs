using System;
using Application.Core;
using Application.Interfaces;
using Application.Profiles.DTOs;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Commands;

public class EditProfile
{
    public class Command : IRequest<Result<Unit>>
    {
        public required EditProfileDto UserProfile { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();

            if (userId == null) return Result<Unit>.Failure("Profile not found", 404);

            var user = await context.Users.
                FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

            if (user == null) return Result<Unit>.Failure("Profile not found", 404);

            mapper.Map(request.UserProfile, user);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<Unit>.Failure("Failed to update the profile", 400);
            
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
