using Application.Reviews.Commands;
using FluentValidation;

namespace Application.Reviews.Validators;

public class AddOrUpdateActivityReviewValidator : AbstractValidator<AddOrUpdateActivityReview.Command>
{
    public AddOrUpdateActivityReviewValidator()
    {
        RuleFor(x => x.ActivityId)
            .NotEmpty().WithMessage("Activity is required.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");

        RuleFor(x => x.Body)
            .NotEmpty().WithMessage("Review body is required.")
            .MaximumLength(2000).WithMessage("Review body cannot exceed 2000 characters.");
    }
}
