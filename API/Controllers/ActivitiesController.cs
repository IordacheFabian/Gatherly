using System.Runtime.CompilerServices;
using API.DTOs;
using Application.Activities.Commands;
using Application.Activities.DTOs;
using Application.Activities.Queries;
using Application.Core;
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
}
