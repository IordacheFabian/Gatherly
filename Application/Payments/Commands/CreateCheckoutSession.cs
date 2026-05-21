using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Application.Payments.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Application.Payments.Commands;

public class CreateCheckoutSession
{
    public class Command : IRequest<Result<CheckoutSessionDto>>
    {
        public required string ActivityId { get; set; }
    }

    public class Handler(
        IUserAccessor userAccessor,
        IActivityRepository activityRepository,
        IPaymentRepository paymentRepository,
        IStripeService stripeService,
        IConfiguration configuration) : IRequestHandler<Command, Result<CheckoutSessionDto>>
    {
        public async Task<Result<CheckoutSessionDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserAsync();
            var activity = await activityRepository.GetByIdWithAttendeesAsync(request.ActivityId, cancellationToken);

            if (activity == null)
                return Result<CheckoutSessionDto>.Failure("Activity not found", 404);

            if (activity.Attendees.Any(x => x.IsHost && x.UserId == user.Id))
                return Result<CheckoutSessionDto>.Failure("Host does not need to pay for own activity", 400);

            if (activity.IsCancelled)
                return Result<CheckoutSessionDto>.Failure("Cannot book a cancelled activity", 400);

            if (activity.BookingDeadline.HasValue && DateTime.UtcNow > activity.BookingDeadline.Value)
                return Result<CheckoutSessionDto>.Failure("Booking deadline has passed", 400);

            if (activity.PriceAmount <= 0)
                return Result<CheckoutSessionDto>.Failure("This activity is free. Use regular booking.", 400);

            var existingBooking = activity.Attendees.FirstOrDefault(x => x.UserId == user.Id && !x.IsHost);
            if (existingBooking != null &&
                (existingBooking.Status == BookingStatus.Pending ||
                 existingBooking.Status == BookingStatus.Waitlisted ||
                 existingBooking.Status == BookingStatus.Approved))
                return Result<CheckoutSessionDto>.Failure("You already have an active booking", 409);

            var existingSucceeded = await paymentRepository.Query()
                .Where(x => x.ActivityId == activity.Id && x.UserId == user.Id && x.Status == PaymentStatus.Succeeded)
                .AnyAsync(cancellationToken);

            if (existingSucceeded)
                return Result<CheckoutSessionDto>.Failure("An active payment already exists for this booking", 409);

            var clientBaseUrl = configuration["AppSettings:ClientBaseUrl"] ?? "http://localhost:8080";
            var paymentId = Guid.NewGuid().ToString();

            var successUrl = $"{clientBaseUrl.TrimEnd('/')}/payment-success?session_id={{CHECKOUT_SESSION_ID}}";
            var cancelUrl = $"{clientBaseUrl.TrimEnd('/')}/payment-cancel?activityId={activity.Id}";

            StripeCheckoutResult stripeSession;
            try
            {
                stripeSession = await stripeService.CreateCheckoutSessionAsync(
                    internalPaymentId: paymentId,
                    activityId: activity.Id,
                    activityTitle: activity.Title,
                    amount: activity.PriceAmount,
                    currency: activity.Currency,
                    successUrl: successUrl,
                    cancelUrl: cancelUrl,
                    cancellationToken: cancellationToken);
            }
            catch (Exception ex)
            {
                return Result<CheckoutSessionDto>.Failure($"Payment provider error: {ex.Message}", 502);
            }

            var payment = new Payment
            {
                Id = paymentId,
                ActivityId = activity.Id,
                UserId = user.Id,
                Amount = activity.PriceAmount,
                Currency = activity.Currency,
                Provider = "Stripe",
                CheckoutSessionId = stripeSession.SessionId,
                CheckoutUrl = stripeSession.CheckoutUrl,
                InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}",
                ReceiptNumber = $"RCPT-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}",
                Status = PaymentStatus.Pending,
            };

            await paymentRepository.AddAsync(payment, cancellationToken);

            if (existingBooking == null)
            {
                activity.Attendees.Add(new ActivityAttendee
                {
                    UserId = user.Id,
                    ActivityId = activity.Id,
                    IsHost = false,
                    Status = BookingStatus.Pending,
                    StatusUpdatedAt = DateTime.UtcNow,
                });
            }
            else
            {
                existingBooking.Status = BookingStatus.Pending;
                existingBooking.StatusUpdatedAt = DateTime.UtcNow;
            }

            var saved = await paymentRepository.SaveChangesAsync(cancellationToken) > 0;
            if (!saved)
                return Result<CheckoutSessionDto>.Failure("Failed to create checkout session", 400);

            return Result<CheckoutSessionDto>.Success(new CheckoutSessionDto
            {
                PaymentId = payment.Id,
                CheckoutSessionId = payment.CheckoutSessionId,
                CheckoutUrl = payment.CheckoutUrl,
                Status = "pending",
            });
        }
    }
}
