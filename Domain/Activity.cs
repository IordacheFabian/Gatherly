using System;
using Microsoft.EntityFrameworkCore;

namespace Domain;

[Index(nameof(Date))]
public class Activity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Title { get; set; }
    public DateTime Date { get; set; }
    public required string Description { get; set; }
    public ActivityCategory Category { get; set; }
    public bool IsCancelled { get; set; }
    public int MaxParticipants { get; set; } = 20;
    public DateTime? BookingDeadline { get; set; }
    public bool RequiresHostConfirmation { get; set; } = true;
    public decimal PriceAmount { get; set; } = 0m;
    public string Currency { get; set; } = "USD";
    public string? ImageUrl { get; set; }
    public string? ImagePublicId { get; set; }

    // location props
    public required string City { get; set; }
    public required string Venue { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    // navigation props
    public ICollection<ActivityAttendee> Attendees { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
    public ICollection<ActivityReview> Reviews { get; set; } = [];
    public ICollection<SavedActivity> SavedByUsers { get; set; } = [];
    public ICollection<WishlistActivity> WishlistedByUsers { get; set; } = [];
    public ICollection<ActivityViewHistory> ViewedByUsers { get; set; } = [];

}
