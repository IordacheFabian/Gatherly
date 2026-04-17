using System;
using Application.Profiles.DTOs;
using Domain;

namespace API.DTOs;

public class ActivityDto
{
    public required string Id { get; set; }
    public required string Title { get; set; }
    public DateTime Date { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }
    public bool IsCancelled { get; set; }
    public int MaxParticipants { get; set; }
    public DateTime? BookingDeadline { get; set; }
    public bool RequiresHostConfirmation { get; set; }
    public string? ImageUrl { get; set; }
    public required string HostDisplayName { get; set; }
    public required string HostId { get; set; }

    // location props
    public required string City { get; set; }
    public required string Venue { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    // booking state
    public int ApprovedParticipantsCount { get; set; }
    public int PendingBookingsCount { get; set; }
    public int WaitlistCount { get; set; }
    public BookingStatus? CurrentUserBookingStatus { get; set; }

    // navigation props
    public ICollection<UserProfile> Attendees { get; set; } = [];
    public ICollection<ActivityBookingDto> Bookings { get; set; } = [];
}
