using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Application.Receipts;

public class ReceiptPdfGenerator : IReceiptPdfGenerator
{
    // Brand palette (aligned with email templates / Tailwind indigo-violet)
    private const string PrimaryColor = "#6366f1";   // indigo-500
    private const string AccentColor = "#8b5cf6";    // violet-500
    private const string DarkText = "#0f172a";       // slate-900
    private const string MutedText = "#64748b";      // slate-500
    private const string CardBg = "#f8fafc";         // slate-50
    private const string Border = "#e2e8f0";         // slate-200

    public string BuildFileName(ReceiptData data)
    {
        var prefix = data.Kind == ReceiptKind.Payment ? "receipt" : "booking-confirmation";
        var safeNumber = string.IsNullOrWhiteSpace(data.ReceiptNumber) ? "receipt" : data.ReceiptNumber;
        return $"{prefix}-{safeNumber}.pdf";
    }

    public byte[] Generate(ReceiptData data)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(t => t.FontSize(10).FontColor(DarkText).FontFamily("Helvetica"));

                page.Header().Element(c => ComposeHeader(c, data));
                page.Content().PaddingVertical(15).Element(c => ComposeContent(c, data));
                page.Footer().Element(c => ComposeFooter(c, data));
            });
        });

        return document.GeneratePdf();
    }

    private static void ComposeHeader(IContainer container, ReceiptData data)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(col =>
            {
                col.Item().Text(data.AppName).FontSize(22).Bold().FontColor(PrimaryColor);
                col.Item().Text(data.AppTagline).FontSize(9).FontColor(MutedText);
            });

            row.ConstantItem(220).AlignRight().Column(col =>
            {
                var title = data.Kind == ReceiptKind.Payment ? "PAYMENT RECEIPT" : "BOOKING CONFIRMATION";
                col.Item().AlignRight().Text(title).FontSize(13).Bold().FontColor(DarkText);
                col.Item().AlignRight().Text($"No. {data.ReceiptNumber}").FontSize(10).FontColor(MutedText);
                if (!string.IsNullOrWhiteSpace(data.InvoiceNumber))
                {
                    col.Item().AlignRight().Text($"Invoice: {data.InvoiceNumber}").FontSize(9).FontColor(MutedText);
                }
                col.Item().AlignRight().Text($"Issued: {data.IssuedAt.ToLocalTime():MMM d, yyyy}").FontSize(9).FontColor(MutedText);
            });
        });
    }

    private static void ComposeContent(IContainer container, ReceiptData data)
    {
        container.Column(col =>
        {
            col.Spacing(18);

            // Divider gradient bar
            col.Item().Height(3).Background(PrimaryColor);

            // Bill-To + Status
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("BILL TO").FontSize(8).Bold().FontColor(MutedText).LetterSpacing(1);
                    c.Item().PaddingTop(4).Text(data.RecipientName).FontSize(11).Bold();
                    c.Item().Text(data.RecipientEmail).FontSize(10).FontColor(MutedText);
                });

                row.ConstantItem(160).AlignRight().Column(c =>
                {
                    c.Item().AlignRight().Text("STATUS").FontSize(8).Bold().FontColor(MutedText).LetterSpacing(1);
                    c.Item().PaddingTop(4).AlignRight()
                        .Background(data.StatusColorHex)
                        .PaddingVertical(5).PaddingHorizontal(12)
                        .Text(data.StatusLabel.ToUpperInvariant())
                        .FontColor(Colors.White).FontSize(10).Bold();
                });
            });

            // Activity card
            col.Item().Background(CardBg).Border(1).BorderColor(Border).Padding(15).Column(c =>
            {
                c.Spacing(6);
                c.Item().Text("ACTIVITY").FontSize(8).Bold().FontColor(MutedText).LetterSpacing(1);
                c.Item().Text(data.ActivityTitle).FontSize(13).Bold().FontColor(DarkText);

                c.Item().PaddingTop(4).Row(row =>
                {
                    row.RelativeItem().Column(inner =>
                    {
                        inner.Item().Text(t =>
                        {
                            t.Span("When:  ").FontColor(MutedText);
                            t.Span(data.ActivityDate.ToLocalTime().ToString("dddd, MMM d, yyyy 'at' h:mm tt"));
                        });
                        var location = string.Join(", ", new[] { data.Venue, data.City }
                            .Where(x => !string.IsNullOrWhiteSpace(x)));
                        if (!string.IsNullOrWhiteSpace(location))
                        {
                            inner.Item().Text(t =>
                            {
                                t.Span("Where: ").FontColor(MutedText);
                                t.Span(location);
                            });
                        }
                        if (!string.IsNullOrWhiteSpace(data.HostName))
                        {
                            inner.Item().Text(t =>
                            {
                                t.Span("Host:  ").FontColor(MutedText);
                                t.Span(data.HostName);
                            });
                        }
                    });
                });
            });

            // Itemized table
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(c =>
                {
                    c.RelativeColumn(5);
                    c.RelativeColumn(1);
                    c.RelativeColumn(2);
                    c.RelativeColumn(2);
                });

                table.Header(header =>
                {
                    header.Cell().Background(PrimaryColor).Padding(8).Text("Description").FontColor(Colors.White).Bold().FontSize(10);
                    header.Cell().Background(PrimaryColor).Padding(8).AlignCenter().Text("Qty").FontColor(Colors.White).Bold().FontSize(10);
                    header.Cell().Background(PrimaryColor).Padding(8).AlignRight().Text("Unit").FontColor(Colors.White).Bold().FontSize(10);
                    header.Cell().Background(PrimaryColor).Padding(8).AlignRight().Text("Total").FontColor(Colors.White).Bold().FontSize(10);
                });

                var isFree = data.Amount <= 0;
                var unit = isFree ? "FREE" : $"{data.Amount:F2} {data.Currency}";
                var total = isFree ? "FREE" : $"{data.Amount:F2} {data.Currency}";

                table.Cell().BorderBottom(1).BorderColor(Border).Padding(8).Column(c =>
                {
                    c.Item().Text(data.ActivityTitle).FontSize(10).Bold();
                    c.Item().Text(data.Kind == ReceiptKind.Payment ? "Activity booking" : "Booking confirmation")
                        .FontSize(9).FontColor(MutedText);
                });
                table.Cell().BorderBottom(1).BorderColor(Border).Padding(8).AlignCenter().Text("1").FontSize(10);
                table.Cell().BorderBottom(1).BorderColor(Border).Padding(8).AlignRight().Text(unit).FontSize(10);
                table.Cell().BorderBottom(1).BorderColor(Border).Padding(8).AlignRight().Text(total).FontSize(10).Bold();
            });

            // Totals box
            col.Item().AlignRight().Width(220).Background(CardBg).Border(1).BorderColor(Border).Padding(12).Column(c =>
            {
                c.Spacing(4);
                var amountText = data.Amount <= 0 ? "FREE" : $"{data.Amount:F2} {data.Currency}";
                c.Item().Row(r =>
                {
                    r.RelativeItem().Text("Subtotal").FontColor(MutedText);
                    r.ConstantItem(100).AlignRight().Text(amountText);
                });
                c.Item().Row(r =>
                {
                    r.RelativeItem().Text("Tax").FontColor(MutedText);
                    r.ConstantItem(100).AlignRight().Text("0.00");
                });
                c.Item().PaddingTop(4).BorderTop(1).BorderColor(Border).PaddingTop(6).Row(r =>
                {
                    r.RelativeItem().Text("TOTAL").Bold();
                    r.ConstantItem(100).AlignRight().Text(amountText).Bold().FontColor(AccentColor);
                });
            });

            // Payment / Booking metadata
            col.Item().PaddingTop(4).Column(c =>
            {
                c.Spacing(3);
                if (data.PaidAt.HasValue)
                {
                    c.Item().Text(t =>
                    {
                        t.Span("Paid on: ").FontColor(MutedText).FontSize(9);
                        t.Span(data.PaidAt.Value.ToLocalTime().ToString("MMM d, yyyy 'at' h:mm tt")).FontSize(9);
                    });
                }
                if (data.RefundedAt.HasValue)
                {
                    c.Item().Text(t =>
                    {
                        t.Span("Refunded on: ").FontColor(MutedText).FontSize(9);
                        t.Span(data.RefundedAt.Value.ToLocalTime().ToString("MMM d, yyyy 'at' h:mm tt")).FontSize(9);
                    });
                }
                if (!string.IsNullOrWhiteSpace(data.Provider))
                {
                    c.Item().Text(t =>
                    {
                        t.Span("Provider: ").FontColor(MutedText).FontSize(9);
                        t.Span(data.Provider).FontSize(9);
                    });
                }
                if (!string.IsNullOrWhiteSpace(data.CheckoutSessionId))
                {
                    c.Item().Text(t =>
                    {
                        t.Span("Session: ").FontColor(MutedText).FontSize(9);
                        t.Span(data.CheckoutSessionId).FontSize(9);
                    });
                }
            });

            // Thank-you note
            col.Item().PaddingTop(10).Background(CardBg).Padding(12).Column(c =>
            {
                c.Item().Text("Thank you for choosing Gatherly!").FontSize(11).Bold().FontColor(PrimaryColor);
                c.Item().PaddingTop(3).Text(data.Kind == ReceiptKind.Payment
                    ? "This receipt confirms your payment. Please keep it for your records."
                    : "This document confirms your booking. Please keep it for your records.")
                    .FontSize(9).FontColor(MutedText);
            });
        });
    }

    private static void ComposeFooter(IContainer container, ReceiptData data)
    {
        container.BorderTop(1).BorderColor(Border).PaddingTop(8).Row(row =>
        {
            row.RelativeItem().Text(t =>
            {
                t.Span("Need help? ").FontColor(MutedText).FontSize(8);
                t.Span(data.SupportEmail).FontColor(PrimaryColor).FontSize(8);
            });
            row.RelativeItem().AlignRight().Text(t =>
            {
                t.Span("Page ").FontColor(MutedText).FontSize(8);
                t.CurrentPageNumber().FontColor(MutedText).FontSize(8);
                t.Span(" of ").FontColor(MutedText).FontSize(8);
                t.TotalPages().FontColor(MutedText).FontSize(8);
            });
        });
    }
}
