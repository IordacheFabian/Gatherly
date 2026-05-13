using Application.Core;
using Application.Email;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Application.Account.Commands;

public class RegisterUser
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string DisplayName { get; set; }
    }

    public class Handler(
        UserManager<User> userManager,
        IEmailService emailService,
        IConfiguration configuration) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = new User
            {
                UserName = request.Email,
                Email = request.Email,
                DisplayName = request.DisplayName
            };

            var result = await userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return Result<Unit>.Failure(errors, 400);
            }

            var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
            var clientBaseUrl = configuration["AppSettings:ClientBaseUrl"] ?? configuration["AppUrl"] ?? "http://localhost:5173";
            var confirmationUrl = $"{clientBaseUrl.TrimEnd('/')}/confirm-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";

            var templateBuilder = new EmailTemplateBuilder(clientBaseUrl);
            var htmlBody = templateBuilder.BuildEmailConfirmationEmail(user.DisplayName ?? user.Email!, confirmationUrl);

            try
            {
                await emailService.SendEmailAsync(user.Email!, "Confirm Your Email - Welcome to Gatherly!", htmlBody, cancellationToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email sending failed: {ex.Message}");
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
