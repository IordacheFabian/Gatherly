using Domain;

namespace Application.Notifications.DTOs;

public class NotificationDto
{
    public required string Id { get; set; }
    public NotificationType Type { get; set; }
    public required string Message { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    public string? ActorUserId { get; set; }
    public string? ActivityId { get; set; }
    public string? CommentId { get; set; }
}
