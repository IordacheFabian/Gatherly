using System;
using Microsoft.AspNetCore.Identity;

namespace Domain;

public class User : IdentityUser
{
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? ImageUrl { get; set; }

    // navigation props
    public ICollection<ActivityAttendee> Activities { get; set; } = [];

    public ICollection<Photo> Photos { get; set; } = [];

    public ICollection<UserFollowing> Followings { get; set; } = [];
    public ICollection<UserFollowing> Followers { get; set; } = [];

    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
    public ICollection<ActivityReview> ReviewsWritten { get; set; } = [];
    public ICollection<ActivityReview> ReviewsReceived { get; set; } = [];
    public ICollection<SavedActivity> SavedActivities { get; set; } = [];
    public ICollection<WishlistActivity> WishlistActivities { get; set; } = [];
    public ICollection<ActivityViewHistory> ActivityViewHistory { get; set; } = [];
}

