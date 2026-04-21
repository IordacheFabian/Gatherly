namespace Application.Payments.DTOs;

public class CheckoutSessionDto
{
    public required string PaymentId { get; set; }
    public required string CheckoutSessionId { get; set; }
    public required string CheckoutUrl { get; set; }
    public required string Status { get; set; }
}