using API.DTOs;

namespace Application.Activities.DTOs;

public class WishlistGroupDto
{
    public required string Name { get; set; }
    public List<ActivityDto> Activities { get; set; } = [];
}
