using System;
using System.Drawing;
using API.DTOs;
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
            // Generate email confirmation token
            var token = await signInManager.UserManager.GenerateEmailConfirmationTokenAsync(user);
            var confirmationLink = $"{configuration["AppUrl"]}/confirm-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";

            // Create HTML email body
            var htmlBody = $@"
                <html>
                    <body style='font-family: Arial, sans-serif;'>
                        <div style='max-width: 600px; margin: 0 auto;'>
                            <h2>Welcome to Reactivities, {user.DisplayName}!</h2>
                            <p>Thank you for registering. Please confirm your email address to activate your account.</p>
                            <p>
                                <a href='{confirmationLink}' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                                    Confirm Email Address
                                </a>
                            </p>
                            <p>Or copy and paste this link in your browser:</p>
                            <p><a href='{confirmationLink}'>{confirmationLink}</a></p>
                            <p>If you didn't create this account, you can ignore this email.</p>
                            <p style='color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;'>
                                Best regards,<br>
                                The Reactivities Team
                            </p>
                        </div>
                    </body>
                </html>";

            try
            {
                await emailService.SendEmailAsync(
                    user.Email!,
                    "Confirm Your Email - Reactivities",
                    htmlBody);
            }
            catch (Exception ex)
            {
                // Log email error but don't fail registration
                // User will need to request password reset or resend email
                Console.WriteLine($"Email sending failed: {ex.Message}");
            }

            return Ok(new { message = "Registration successful. Please check your email to confirm your account.", userId = user.Id });
        }

        foreach (var error in result.Errors)
        {
            ModelState.AddModelError(error.Code, error.Description);
        }

        return ValidationProblem();
    }

    [AllowAnonymous]
    [HttpPost("confirm-email")]
    public async Task<ActionResult> ConfirmEmail(string userId, string token)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
        {
            return BadRequest("UserId and token are required.");
        }

        var user = await signInManager.UserManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        var result = await signInManager.UserManager.ConfirmEmailAsync(user, token);
        if (result.Succeeded)
        {
            return Ok(new { message = "Email confirmed successfully. You can now log in." });
        }

        return BadRequest("Email confirmation failed. The token may be invalid or expired.");
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

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await signInManager.SignOutAsync();

        return NoContent();
    }
}
