using System;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using MediatR;

namespace Application.Profiles.Commands;

public class DeletePhoto
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string PhotoId { get; set; }
    }

    public class Handler(IProfileRepository profileRepository, IUserAccessor userAccessor, IPhotoService photoService)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserWithPhotosAsync();

            var photo = user.Photos.FirstOrDefault(x => x.Id == request.PhotoId);

            if (photo == null) return Result<Unit>.Failure("Photo not found", 400);

            if (photo.Url == user.ImageUrl) return Result<Unit>.Failure("You cannot delete your` main photo", 400);

            await photoService.DeletePhoto(photo.PublicId);

            user.Photos.Remove(photo);
            profileRepository.RemovePhoto(photo);

            var result = await profileRepository.SaveChangesAsync(cancellationToken) > 0;

            return result
                ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Problem deleting photo", 500);

        }
    }
}
