using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Application.Payments.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Payments.Queries;

public class GetPaymentReceipt
{
    public class Query : IRequest<Result<PaymentReceiptDto>>
    {
        public required string PaymentId { get; set; }
    }

    public class Handler(
        IUserAccessor userAccessor,
        IPaymentRepository paymentRepository) : IRequestHandler<Query, Result<PaymentReceiptDto>>
    {
        public async Task<Result<PaymentReceiptDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserAsync();

            var payment = await paymentRepository.Query()
                .Where(x => x.Id == request.PaymentId)
                .Select(x => new
                {
                    x.Id,
                    x.UserId,
                    x.InvoiceNumber,
                    x.ReceiptNumber,
                    x.CheckoutSessionId,
                    x.Provider,
                    x.ActivityId,
                    ActivityTitle = x.Activity.Title,
                    ActivityDate = x.Activity.Date,
                    x.Activity.Venue,
                    x.Activity.City,
                    x.Amount,
                    x.Currency,
                    x.Status,
                    x.CreatedAt,
                    x.PaidAt,
                    x.RefundedAt,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (payment == null)
            {
                return Result<PaymentReceiptDto>.Failure("Payment not found", 404);
            }

            if (payment.UserId != user.Id)
            {
                return Result<PaymentReceiptDto>.Failure("Payment not found", 404);
            }

            return Result<PaymentReceiptDto>.Success(new PaymentReceiptDto
            {
                PaymentId = payment.Id,
                InvoiceNumber = payment.InvoiceNumber,
                ReceiptNumber = payment.ReceiptNumber,
                CheckoutSessionId = payment.CheckoutSessionId,
                Provider = payment.Provider,
                ActivityId = payment.ActivityId,
                ActivityTitle = payment.ActivityTitle,
                ActivityDate = payment.ActivityDate,
                Venue = payment.Venue,
                City = payment.City,
                Amount = payment.Amount,
                Currency = payment.Currency,
                Status = payment.Status,
                CreatedAt = payment.CreatedAt,
                PaidAt = payment.PaidAt,
                RefundedAt = payment.RefundedAt,
            });
        }
    }
}