namespace Domain;

public class Notification
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public NotificationType Type { get; set; }
    public required string Message { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; }

    public required string RecipientUserId { get; set; }
    public User RecipientUser { get; set; } = null!;

    public string? ActorUserId { get; set; }
    public User? ActorUser { get; set; }

    public string? ActivityId { get; set; }
    public Activity? Activity { get; set; }

    public string? CommentId { get; set; }
    public Comment? Comment { get; set; }
}
