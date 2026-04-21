using Application.Interfaces.IRepository;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Repositories;

public class PaymentRepository(AppDbContext context) : IPaymentRepository
{
    public IQueryable<Payment> Query()
    {
        return context.Payments.AsQueryable();
    }

    public Task<Payment?> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        return context.Payments.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task AddAsync(Payment payment, CancellationToken cancellationToken)
    {
        return context.Payments.AddAsync(payment, cancellationToken).AsTask();
    }

    public void Update(Payment payment)
    {
        context.Payments.Update(payment);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
    {
        return context.SaveChangesAsync(cancellationToken);
    }
}