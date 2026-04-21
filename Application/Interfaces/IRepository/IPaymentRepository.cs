using Domain;

namespace Application.Interfaces.IRepository;

public interface IPaymentRepository
{
    IQueryable<Payment> Query();
    Task<Payment?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task AddAsync(Payment payment, CancellationToken cancellationToken);
    void Update(Payment payment);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}