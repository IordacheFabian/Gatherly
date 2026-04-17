using System;
using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces.IRepository;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Activities.Commands;

public class EditActivity
{
    public class Command : IRequest<Result<Unit>>
    {
        public required EditActivityDto ActivityDto { get; set; }
    }

    public class Handler(IActivityRepository activityRepository, IMapper mapper) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await activityRepository.GetByIdAsync(request.ActivityDto.Id, cancellationToken);

            if (activity == null) return Result<Unit>.Failure("Activity not found", 404);

            mapper.Map(request.ActivityDto, activity);

            activityRepository.Update(activity);

            var result = await activityRepository.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<Unit>.Failure("Failed to update the activity", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
