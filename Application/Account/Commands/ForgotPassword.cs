using Application.Core;
using Application.Email;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Application.Account.Commands;

public class ForgotPassword
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Email { get; set; }
    }

    public class Handler(
        UserManager<User> userManager,
        IEmailService emailService,
        IConfiguration configuration) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByEmailAsync(request.Email);

            // Silent return: prevent email enumeration
            if (user == null || !user.EmailConfirmed)
                return Result<Unit>.Success(Unit.Value);

            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var clientBaseUrl = configuration["AppSettings:ClientBaseUrl"] ?? configuration["AppUrl"] ?? "http://localhost:5173";
            var resetUrl = $"{clientBaseUrl.TrimEnd('/')}/reset-password?userId={user.Id}&token={Uri.EscapeDataString(token)}";

            var templateBuilder = new EmailTemplateBuilder(clientBaseUrl);
            var htmlBody = templateBuilder.BuildPasswordResetEmail(user.DisplayName ?? user.Email!, resetUrl);

            try
            {
                await emailService.SendEmailAsync(user.Email!, "Reset Your Password - Gatherly", htmlBody, cancellationToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Password reset email failed: {ex.Message}");
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
