using System;
using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Activities.Commands;

public class AddComment
{
    public class Command : IRequest<Result<CommentDto>>
    {
        public required string Body { get; set; }
        public required string ActivityId { get; set; }
        public string? ParentCommentId { get; set; }
    }

    public class Handler(
        IActivityRepository activityRepository,
        IMapper mapper,
        IUserAccessor userAccessor,
        INotificationService notificationService)
        : IRequestHandler<Command, Result<CommentDto>>
    {
        public async Task<Result<CommentDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await activityRepository
                .GetByIdWithCommentsAsync(request.ActivityId, cancellationToken);

            if (activity == null) return Result<CommentDto>.Failure("Activity not found", 404);

            var user = await userAccessor.GetUserAsync();
            var parentComment = string.IsNullOrEmpty(request.ParentCommentId)
                ? null
                : activity.Comments.FirstOrDefault(x => x.Id == request.ParentCommentId);

            if (!string.IsNullOrEmpty(request.ParentCommentId) && parentComment == null)
            {
                return Result<CommentDto>.Failure("Parent comment not found", 404);
            }

            var comment = new Comment
            {
                UserId = user.Id,
                ActivityId = activity.Id,
                Body = request.Body,
                ParentCommentId = request.ParentCommentId,
            };

            activity.Comments.Add(comment);

            var result = await activityRepository.SaveChangesAsync(cancellationToken) > 0;

            if (result && parentComment != null && parentComment.UserId != user.Id)
            {
                await notificationService.NotifyAsync(new Notification
                {
                    RecipientUserId = parentComment.UserId,
                    ActorUserId = user.Id,
                    ActivityId = activity.Id,
                    CommentId = comment.Id,
                    Type = NotificationType.CommentReply,
                    Message = $"{user.DisplayName} replied to your comment in {activity.Title}",
                }, cancellationToken);
            }

            return result
                ? Result<CommentDto>.Success(mapper.Map<CommentDto>(comment))
                : Result<CommentDto>.Failure("Failed to add comment", 400);
        }
    }
}
