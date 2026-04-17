using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Application.Profiles.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Activities.Commands;

public class UploadActivityPhoto
{
    public class Command : IRequest<Result<PhotoUploadResult>>
    {
        public required string ActivityId { get; set; }
        public required IFormFile File { get; set; }
    }

    public class Handler(IActivityRepository activityRepository, IPhotoService photoService)
        : IRequestHandler<Command, Result<PhotoUploadResult>>
    {
        public async Task<Result<PhotoUploadResult>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await activityRepository.GetByIdAsync(request.ActivityId, cancellationToken);

            if (activity == null) return Result<PhotoUploadResult>.Failure("Activity not found", 404);

            if (!string.IsNullOrWhiteSpace(activity.ImagePublicId))
            {
                await photoService.DeletePhoto(activity.ImagePublicId);
            }

            var uploadResult = await photoService.UploadPhoto(request.File);

            if (uploadResult == null) return Result<PhotoUploadResult>.Failure("Unable to upload photo", 400);

            activity.ImageUrl = uploadResult.Url;
            activity.ImagePublicId = uploadResult.PublicId;

            var result = await activityRepository.SaveChangesAsync(cancellationToken) > 0;

            return result
                ? Result<PhotoUploadResult>.Success(uploadResult)
                : Result<PhotoUploadResult>.Failure("Failed to save activity photo", 400);
        }
    }
}