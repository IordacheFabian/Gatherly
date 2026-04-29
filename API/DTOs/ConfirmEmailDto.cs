using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ConfirmEmailDto
{
    [Required]
    public string UserId { get; set; } = "";

    [Required]
    public string Token { get; set; } = "";
}
