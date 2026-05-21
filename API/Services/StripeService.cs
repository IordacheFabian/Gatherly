using Application.Interfaces;
using Stripe;
using Stripe.Checkout;

namespace API.Services;

public class StripeService(StripeSettings settings) : IStripeService
{
    public async Task<StripeCheckoutResult> CreateCheckoutSessionAsync(
        string internalPaymentId,
        string activityId,
        string activityTitle,
        decimal amount,
        string currency,
        string successUrl,
        string cancelUrl,
        CancellationToken cancellationToken = default)
    {
        StripeConfiguration.ApiKey = settings.SecretKey;

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = ["card"],
            LineItems =
            [
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = currency.ToLowerInvariant(),
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = activityTitle,
                        },
                        UnitAmount = (long)(amount * 100), // Stripe uses cents
                    },
                    Quantity = 1,
                },
            ],
            Mode = "payment",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            ClientReferenceId = internalPaymentId,
            Metadata = new Dictionary<string, string>
            {
                { "paymentId", internalPaymentId },
                { "activityId", activityId },
            },
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options, cancellationToken: cancellationToken);

        return new StripeCheckoutResult(session.Id, session.Url);
    }
}
