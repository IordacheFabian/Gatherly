using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Account.Queries;

public class ExportUserData
{
    public class Query : IRequest<Result<UserDataExportDto>> { }

    public class Handler(
        IUserAccessor userAccessor,
        IActivityRepository activityRepository,
        IPaymentRepository paymentRepository,
        IProfileRepository profileRepository) : IRequestHandler<Query, Result<UserDataExportDto>>
    {
        public async Task<Result<UserDataExportDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserAsync();

            var photos = await profileRepository.QueryUsers()
                .Where(u => u.Id == user.Id)
                .SelectMany(u => u.Photos)
                .Select(p => p.Url ?? string.Empty)
                .Where(url => url.Length > 0)
                .ToListAsync(cancellationToken);

            var bookings = await activityRepository.QueryAttendances()
                .Include(a => a.Activity)
                .Where(a => a.UserId == user.Id)
                .Select(a => new BookingExportDto
                {
                    ActivityId = a.ActivityId,
                    ActivityTitle = a.Activity.Title,
                    ActivityDate = a.Activity.Date,
                    IsHost = a.IsHost,
                    Status = a.Status.ToString(),
                    JoinedAt = a.DateJoined
                })
                .ToListAsync(cancellationToken);

            var payments = await paymentRepository.Query()
                .Where(p => p.UserId == user.Id)
                .Select(p => new PaymentExportDto
                {
                    PaymentId = p.Id,
                    ActivityId = p.ActivityId,
                    Amount = p.Amount,
                    Currency = p.Currency,
                    Status = p.Status.ToString(),
                    CreatedAt = p.CreatedAt,
                    PaidAt = p.PaidAt
                })
                .ToListAsync(cancellationToken);

            var followings = await profileRepository.QueryFollowings()
                .Where(f => f.ObserverId == user.Id)
                .Select(f => f.TargetId)
                .ToListAsync(cancellationToken);

            var followers = await profileRepository.QueryFollowings()
                .Where(f => f.TargetId == user.Id)
                .Select(f => f.ObserverId)
                .ToListAsync(cancellationToken);

            var dto = new UserDataExportDto
            {
                ExportedAt = DateTime.UtcNow,
                Profile = new ProfileExportDto
                {
                    UserId = user.Id,
                    DisplayName = user.DisplayName,
                    Email = user.Email,
                    Bio = user.Bio,
                    PhotoUrls = photos
                },
                Bookings = bookings,
                Payments = payments,
                FollowingUserIds = followings,
                FollowerUserIds = followers
            };

            return Result<UserDataExportDto>.Success(dto);
        }
    }
}

public class UserDataExportDto
{
    public DateTime ExportedAt { get; set; }
    public ProfileExportDto Profile { get; set; } = null!;
    public List<BookingExportDto> Bookings { get; set; } = [];
    public List<PaymentExportDto> Payments { get; set; } = [];
    public List<string> FollowingUserIds { get; set; } = [];
    public List<string> FollowerUserIds { get; set; } = [];
}

public class ProfileExportDto
{
    public string UserId { get; set; } = null!;
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public string? Bio { get; set; }
    public List<string> PhotoUrls { get; set; } = [];
}

public class BookingExportDto
{
    public string ActivityId { get; set; } = null!;
    public string ActivityTitle { get; set; } = null!;
    public DateTime ActivityDate { get; set; }
    public bool IsHost { get; set; }
    public string Status { get; set; } = null!;
    public DateTime JoinedAt { get; set; }
}

public class PaymentExportDto
{
    public string PaymentId { get; set; } = null!;
    public string ActivityId { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
}
