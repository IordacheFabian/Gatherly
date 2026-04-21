using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Commands;

public class ToggleSavedActivity
{
    public class Command : IRequest<Result<SavedActivityToggleResultDto>>
    {
        public required string ActivityId { get; set; }
    }

    public class Handler(IActivityRepository activityRepository, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<SavedActivityToggleResultDto>>
    {
        public async Task<Result<SavedActivityToggleResultDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();

            var activityExists = await activityRepository.Query()
                .AnyAsync(x => x.Id == request.ActivityId, cancellationToken);

            if (!activityExists)
            {
                return Result<SavedActivityToggleResultDto>.Failure("Activity not found", 404);
            }

            var existingSaved = await activityRepository.QuerySavedActivities()
                .FirstOrDefaultAsync(x => x.UserId == userId && x.ActivityId == request.ActivityId, cancellationToken);

            var isSaved = false;
            if (existingSaved is null)
            {
                activityRepository.AddSavedActivity(new SavedActivity
                {
                    UserId = userId,
                    ActivityId = request.ActivityId,
                    SavedAt = DateTime.UtcNow,
                });
                isSaved = true;
            }
            else
            {
                activityRepository.RemoveSavedActivity(existingSaved);
            }

            var saved = await activityRepository.SaveChangesAsync(cancellationToken) > 0;

            if (!saved)
            {
                return Result<SavedActivityToggleResultDto>.Failure("Failed to update saved activities", 400);
            }

            return Result<SavedActivityToggleResultDto>.Success(new SavedActivityToggleResultDto
            {
                IsSaved = isSaved,
            });
        }
    }
}
