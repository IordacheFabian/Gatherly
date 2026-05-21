using Application.Payments.Commands;
using Application.Payments.DTOs;
using Application.Payments.Queries;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;

namespace API.Controllers;

public class PaymentsController(StripeSettings stripeSettings) : BaseApiController
{
    [HttpPost("{activityId}/checkout")]
    public async Task<ActionResult<CheckoutSessionDto>> Checkout(string activityId)
    {
        return HandleResult(await Mediator.Send(new CreateCheckoutSession.Command { ActivityId = activityId }));
    }

    [HttpPost("{activityId}/cancel-pending")]
    public async Task<IActionResult> CancelPending(string activityId)
    {
        return HandleResult(await Mediator.Send(new CancelPendingPayment.Command { ActivityId = activityId }));
    }

    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var stripeSignature = Request.Headers["Stripe-Signature"].ToString();

        if (string.IsNullOrWhiteSpace(stripeSettings.WebhookSecret))
            return BadRequest("Webhook secret is not configured.");

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, stripeSettings.WebhookSecret);
        }
        catch (StripeException)
        {
            return BadRequest("Invalid webhook signature.");
        }

        switch (stripeEvent.Type)
        {
            case EventTypes.CheckoutSessionCompleted:
            {
                var session = stripeEvent.Data.Object as Session;
                if (session?.Id is not null)
                    await Mediator.Send(new CompletePayment.Command { CheckoutSessionId = session.Id });
                break;
            }
            case EventTypes.CheckoutSessionExpired:
            {
                var session = stripeEvent.Data.Object as Session;
                if (session?.Id is not null)
                    await Mediator.Send(new ExpirePayment.Command { CheckoutSessionId = session.Id });
                break;
            }
        }

        return Ok();
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<PaymentHistoryItemDto>>> History(int limit = 50)
    {
        return HandleResult(await Mediator.Send(new GetPaymentHistory.Query { Limit = limit }));
    }

    [HttpGet("{id}/receipt")]
    public async Task<ActionResult<PaymentReceiptDto>> Receipt(string id)
    {
        return HandleResult(await Mediator.Send(new GetPaymentReceipt.Query { PaymentId = id }));
    }

    [HttpGet("{id}/receipt/pdf")]
    public async Task<IActionResult> ReceiptPdf(string id)
    {
        var result = await Mediator.Send(new DownloadPaymentReceipt.Query { PaymentId = id });

        if (!result.IsSuccess || result.Value is null)
            return result.Code == 404 ? NotFound() : BadRequest(result.Error);

        return File(result.Value.Content, "application/pdf", result.Value.FileName);
    }
}