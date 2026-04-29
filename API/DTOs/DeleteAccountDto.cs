using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class DeleteAccountDto
{
    [Required]
    public string Password { get; set; } = "";
}
