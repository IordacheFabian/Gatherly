using System;
using System.Runtime.CompilerServices;
using Application.Profiles.Commands;
using Application.Profiles.DTOs;
using Application.Profiles.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ProfilesController : BaseApiController
{
    [HttpPost("add-photo")]
    public async Task<ActionResult<Photo>> AddPhoto(IFormFile file)
    {
        return HandleResult(await Mediator.Send(new AddPhoto.Command { File = file }));
    }

    [AllowAnonymous]
    [HttpGet("{userId}/photos")]
    public async Task<ActionResult<List<Photo>>> GetPhotosForUser(string userId)
    {
        return HandleResult(await Mediator.Send(new GetProfilePhotos.Query { UserId = userId }));
    }

    [HttpDelete("{photoId}/photos")]
    public async Task<ActionResult> DeletePhoto(string photoId)
    {
        return HandleResult(await Mediator.Send(new DeletePhoto.Command { PhotoId = photoId }));
    }

    [HttpPut("{photoId}/setMain")]
    public async Task<ActionResult> SetMainPhoto(string photoId)
    {
        return HandleResult(await Mediator.Send(new SetMainPhoto.Command { PhotoId = photoId }));
    }

    [AllowAnonymous]
    [HttpGet("{userId}")]
    public async Task<ActionResult<UserProfile>> GetProfile(string userId)
    {
        return HandleResult(await Mediator.Send(new GetProfile.Query { UserId = userId }));
    }

    [HttpPut]
    public async Task<ActionResult> EditProfile(EditProfileDto userProfile)
    {
        return HandleResult(await Mediator.Send(new EditProfile.Command { UserProfile = userProfile }));
    }

    [HttpPost("{userId}/follow")]
    public async Task<ActionResult> FollowToggle(string userId)
    {
        return HandleResult(await Mediator.Send(new FollowToggle.Command { TargetUserId = userId }));
    }

    [AllowAnonymous]
    [HttpGet("{userId}/follow-list")]
    public async Task<ActionResult> GetFollowings(string userId, string predicate)
    {
        return HandleResult(await Mediator.Send(new GetFollowings.Query { UserId = userId, Predicate = predicate }));
    }

    [AllowAnonymous]
    [HttpGet("{userId}/activities")]
    public async Task<ActionResult> GetUserActivities(string userId, string predicate = "future")
    {
        return HandleResult(await Mediator.Send(new GetUserActivities.Query
        {
            UserId = userId,
            Predicate = predicate
        }));
    }
}
