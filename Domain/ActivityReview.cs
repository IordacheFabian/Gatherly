using System;
using Microsoft.EntityFrameworkCore;

namespace Domain;

[Index(nameof(ActivityId), nameof(ReviewerUserId), IsUnique = true)]
[Index(nameof(HostUserId), nameof(CreatedAt))]
[Index(nameof(ActivityId), nameof(CreatedAt))]
public class ActivityReview
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ActivityId { get; set; } = null!;
    public Activity Activity { get; set; } = null!;
    public string HostUserId { get; set; } = null!;
    public User HostUser { get; set; } = null!;
    public string ReviewerUserId { get; set; } = null!;
    public User ReviewerUser { get; set; } = null!;
    public int Rating { get; set; }
    public string Body { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}