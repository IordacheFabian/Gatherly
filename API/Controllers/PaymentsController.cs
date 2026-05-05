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

    [HttpGet("{id}/receipt/pdf")]
    public async Task<IActionResult> ReceiptPdf(string id)
    {
        var result = await Mediator.Send(new DownloadPaymentReceipt.Query { PaymentId = id });

        if (!result.IsSuccess || result.Value is null)
        {
            return result.Code == 404 ? NotFound() : BadRequest(result.Error);
        }

        return File(result.Value.Content, "application/pdf", result.Value.FileName);
    }
}