using System.Runtime.CompilerServices;
using API.DTOs;
using Application.Activities.Commands;
using Application.Activities.DTOs;
using Application.Activities.Queries;
using Application.Core;
using Application.Payments.Commands;
using Application.Payments.DTOs;
using Application.Reviews.Commands;
using Application.Reviews.DTOs;
using Application.Reviews.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ActivitiesController : BaseApiController
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<PageList<ActivityDto, DateTime?>>> GetActivities(DateTime? cursor, int pageSize = 10)
    {
        return HandleResult(await Mediator.Send(new GetActivityList.Query { Cursor = cursor, PageSize = pageSize }));
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<ActivityDto>> GetActivityDetail(string id)
    {
        return HandleResult(await Mediator.Send(new GetActivityDetails.Query { Id = id }));
    }

    [HttpPost]
    public async Task<ActionResult<string>> CreateActivity(CreateActivityDto activityDto)
    {
        return HandleResult(await Mediator.Send(new CreateActivity.Command { ActivityDto = activityDto }));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "IsActivityHost")]
    public async Task<ActionResult> EditActivity(string id, EditActivityDto activity)
    {
        activity.Id = id;
        return HandleResult(await Mediator.Send(new EditActivity.Command { ActivityDto = activity }));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "IsActivityHost")]
    public async Task<ActionResult> DeleteActivity(string id)
    {
        return HandleResult(await Mediator.Send(new DeleteActivity.Command { Id = id }));
    }

    [HttpPost("{id}/attend")]
    public async Task<ActionResult> Attend(string id)
    {
        return HandleResult(await Mediator.Send(new UpdateAttendance.Command { Id = id }));
    }

    [HttpPost("{id}/save")]
    public async Task<ActionResult<SavedActivityToggleResultDto>> ToggleSaved(string id)
    {
        return HandleResult(await Mediator.Send(new ToggleSavedActivity.Command { ActivityId = id }));
    }

    [HttpGet("saved")]
    public async Task<ActionResult<List<ActivityDto>>> GetSavedActivities()
    {
        return HandleResult(await Mediator.Send(new GetSavedActivities.Query()));
    }

    [HttpPost("{id}/wishlists")]
    public async Task<ActionResult> AddToWishlist(string id, [FromBody] WishlistBody body)
    {
        return HandleResult(await Mediator.Send(new AddToWishlist.Command
        {
            ActivityId = id,
            WishlistName = body.WishlistName,
        }));
    }

    [HttpDelete("{id}/wishlists/{wishlistName}")]
    public async Task<ActionResult> RemoveFromWishlist(string id, string wishlistName)
    {
        return HandleResult(await Mediator.Send(new RemoveFromWishlist.Command
        {
            ActivityId = id,
            WishlistName = Uri.UnescapeDataString(wishlistName),
        }));
    }

    [HttpGet("wishlists")]
    public async Task<ActionResult<List<WishlistGroupDto>>> GetWishlists()
    {
        return HandleResult(await Mediator.Send(new GetWishlists.Query()));
    }

    [HttpPost("{id}/view")]
    public async Task<ActionResult> TrackView(string id)
    {
        return HandleResult(await Mediator.Send(new TrackActivityView.Command { ActivityId = id }));
    }

    [HttpGet("recently-viewed")]
    public async Task<ActionResult<List<ActivityDto>>> GetRecentlyViewed(int limit = 20)
    {
        return HandleResult(await Mediator.Send(new GetRecentlyViewedActivities.Query { Limit = limit }));
    }

    [HttpGet("recommended")]
    public async Task<ActionResult<List<ActivityDto>>> GetRecommendedActivities(int limit = 12)
    {
        return HandleResult(await Mediator.Send(new GetRecommendedActivities.Query { Limit = limit }));
    }

    [HttpPost("{id}/bookings/{userId}/approve")]
    [Authorize(Policy = "IsActivityHost")]
    public async Task<ActionResult> ApproveBooking(string id, string userId)
    {
        return HandleResult(await Mediator.Send(new ReviewBooking.Command
        {
            ActivityId = id,
            UserId = userId,
            TargetStatus = BookingStatus.Approved,
        }));
    }

    [HttpPost("{id}/bookings/{userId}/reject")]
    [Authorize(Policy = "IsActivityHost")]
    public async Task<ActionResult> RejectBooking(string id, string userId)
    {
        return HandleResult(await Mediator.Send(new ReviewBooking.Command
        {
            ActivityId = id,
            UserId = userId,
            TargetStatus = BookingStatus.Rejected,
        }));
    }

    [HttpPost("{id}/checkout/mock")]
    public async Task<ActionResult<CheckoutSessionDto>> MockCheckout(string id)
    {
        return HandleResult(await Mediator.Send(new SimulateCheckout.Command { ActivityId = id }));
    }

    [AllowAnonymous]
    [HttpGet("{id}/reviews")]
    public async Task<ActionResult<List<ActivityReviewDto>>> GetReviews(string id, int limit = 100)
    {
        return HandleResult(await Mediator.Send(new GetActivityReviews.Query { ActivityId = id, Limit = limit }));
    }

    [HttpPost("{id}/reviews")]
    public async Task<ActionResult<ActivityReviewDto>> AddOrUpdateReview(string id, [FromBody] AddOrUpdateActivityReviewBody body)
    {
        return HandleResult(await Mediator.Send(new AddOrUpdateActivityReview.Command
        {
            ActivityId = id,
            Rating = body.Rating,
            Body = body.Body,
        }));
    }

    [HttpPost("{id}/photo")]
    [Authorize(Policy = "IsActivityHost")]
    public async Task<ActionResult> UploadPhoto(string id, IFormFile file)
    {
        return HandleResult(await Mediator.Send(new UploadActivityPhoto.Command
        {
            ActivityId = id,
            File = file
        }));
    }

    public class AddOrUpdateActivityReviewBody
    {
        public int Rating { get; set; }
        public string Body { get; set; } = string.Empty;
    }

    public class WishlistBody
    {
        public string WishlistName { get; set; } = string.Empty;
    }
}
