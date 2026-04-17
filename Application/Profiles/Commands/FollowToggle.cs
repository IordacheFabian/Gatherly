using System;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using MediatR;

namespace Application.Profiles.Commands;

public class FollowToggle
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string TargetUserId { get; set; }
    }

    public class Handler(IProfileRepository profileRepository, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var observer = await userAccessor.GetUserAsync();
            var target = await profileRepository.GetUserByIdAsync(request.TargetUserId, cancellationToken);

            if (target == null) return Result<Unit>.Failure("Target user not found", 400);

            var following = await profileRepository.GetFollowingAsync(observer.Id, target.Id, cancellationToken);

            if (following == null)
            {
                profileRepository.AddFollowing(new Domain.UserFollowing
                {
                    ObserverId = observer.Id,
                    TargetId = target.Id
                });
            }
            else
            {
                profileRepository.RemoveFollowing(following);
            }

            return await profileRepository.SaveChangesAsync(cancellationToken) > 0
                ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Failed to update following", 400);
        }
    }
}
