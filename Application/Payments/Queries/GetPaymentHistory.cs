using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Application.Payments.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Payments.Queries;

public class GetPaymentHistory
{
    public class Query : IRequest<Result<List<PaymentHistoryItemDto>>>
    {
        public int Limit { get; set; } = 50;
    }

    public class Handler(
        IUserAccessor userAccessor,
        IPaymentRepository paymentRepository) : IRequestHandler<Query, Result<List<PaymentHistoryItemDto>>>
    {
        public async Task<Result<List<PaymentHistoryItemDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserAsync();
            var take = request.Limit <= 0 ? 50 : Math.Min(request.Limit, 200);

            var items = await paymentRepository.Query()
                .Where(x => x.UserId == user.Id)
                .OrderByDescending(x => x.CreatedAt)
                .Take(take)
                .Select(x => new PaymentHistoryItemDto
                {
                    Id = x.Id,
                    ActivityId = x.ActivityId,
                    ActivityTitle = x.Activity.Title,
                    Amount = x.Amount,
                    Currency = x.Currency,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt,
                    PaidAt = x.PaidAt,
                    RefundedAt = x.RefundedAt,
                    InvoiceNumber = x.InvoiceNumber,
                    ReceiptNumber = x.ReceiptNumber,
                })
                .ToListAsync(cancellationToken);

            return Result<List<PaymentHistoryItemDto>>.Success(items);
        }
    }
}