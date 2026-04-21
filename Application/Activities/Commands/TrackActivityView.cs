using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Commands;

public class TrackActivityView
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string ActivityId { get; set; }
    }

    public class Handler(IActivityRepository activityRepository, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();

            var activityExists = await activityRepository.Query()
                .AnyAsync(x => x.Id == request.ActivityId, cancellationToken);

            if (!activityExists)
            {
                return Result<Unit>.Failure("Activity not found", 404);
            }

            var existingView = await activityRepository.QueryViewHistory()
                .FirstOrDefaultAsync(x => x.UserId == userId && x.ActivityId == request.ActivityId, cancellationToken);

            if (existingView is null)
            {
                activityRepository.AddViewHistory(new ActivityViewHistory
                {
                    UserId = userId,
                    ActivityId = request.ActivityId,
                    ViewedAt = DateTime.UtcNow,
                });
            }
            else
            {
                existingView.ViewedAt = DateTime.UtcNow;
            }

            var saved = await activityRepository.SaveChangesAsync(cancellationToken) > 0;

            if (!saved)
            {
                return Result<Unit>.Failure("Failed to track activity view", 400);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
