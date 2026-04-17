using Application.Profiles.DTOs;
using Domain;

namespace API.DTOs;

public class ActivityBookingDto
{
    public required UserProfile User { get; set; }
    public bool IsHost { get; set; }
    public BookingStatus Status { get; set; }
    public DateTime DateJoined { get; set; }
    public DateTime? StatusUpdatedAt { get; set; }
}
