using System;
using Application.Activities.DTOs;
using FluentValidation;

namespace Application.Activities.Validators;

public class BaseActivityValidator<T, TDto>
    : AbstractValidator<T> where TDto : BaseActivityDto
{
    public BaseActivityValidator(Func<T, TDto> selector)
    {
        RuleFor(x => selector(x).Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(100).WithMessage("Title cannot exceed 100 characters.");
        RuleFor(x => selector(x).Description)
            .NotEmpty().WithMessage("Description is required.");
        RuleFor(x => selector(x).Date)
            .GreaterThan(DateTime.UtcNow).WithMessage("Date must be in the future.");
        RuleFor(x => selector(x).Category)
            .NotEmpty().WithMessage("Category is required.");
        RuleFor(x => selector(x).City)
            .NotEmpty().WithMessage("City is required.");
        RuleFor(x => selector(x).Venue)
            .NotEmpty().WithMessage("Venue is required.");
        RuleFor(x => selector(x).Latitude)
            .NotEmpty().WithMessage("Latitude is required.")
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90.");
        RuleFor(x => selector(x).Longitude)
            .NotEmpty().WithMessage("Logitude is required.")
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180.");

        RuleFor(x => selector(x).MaxParticipants)
            .GreaterThan(0).WithMessage("Max participants must be greater than 0.")
            .LessThanOrEqualTo(1000).WithMessage("Max participants cannot exceed 1000.");

        RuleFor(x => selector(x).BookingDeadline)
            .NotNull().WithMessage("Booking deadline is required.")
            .GreaterThan(DateTime.UtcNow).WithMessage("Booking deadline must be in the future.")
            .LessThanOrEqualTo(x => selector(x).Date)
            .WithMessage("Booking deadline cannot be after activity date.");
    }
}
