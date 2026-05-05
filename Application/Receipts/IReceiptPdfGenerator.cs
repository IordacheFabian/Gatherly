namespace Application.Receipts;

public interface IReceiptPdfGenerator
{
    byte[] Generate(ReceiptData data);

    string BuildFileName(ReceiptData data);
}
