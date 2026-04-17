using Application.Notifications.Commands;
using Application.Notifications.DTOs;
using Application.Notifications.Queries;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class NotificationsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetNotifications(int limit = 50)
    {
        return HandleResult(await Mediator.Send(new GetNotifications.Query { Limit = limit }));
    }

    [HttpPut("{id}/read")]
    public async Task<ActionResult> MarkRead(string id)
    {
        return HandleResult(await Mediator.Send(new MarkNotificationRead.Command { Id = id }));
    }

    [HttpPut("read-all")]
    public async Task<ActionResult> MarkAllRead()
    {
        return HandleResult(await Mediator.Send(new MarkAllNotificationsRead.Command()));
    }
}
