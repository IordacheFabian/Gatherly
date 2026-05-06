using System;
using Domain;

namespace Application.Activities.DTOs;

public class BaseActivityDto
{
    public string Title { get; set; } = "";
    public DateTime Date { get; set; }
    public string Description { get; set; } = "";
    public ActivityCategory Category { get; set; }

    // location props
    public string City { get; set; } = "";
    public string Venue { get; set; } = "";
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    // booking props
    public int MaxParticipants { get; set; } = 20;
    public DateTime? BookingDeadline { get; set; }
    public bool RequiresHostConfirmation { get; set; } = true;
    public decimal PriceAmount { get; set; } = 0m;
    public string Currency { get; set; } = "USD";
}
