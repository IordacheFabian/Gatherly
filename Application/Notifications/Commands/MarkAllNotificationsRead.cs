using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Notifications.Commands;

public class MarkAllNotificationsRead
{
    public class Command : IRequest<Result<Unit>>
    {
    }

    public class Handler(
        INotificationRepository notificationRepository,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();

            var unread = await notificationRepository.Query()
                .Where(x => x.RecipientUserId == userId && !x.IsRead)
                .ToListAsync(cancellationToken);

            foreach (var item in unread)
            {
                item.IsRead = true;
            }

            var saved = unread.Count == 0 || await notificationRepository.SaveChangesAsync(cancellationToken) > 0;
            return saved
                ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Failed to mark notifications as read", 400);
        }
    }
}
