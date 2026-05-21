namespace Application.Interfaces;

public record StripeCheckoutResult(string SessionId, string CheckoutUrl);

public interface IStripeService
{
    Task<StripeCheckoutResult> CreateCheckoutSessionAsync(
        string internalPaymentId,
        string activityId,
        string activityTitle,
        decimal amount,
        string currency,
        string successUrl,
        string cancelUrl,
        CancellationToken cancellationToken = default);
}
