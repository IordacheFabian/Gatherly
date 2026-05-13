using Application.Core;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Account.Commands;

public class ResetPassword
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string UserId { get; set; }
        public required string Token { get; set; }
        public required string NewPassword { get; set; }
    }

    public class Handler(UserManager<User> userManager) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByIdAsync(request.UserId);
            if (user == null)
                return Result<Unit>.Failure("Invalid or expired reset link.", 400);

            var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

            if (result.Succeeded)
                return Result<Unit>.Success(Unit.Value);

            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return Result<Unit>.Failure(errors, 400);
        }
    }
}
