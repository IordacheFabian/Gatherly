using Application.Payments.Commands;
using FluentValidation;

namespace Application.Payments.Validators;

public class SimulateCheckoutValidator : AbstractValidator<SimulateCheckout.Command>
{
    public SimulateCheckoutValidator()
    {
        RuleFor(x => x.ActivityId)
            .NotEmpty().WithMessage("Activity is required.");
    }
}
