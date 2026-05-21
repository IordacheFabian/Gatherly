using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Payments.Commands;

public class CancelPendingPayment
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string ActivityId { get; set; }
    }

    public class Handler(
        IUserAccessor userAccessor,
        IPaymentRepository paymentRepository,
        IActivityRepository activityRepository) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserAsync();

            var payment = await paymentRepository.Query()
                .Where(p => p.ActivityId == request.ActivityId &&
                            p.UserId == user.Id &&
                            p.Status == PaymentStatus.Pending)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (payment == null)
                return Result<Unit>.Success(Unit.Value); // Nothing to cancel

            payment.Status = PaymentStatus.Failed;
            paymentRepository.Update(payment);

            var activity = await activityRepository.GetByIdWithAttendeesAsync(request.ActivityId, cancellationToken);
            if (activity != null)
            {
                var attendee = activity.Attendees.FirstOrDefault(a => a.UserId == user.Id && !a.IsHost);
                if (attendee?.Status == BookingStatus.Pending)
                {
                    attendee.Status = BookingStatus.Cancelled;
                    attendee.StatusUpdatedAt = DateTime.UtcNow;
                }
            }

            await paymentRepository.SaveChangesAsync(cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
