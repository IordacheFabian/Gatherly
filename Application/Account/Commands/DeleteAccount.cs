using Application.Core;
using Application.Email;
using Application.Email.DTOs;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Application.Account.Commands;

public class DeleteAccount
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Password { get; set; }
    }

    public class Handler(
        UserManager<User> userManager,
        IUserAccessor userAccessor,
        IEmailService emailService,
        IConfiguration configuration) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Password))
                return Result<Unit>.Failure("Password is required.", 400);

            var user = await userAccessor.GetUserAsync();

            var isPasswordValid = await userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid)
                return Result<Unit>.Failure("Invalid password.", 400);

            var clientBaseUrl = configuration["AppSettings:ClientBaseUrl"] ?? configuration["AppUrl"] ?? "http://localhost:5173";
            var templateBuilder = new EmailTemplateBuilder(clientBaseUrl);
            var htmlBody = templateBuilder.BuildGenericEmail(
                new GenericEmailData
                {
                    RecipientName = user.DisplayName ?? user.Email!,
                    RecipientEmail = user.Email!,
                    StatusBadge = "Account Deleted",
                    StatusBadgeColor = "#ef4444",
                    Title = "We will miss you",
                    Message = $"We are sorry to see you leave, <strong>{user.DisplayName}</strong>. Your account has been permanently deleted as requested.",
                    SecondaryMessage = "If this was not you, please contact support immediately."
                },
                ctaButtonText: "Contact Support",
                ctaButtonUrl: "/contact"
            );

            try
            {
                if (!string.IsNullOrWhiteSpace(user.Email))
                    await emailService.SendEmailAsync(user.Email, "Goodbye from Gatherly", htmlBody, cancellationToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Goodbye email sending failed: {ex.Message}");
            }

            var result = await userManager.DeleteAsync(user);

            if (result.Succeeded)
                return Result<Unit>.Success(Unit.Value);

            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return Result<Unit>.Failure(errors, 400);
        }
    }
}
