using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Application.Reviews.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Reviews.Commands;

public class AddOrUpdateActivityReview
{
    public class Command : IRequest<Result<ActivityReviewDto>>
    {
        public required string ActivityId { get; set; }
        public int Rating { get; set; }
        public required string Body { get; set; }
    }

    public class Handler(
        IUserAccessor userAccessor,
        IActivityRepository activityRepository,
        IActivityReviewRepository reviewRepository) : IRequestHandler<Command, Result<ActivityReviewDto>>
    {
        public async Task<Result<ActivityReviewDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            if (request.Rating < 1 || request.Rating > 5)
            {
                return Result<ActivityReviewDto>.Failure("Rating must be between 1 and 5", 400);
            }

            var body = request.Body.Trim();
            if (string.IsNullOrWhiteSpace(body) || body.Length < 5)
            {
                return Result<ActivityReviewDto>.Failure("Review must be at least 5 characters", 400);
            }

            var user = await userAccessor.GetUserAsync();
            var activity = await activityRepository.GetByIdWithAttendeesAsync(request.ActivityId, cancellationToken);

            if (activity == null)
            {
                return Result<ActivityReviewDto>.Failure("Activity not found", 404);
            }

            if (activity.Date > DateTime.UtcNow)
            {
                return Result<ActivityReviewDto>.Failure("You can review only after the activity ends", 400);
            }

            var host = activity.Attendees.FirstOrDefault(x => x.IsHost);
            if (host?.UserId == null)
            {
                return Result<ActivityReviewDto>.Failure("Host not found for activity", 400);
            }

            if (host.UserId == user.Id)
            {
                return Result<ActivityReviewDto>.Failure("Host cannot review own activity", 400);
            }

            var booking = activity.Attendees.FirstOrDefault(x => !x.IsHost && x.UserId == user.Id);
            if (booking == null || booking.Status != BookingStatus.Approved)
            {
                return Result<ActivityReviewDto>.Failure("Only approved attendees can review this activity", 403);
            }

            var existing = await reviewRepository.Query()
                .Include(x => x.ReviewerUser)
                .FirstOrDefaultAsync(x => x.ActivityId == activity.Id && x.ReviewerUserId == user.Id, cancellationToken);

            if (existing == null)
            {
                var review = new ActivityReview
                {
                    ActivityId = activity.Id,
                    HostUserId = host.UserId,
                    ReviewerUserId = user.Id,
                    Rating = request.Rating,
                    Body = body,
                    CreatedAt = DateTime.UtcNow,
                };

                await reviewRepository.AddAsync(review, cancellationToken);
                var created = await reviewRepository.SaveChangesAsync(cancellationToken) > 0;

                if (!created)
                {
                    return Result<ActivityReviewDto>.Failure("Failed to create review", 400);
                }

                return Result<ActivityReviewDto>.Success(new ActivityReviewDto
                {
                    Id = review.Id,
                    ActivityId = review.ActivityId,
                    HostUserId = review.HostUserId,
                    ReviewerUserId = user.Id,
                    ReviewerDisplayName = user.DisplayName ?? user.UserName ?? "User",
                    ReviewerImageUrl = user.ImageUrl,
                    Rating = review.Rating,
                    Body = review.Body,
                    CreatedAt = review.CreatedAt,
                    UpdatedAt = review.UpdatedAt,
                });
            }

            existing.Rating = request.Rating;
            existing.Body = body;
            existing.UpdatedAt = DateTime.UtcNow;
            reviewRepository.Update(existing);

            var updated = await reviewRepository.SaveChangesAsync(cancellationToken) > 0;
            if (!updated)
            {
                return Result<ActivityReviewDto>.Failure("Failed to update review", 400);
            }

            return Result<ActivityReviewDto>.Success(new ActivityReviewDto
            {
                Id = existing.Id,
                ActivityId = existing.ActivityId,
                HostUserId = existing.HostUserId,
                ReviewerUserId = existing.ReviewerUserId,
                ReviewerDisplayName = existing.ReviewerUser.DisplayName ?? existing.ReviewerUser.UserName ?? "User",
                ReviewerImageUrl = existing.ReviewerUser.ImageUrl,
                Rating = existing.Rating,
                Body = existing.Body,
                CreatedAt = existing.CreatedAt,
                UpdatedAt = existing.UpdatedAt,
            });
        }
    }
}