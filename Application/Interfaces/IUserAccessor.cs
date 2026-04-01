using System;
using Domain;

namespace Application.Interfaces;

public interface IUserAccessor
{
    string GetUserId();
    string? GetUserIdOrNull();
    Task<User> GetUserAsync();
    Task<User> GetUserWithPhotosAsync();
}
