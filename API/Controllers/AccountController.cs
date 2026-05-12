using System;
using API.DTOs;
using Application.Email;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;

namespace API.Controllers;

public class AccountController(
    SignInManager<User> signInManager,
    IEmailService emailService,
    IConfiguration configuration) : BaseApiController
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
    {
        var user = new User
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            DisplayName = registerDto.DisplayName
        };

        var result = await signInManager.UserManager.CreateAsync(user, registerDto.Password);

        if (result.Succeeded)
        {
            var token = await signInManager.UserManager.GenerateEmailConfirmationTokenAsync(user);
            var clientBaseUrl = configuration["AppSettings:ClientBaseUrl"] ?? configuration["AppUrl"] ?? "http://localhost:5173";
            var confirmationUrl = $"{clientBaseUrl.TrimEnd('/')}/confirm-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";

            var templateBuilder = new EmailTemplateBuilder(clientBaseUrl);
            var htmlBody = templateBuilder.BuildEmailConfirmationEmail(user.DisplayName, confirmationUrl);

            try
            {
                await emailService.SendEmailAsync(
                    user.Email!,
                    "Confirm Your Email – Welcome to Gatherly!",
                    htmlBody);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email sending failed: {ex.Message}");
            }

            return Ok(new { message = "Registration successful. Please check your email to confirm your account." });
        }

        foreach (var error in result.Errors)
        {
            ModelState.AddModelError(error.Code, error.Description);
        }

        return ValidationProblem();
    }

    [AllowAnonymous]
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
        if (string.IsNullOrWhiteSpace(dto.UserId) || string.IsNullOrWhiteSpace(dto.Token))
            return BadRequest("UserId and token are required.");

        var user = await signInManager.UserManager.FindByIdAsync(dto.UserId);
        if (user == null)
            return NotFound("User not found.");

        var result = await signInManager.UserManager.ConfirmEmailAsync(user, dto.Token);
        if (result.Succeeded)
            return Ok(new { message = "Email confirmed successfully. You can now log in." });

        return BadRequest("Email confirmation failed. The link may be invalid or expired.");
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
                if (string.IsNullOrWhiteSpace(dto.Password))
                        return BadRequest("Password is required.");

                var user = await signInManager.UserManager.GetUserAsync(User);
                if (user == null)
                        return Unauthorized();

                var isPasswordValid = await signInManager.UserManager.CheckPasswordAsync(user, dto.Password);
                if (!isPasswordValid)
                        return BadRequest("Invalid password.");

                var email = user.Email;
                var displayName = user.DisplayName;

                var goodbyeEmailHtml = $@"
<html>
    <body style='font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;'>
        <div style='max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 12px rgba(0,0,0,0.08);'>
            <div style='background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; text-align: center; padding: 28px 20px;'>
                <h2 style='margin: 0;'>Gatherly</h2>
            </div>
            <div style='padding: 28px;'>
                <p style='margin-top: 0;'>Goodbye, dear <strong>{displayName}</strong>,</p>
                <p>We're sorry to see you leave. Your account has been deleted as requested.</p>
                <p>We hope we will see again soon.</p>
                <p style='color: #6b7280; font-size: 13px; margin-top: 24px;'>
                    If this wasn't you, please contact support immediately.
                </p>
            </div>
        </div>
    </body>
</html>";

                try
                {
                        if (!string.IsNullOrWhiteSpace(email))
                        {
                                await emailService.SendEmailAsync(email, "Goodbye from Gatherly", goodbyeEmailHtml);
                        }
                }
                catch (Exception ex)
                {
                        Console.WriteLine($"Goodbye email sending failed: {ex.Message}");
                }

                await signInManager.SignOutAsync();
                var result = await signInManager.UserManager.DeleteAsync(user);

                if (result.Succeeded)
                        return Ok(new { message = "Your account has been deleted." });

                foreach (var error in result.Errors)
                {
                        ModelState.AddModelError(error.Code, error.Description);
                }

                return ValidationProblem();
        }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await signInManager.SignOutAsync();

        return NoContent();
    }
}
