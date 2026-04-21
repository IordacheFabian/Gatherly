using Application.Core;
using Application.Interfaces.IRepository;
using Application.Reviews.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Reviews.Queries;

public class GetHostReviews
{
    public class Query : IRequest<Result<List<HostReviewDto>>>
    {
        public required string HostUserId { get; set; }
        public int Limit { get; set; } = 100;
    }

    public class Handler(IActivityReviewRepository reviewRepository)
        : IRequestHandler<Query, Result<List<HostReviewDto>>>
    {
        public async Task<Result<List<HostReviewDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var take = request.Limit <= 0 ? 100 : Math.Min(request.Limit, 200);

            var reviews = await reviewRepository.Query()
                .Where(x => x.HostUserId == request.HostUserId)
                .OrderByDescending(x => x.CreatedAt)
                .Take(take)
                .Select(x => new HostReviewDto
                {
                    Id = x.Id,
                    ActivityId = x.ActivityId,
                    ActivityTitle = x.Activity.Title,
                    ActivityDate = x.Activity.Date,
                    ReviewerUserId = x.ReviewerUserId,
                    ReviewerDisplayName = x.ReviewerUser.DisplayName ?? x.ReviewerUser.UserName ?? "User",
                    ReviewerImageUrl = x.ReviewerUser.ImageUrl,
                    Rating = x.Rating,
                    Body = x.Body,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                })
                .ToListAsync(cancellationToken);

            return Result<List<HostReviewDto>>.Success(reviews);
        }
    }
}