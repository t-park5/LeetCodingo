using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeetCodingo.Api.Controllers;

[Authorize]
public abstract class AuthenticatedController : ControllerBase
{
    protected bool IsCurrentUser(int userId) =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var currentUserId)
        && currentUserId == userId;
}
