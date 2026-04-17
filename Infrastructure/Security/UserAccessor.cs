using System;
using System.Security.Claims;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Security;

public class UserAccessor(
    IHttpContextAccessor httpContextAccessor,
    UserManager<User> userManager,
    IProfileRepository profileRepository) : IUserAccessor
{
    public async Task<User> GetUserAsync()
    {
        return await userManager.Users.FirstOrDefaultAsync(x => x.Id == GetUserId())
            ?? throw new UnauthorizedAccessException("No user is logged in");
    }

    public string GetUserId()
    {
        return GetUserIdOrNull()
            ?? throw new Exception("User not found");
    }

    public string? GetUserIdOrNull()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    public async Task<User> GetUserWithPhotosAsync()
    {
        var userId = GetUserId();

        return await profileRepository.QueryUsers()
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(x => x.Id == userId)
                ?? throw new UnauthorizedAccessException("No user is logged in");
    }
}
