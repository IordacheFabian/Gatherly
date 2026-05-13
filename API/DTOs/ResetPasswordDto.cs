using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ResetPasswordDto
{
    [Required]
    public string UserId { get; set; } = "";

    [Required]
    public string Token { get; set; } = "";

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = "";
}
