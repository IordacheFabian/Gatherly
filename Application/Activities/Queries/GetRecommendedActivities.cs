using API.DTOs;
using Application.Core;
using Application.Interfaces;
using Domain;
using Application.Interfaces.IRepository;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Queries;

public class GetRecommendedActivities
{
    private const int MaxLimit = 30;

    public class Query : IRequest<Result<List<ActivityDto>>>
    {
        private int _limit = 12;

        public int Limit
        {
            get => _limit;
            set => _limit = value > MaxLimit ? MaxLimit : value;
        }
    }

    public class Handler(
        IActivityRepository activityRepository,
        IProfileRepository profileRepository,
        IUserAccessor userAccessor,
        IMapper mapper) : IRequestHandler<Query, Result<List<ActivityDto>>>
    {
        public async Task<Result<List<ActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var currentUserId = userAccessor.GetUserId();
            var now = DateTime.UtcNow;

            var followedHostIds = await profileRepository.QueryFollowings()
                .Where(x => x.ObserverId == currentUserId)
                .Select(x => x.TargetId)
                .ToHashSetAsync(cancellationToken);

            var approvedBookingHistory = await activityRepository.Query()
                .Where(x => x.Attendees.Any(a =>
                    a.UserId == currentUserId &&
                    !a.IsHost &&
                    a.Status == Domain.BookingStatus.Approved))
                .Select(x => new BookingHistoryPoint
                {
                    Category = x.Category,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                    Date = x.Date,
                })
                .ToListAsync(cancellationToken);

            var savedCategories = await activityRepository.QuerySavedActivities()
                .Where(x => x.UserId == currentUserId)
                .Select(x => x.Activity.Category)
                .ToListAsync(cancellationToken);

            var wishlistedCategories = await activityRepository.QueryWishlistActivities()
                .Where(x => x.UserId == currentUserId)
                .Select(x => x.Activity.Category)
                .ToListAsync(cancellationToken);

            var viewedCategories = await activityRepository.QueryViewHistory()
                .Where(x => x.UserId == currentUserId)
                .OrderByDescending(x => x.ViewedAt)
                .Take(50)
                .Select(x => x.Activity.Category)
                .ToListAsync(cancellationToken);

            var alreadyBookedOrRequestedIds = await activityRepository.QueryAttendances()
                .Where(x => x.UserId == currentUserId &&
                            !x.IsHost &&
                            (x.Status == Domain.BookingStatus.Approved ||
                             x.Status == Domain.BookingStatus.Pending ||
                             x.Status == Domain.BookingStatus.Waitlisted))
                .Select(x => x.ActivityId!)
                .ToHashSetAsync(cancellationToken);

            var categoryWeights = new Dictionary<ActivityCategory, int>();

            foreach (var category in approvedBookingHistory.Select(x => x.Category))
            {
                AddCategoryWeight(categoryWeights, category, 3);
            }

            foreach (var category in savedCategories)
            {
                AddCategoryWeight(categoryWeights, category, 2);
            }

            foreach (var category in wishlistedCategories)
            {
                AddCategoryWeight(categoryWeights, category, 2);
            }

            foreach (var category in viewedCategories)
            {
                AddCategoryWeight(categoryWeights, category, 1);
            }

            var userAnchor = BuildLocationAnchor(approvedBookingHistory);

            var candidates = await activityRepository.Query()
                .Where(x => !x.IsCancelled && x.Date >= now)
                .Select(x => new Candidate
                {
                    Id = x.Id,
                    Date = x.Date,
                    Category = x.Category,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                    HostId = x.Attendees.Where(a => a.IsHost).Select(a => a.UserId).FirstOrDefault(),
                    IsHostedByCurrentUser = x.Attendees.Any(a => a.IsHost && a.UserId == currentUserId),
                })
                .ToListAsync(cancellationToken);

            var rankedIds = candidates
                .Where(x => !x.IsHostedByCurrentUser)
                .Where(x => !alreadyBookedOrRequestedIds.Contains(x.Id))
                .Select(x => new
                {
                    x.Id,
                    Score = CalculateScore(
                        x,
                        now,
                        followedHostIds,
                        categoryWeights,
                        userAnchor),
                })
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .ThenBy(x => x.Id)
                .Take(request.Limit)
                .Select(x => x.Id)
                .ToList();

            if (rankedIds.Count == 0)
            {
                return Result<List<ActivityDto>>.Success([]);
            }

            var projected = await activityRepository.Query()
                .Where(x => rankedIds.Contains(x.Id))
                .ProjectTo<ActivityDto>(
                    mapper.ConfigurationProvider,
                    new { currentUserId = userAccessor.GetUserIdOrNull() })
                .ToListAsync(cancellationToken);

            var byId = projected.ToDictionary(x => x.Id);
            var ordered = rankedIds
                .Where(byId.ContainsKey)
                .Select(id => byId[id])
                .ToList();

            return Result<List<ActivityDto>>.Success(ordered);
        }

        private static int CalculateScore(
            Candidate candidate,
            DateTime now,
            HashSet<string> followedHostIds,
            Dictionary<ActivityCategory, int> categoryWeights,
            (double Latitude, double Longitude)? anchor)
        {
            var score = 0;

            if (!string.IsNullOrWhiteSpace(candidate.HostId) && followedHostIds.Contains(candidate.HostId))
            {
                score += 45;
            }

            if (categoryWeights.TryGetValue(candidate.Category, out var categoryWeight))
            {
                score += Math.Min(25, categoryWeight * 4);
            }

            var daysUntil = (candidate.Date - now).TotalDays;
            if (daysUntil >= 0 && daysUntil <= 14)
            {
                score += 10;
            }
            else if (daysUntil <= 30)
            {
                score += 5;
            }

            if (anchor.HasValue)
            {
                var distanceKm = HaversineKm(anchor.Value.Latitude, anchor.Value.Longitude, candidate.Latitude, candidate.Longitude);

                if (distanceKm <= 5)
                {
                    score += 20;
                }
                else if (distanceKm <= 20)
                {
                    score += 12;
                }
                else if (distanceKm <= 50)
                {
                    score += 6;
                }
            }

            return score;
        }

        private static (double Latitude, double Longitude)? BuildLocationAnchor(IEnumerable<BookingHistoryPoint> bookingHistory)
        {
            var recent = bookingHistory
                .OrderByDescending(x => x.Date)
                .Take(5)
                .ToList();

            if (recent.Count == 0)
            {
                return null;
            }

            var avgLat = recent.Average(x => (double)x.Latitude);
            var avgLon = recent.Average(x => (double)x.Longitude);

            return (avgLat, avgLon);
        }

        private static void AddCategoryWeight(Dictionary<ActivityCategory, int> weights, ActivityCategory category, int increment)
        {
            if (weights.TryGetValue(category, out var current))
            {
                weights[category] = current + increment;
                return;
            }

            weights[category] = increment;
        }

        private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
        {
            const double earthRadiusKm = 6371;

            static double ToRadians(double angle) => Math.PI * angle / 180.0;

            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Asin(Math.Sqrt(a));

            return earthRadiusKm * c;
        }

        private sealed class Candidate
        {
            public required string Id { get; set; }
            public ActivityCategory Category { get; set; }
            public string? HostId { get; set; }
            public DateTime Date { get; set; }
            public double Latitude { get; set; }
            public double Longitude { get; set; }
            public bool IsHostedByCurrentUser { get; set; }
        }

        private sealed class BookingHistoryPoint
        {
            public ActivityCategory Category { get; set; }
            public DateTime Date { get; set; }
            public double Latitude { get; set; }
            public double Longitude { get; set; }
        }
    }
}
