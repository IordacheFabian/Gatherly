using System;
using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;

namespace Application.Activities.Commands;

public class CreateActivity
{
    public class Command : IRequest<Result<string>>
    {
        public required CreateActivityDto ActivityDto { get; set; }
    }

    public class Handler(IActivityRepository activityRepository, IMapper mapper, IUserAccessor userAccessor)
            : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserAsync();   

            var activity = mapper.Map<Activity>(request.ActivityDto);

            await activityRepository.AddAsync(activity, cancellationToken);

            var attendee = new ActivityAttendee
            {
                ActivityId = activity.Id,
                UserId = user.Id,
                IsHost = true,
                Status = BookingStatus.Approved,
                StatusUpdatedAt = DateTime.UtcNow,
            };

            activity.Attendees.Add(attendee);

            var result = await activityRepository.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<string>.Failure("Failed to create activity", 400);

            return Result<string>.Success(activity.Id);
        }
    }
}
