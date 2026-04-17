using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using MediatR;

namespace Application.Notifications.Commands;

public class MarkNotificationRead
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
    }

    public class Handler(
        INotificationRepository notificationRepository,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();
            var notification = await notificationRepository.GetByIdAsync(request.Id, cancellationToken);

            if (notification == null || notification.RecipientUserId != userId)
            {
                return Result<Unit>.Failure("Notification not found", 404);
            }

            if (notification.IsRead)
            {
                return Result<Unit>.Success(Unit.Value);
            }

            notification.IsRead = true;

            var saved = await notificationRepository.SaveChangesAsync(cancellationToken) > 0;
            return saved
                ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Failed to mark notification as read", 400);
        }
    }
}
