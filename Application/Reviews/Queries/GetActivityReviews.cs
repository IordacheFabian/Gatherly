using Application.Core;
using Application.Interfaces.IRepository;
using Application.Reviews.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Reviews.Queries;

public class GetActivityReviews
{
    public class Query : IRequest<Result<List<ActivityReviewDto>>>
    {
        public required string ActivityId { get; set; }
        public int Limit { get; set; } = 100;
    }

    public class Handler(IActivityReviewRepository reviewRepository)
        : IRequestHandler<Query, Result<List<ActivityReviewDto>>>
    {
        public async Task<Result<List<ActivityReviewDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var take = request.Limit <= 0 ? 100 : Math.Min(request.Limit, 200);

            var reviews = await reviewRepository.Query()
                .Where(x => x.ActivityId == request.ActivityId)
                .OrderByDescending(x => x.CreatedAt)
                .Take(take)
                .Select(x => new ActivityReviewDto
                {
                    Id = x.Id,
                    ActivityId = x.ActivityId,
                    HostUserId = x.HostUserId,
                    ReviewerUserId = x.ReviewerUserId,
                    ReviewerDisplayName = x.ReviewerUser.DisplayName ?? x.ReviewerUser.UserName ?? "User",
                    ReviewerImageUrl = x.ReviewerUser.ImageUrl,
                    Rating = x.Rating,
                    Body = x.Body,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                })
                .ToListAsync(cancellationToken);

            return Result<List<ActivityReviewDto>>.Success(reviews);
        }
    }
}