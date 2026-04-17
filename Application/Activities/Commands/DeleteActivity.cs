using System;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using MediatR;

namespace Application.Activities.Commands;

public class DeleteActivity
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
    }

    public class Handler(IActivityRepository activityRepository, IPhotoService photoService) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await activityRepository.GetByIdAsync(request.Id, cancellationToken);

            if (activity == null) return Result<Unit>.Failure("Activity not found", 404);

            if (!string.IsNullOrWhiteSpace(activity.ImagePublicId))
            {
                await photoService.DeletePhoto(activity.ImagePublicId);
            }


            activityRepository.Remove(activity);

            var result = await activityRepository.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<Unit>.Failure("Failed to delete the activity", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
