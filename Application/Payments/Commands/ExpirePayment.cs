using Application.Core;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Payments.Commands;

public class ExpirePayment
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string CheckoutSessionId { get; set; }
    }

    public class Handler(
        IPaymentRepository paymentRepository,
        IActivityRepository activityRepository) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var payment = await paymentRepository.Query()
                .FirstOrDefaultAsync(p => p.CheckoutSessionId == request.CheckoutSessionId, cancellationToken);

            if (payment == null)
                return Result<Unit>.Success(Unit.Value); // Nothing to do

            if (payment.Status == PaymentStatus.Succeeded)
                return Result<Unit>.Success(Unit.Value); // Already succeeded, ignore

            payment.Status = PaymentStatus.Failed;
            paymentRepository.Update(payment);

            var activity = await activityRepository.GetByIdWithAttendeesAsync(payment.ActivityId, cancellationToken);
            if (activity != null)
            {
                var attendee = activity.Attendees.FirstOrDefault(a => a.UserId == payment.UserId && !a.IsHost);
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
