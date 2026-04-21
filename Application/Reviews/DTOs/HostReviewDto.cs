namespace Application.Reviews.DTOs;

public class HostReviewDto
{
    public required string Id { get; set; }
    public required string ActivityId { get; set; }
    public required string ActivityTitle { get; set; }
    public DateTime ActivityDate { get; set; }
    public required string ReviewerUserId { get; set; }
    public required string ReviewerDisplayName { get; set; }
    public string? ReviewerImageUrl { get; set; }
    public int Rating { get; set; }
    public required string Body { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}