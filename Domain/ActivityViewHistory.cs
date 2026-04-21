namespace Domain;

public class ActivityViewHistory
{
    public required string UserId { get; set; }
    public User User { get; set; } = null!;
    public required string ActivityId { get; set; }
    public Activity Activity { get; set; } = null!;
    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
}
