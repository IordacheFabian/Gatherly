using Application.Profiles.Commands;
using FluentValidation;

namespace Application.Profiles.Validators;

public class EditProfileValidator : AbstractValidator<EditProfile.Command>
{
    public EditProfileValidator()
    {
        RuleFor(x => x.UserProfile).NotNull().WithMessage("Profile payload is required.");

        RuleFor(x => x.UserProfile.DisplayName)
            .NotEmpty().WithMessage("Display name is required.")
            .MaximumLength(100).WithMessage("Display name cannot exceed 100 characters.")
            .When(x => x.UserProfile != null);

        RuleFor(x => x.UserProfile.Bio)
            .MaximumLength(2000).WithMessage("Bio cannot exceed 2000 characters.")
            .When(x => x.UserProfile != null && x.UserProfile.Bio != null);
    }
}
