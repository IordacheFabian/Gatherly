using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Application.Receipts;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Payments.Queries;

public class DownloadPaymentReceipt
{
    public class ReceiptFile
    {
        public required byte[] Content { get; set; }
        public required string FileName { get; set; }
    }

    public class Query : IRequest<Result<ReceiptFile>>
    {
        public required string PaymentId { get; set; }
    }

    public class Handler(
        IUserAccessor userAccessor,
        IPaymentRepository paymentRepository,
        IReceiptPdfGenerator pdfGenerator) : IRequestHandler<Query, Result<ReceiptFile>>
    {
        public async Task<Result<ReceiptFile>> Handle(Query request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserAsync();

            var payment = await paymentRepository.Query()
                .Where(x => x.Id == request.PaymentId)
                .Select(x => new
                {
                    x.Id,
                    x.UserId,
                    UserDisplayName = x.User.DisplayName,
                    UserEmail = x.User.Email,
                    x.InvoiceNumber,
                    x.ReceiptNumber,
                    x.CheckoutSessionId,
                    x.Provider,
                    x.ActivityId,
                    ActivityTitle = x.Activity.Title,
                    ActivityDate = x.Activity.Date,
                    ActivityCategory = x.Activity.Category,
                    x.Activity.Venue,
                    x.Activity.City,
                    HostDisplayName = x.Activity.Attendees
                        .Where(a => a.IsHost)
                        .Select(a => a.User.DisplayName)
                        .FirstOrDefault(),
                    x.Amount,
                    x.Currency,
                    x.Status,
                    x.CreatedAt,
                    x.PaidAt,
                    x.RefundedAt,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (payment == null || payment.UserId != user.Id)
            {
                return Result<ReceiptFile>.Failure("Payment not found", 404);
            }

            var (statusLabel, statusColor) = payment.Status switch
            {
                Domain.PaymentStatus.Succeeded => ("Paid", "#10b981"),
                Domain.PaymentStatus.Refunded => ("Refunded", "#64748b"),
                Domain.PaymentStatus.Failed => ("Failed", "#ef4444"),
                _ => ("Pending", "#f59e0b"),
            };

            var data = new ReceiptData
            {
                Kind = ReceiptKind.Payment,
                ReceiptNumber = payment.ReceiptNumber,
                InvoiceNumber = payment.InvoiceNumber,
                CheckoutSessionId = payment.CheckoutSessionId,
                Provider = payment.Provider,
                RecipientName = payment.UserDisplayName ?? payment.UserEmail ?? "Customer",
                RecipientEmail = payment.UserEmail ?? string.Empty,
                ActivityId = payment.ActivityId,
                ActivityTitle = payment.ActivityTitle,
                ActivityDate = payment.ActivityDate,
                Venue = payment.Venue,
                City = payment.City,
                HostName = payment.HostDisplayName,
                Category = payment.ActivityCategory.ToString(),
                Amount = payment.Amount,
                Currency = payment.Currency,
                StatusLabel = statusLabel,
                StatusColorHex = statusColor,
                IssuedAt = payment.CreatedAt,
                PaidAt = payment.PaidAt,
                RefundedAt = payment.RefundedAt,
            };

            var bytes = pdfGenerator.Generate(data);
            return Result<ReceiptFile>.Success(new ReceiptFile
            {
                Content = bytes,
                FileName = pdfGenerator.BuildFileName(data),
            });
        }
    }
}
