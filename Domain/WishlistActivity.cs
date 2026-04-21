namespace Domain;

public class WishlistActivity
{
    public required string UserId { get; set; }
    public User User { get; set; } = null!;
    public required string ActivityId { get; set; }
    public Activity Activity { get; set; } = null!;
    public required string WishlistName { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
