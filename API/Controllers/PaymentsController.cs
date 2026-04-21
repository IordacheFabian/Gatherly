using Application.Payments.DTOs;
using Application.Payments.Queries;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class PaymentsController : BaseApiController
{
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
}