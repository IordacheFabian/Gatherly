using API.DTOs;
using Application.Account.Commands;
using Application.Account.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

public class AccountController(SignInManager<User> signInManager) : BaseApiController
{
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("register")]
    public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
    {
        var result = await Mediator.Send(new RegisterUser.Command
        {
            Email = registerDto.Email,
            Password = registerDto.Password,
            DisplayName = registerDto.DisplayName
        });

        if (!result.IsSuccess) return HandleResult(result);

        return Ok(new { message = "Registration successful. Please check your email to confirm your account." });
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await signInManager.UserManager.FindByEmailAsync(loginDto.Email);

        if (user == null)
            return Unauthorized("Invalid email or password.");

        if (!user.EmailConfirmed)
            return Unauthorized("Please confirm your email address before logging in. Check your inbox for the confirmation email.");

        var result = await signInManager.PasswordSignInAsync(user, loginDto.Password, isPersistent: true, lockoutOnFailure: false);

        if (result.Succeeded)
            return Ok();

        return Unauthorized("Invalid email or password.");
    }

    [AllowAnonymous]
    [HttpPost("confirm-email")]
    public async Task<ActionResult> ConfirmEmail([FromBody] ConfirmEmailDto dto)
    {
        var result = await Mediator.Send(new ConfirmEmail.Command
        {
            UserId = dto.UserId,
            Token = dto.Token
        });

        if (!result.IsSuccess) return HandleResult(result);

        return Ok(new { message = "Email confirmed successfully. You can now log in." });
    }

    [AllowAnonymous]
    [HttpGet("user-info")]
    public async Task<ActionResult> GetUserInfo()
    {
        if (User.Identity?.IsAuthenticated == false) return NoContent();

        var user = await signInManager.UserManager.GetUserAsync(User);

        if (user == null) return Unauthorized();

        return Ok(new
        {
            user.DisplayName,
            user.Email,
            user.Id,
            user.ImageUrl,
            user.Bio,
            user.EmailConfirmed
        });
    }

    [HttpPost("delete-account")]
    public async Task<ActionResult> DeleteAccount([FromBody] DeleteAccountDto dto)
    {
        var result = await Mediator.Send(new DeleteAccount.Command { Password = dto.Password });

        if (!result.IsSuccess) return HandleResult(result);

        await signInManager.SignOutAsync();

        return Ok(new { message = "Your account has been deleted." });
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await Mediator.Send(new ForgotPassword.Command { Email = dto.Email });

        return Ok(new { message = "If an account with that email exists, a reset link has been sent." });
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var result = await Mediator.Send(new ResetPassword.Command
        {
            UserId = dto.UserId,
            Token = dto.Token,
            NewPassword = dto.NewPassword
        });

        if (!result.IsSuccess) return HandleResult(result);

        return Ok(new { message = "Password has been reset successfully. You can now log in." });
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await signInManager.SignOutAsync();

        return NoContent();
    }

    [HttpGet("export")]
    public async Task<ActionResult<UserDataExportDto>> ExportData()
    {
        return HandleResult(await Mediator.Send(new ExportUserData.Query()));
    }
}
