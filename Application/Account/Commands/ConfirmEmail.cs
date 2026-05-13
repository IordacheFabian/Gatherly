using Application.Core;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Account.Commands;

public class ConfirmEmail
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string UserId { get; set; }
        public required string Token { get; set; }
    }

    public class Handler(UserManager<User> userManager) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.Token))
                return Result<Unit>.Failure("UserId and token are required.", 400);

            var user = await userManager.FindByIdAsync(request.UserId);
            if (user == null)
                return Result<Unit>.Failure("User not found.", 404);

            var result = await userManager.ConfirmEmailAsync(user, request.Token);
            if (result.Succeeded)
                return Result<Unit>.Success(Unit.Value);

            return Result<Unit>.Failure("Email confirmation failed. The link may be invalid or expired.", 400);
        }
    }
}
