using API.Middleware;
using API.Services;
using Application.Activities.Queries;
using Application.Activities.Validators;
using Application.Core;
using Application.Interfaces;
using Application.Interfaces.IRepository;
using Application.Receipts;
using FluentValidation;
using Infrastructure;
using Infrastructure.Photos;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Persistence.Repositories;
using System.Text.Json.Serialization;

namespace API.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddControllers(opt =>
        {
            var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
            opt.Filters.Add(new AuthorizeFilter(policy));
        })
        .AddJsonOptions(opt =>
        {
            opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });

        services.AddDbContext<AppDbContext>(opt =>
        {
            opt.UseSqlite(config.GetConnectionString("DefaultConnection"));
        });

        services.AddCors(opt =>
        {
            opt.AddPolicy("CorsPolicy", policy =>
            {
                policy
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .WithOrigins(
                        "http://localhost:8080",
                        "https://localhost:8080",
                        "http://localhost:3000",
                        "https://localhost:3000"
                    );
            });
        });

        services.AddSignalR();

        services.AddMediatR(x =>
        {
            x.RegisterServicesFromAssemblyContaining<GetActivityList.Handler>();
            x.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddAutoMapper(cfg => { }, typeof(MappingProfiles).Assembly);
        services.AddValidatorsFromAssemblyContaining<CreateActivityValidator>();
        services.AddTransient<ExceptionMiddleware>();

        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IActivityRepository, ActivityRepository>();
        services.AddScoped<IActivityReviewRepository, ActivityReviewRepository>();
        services.AddScoped<IProfileRepository, ProfileRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        return services;
    }

    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<IUserAccessor, UserAccessor>();
        services.AddScoped<IPhotoService, PhotoService>();
        services.AddScoped<INotificationService, NotificationService>();

        services.Configure<SmtpSettings>(config.GetSection("SmtpSettings"));
        services.AddSingleton(sp =>
            sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<SmtpSettings>>().Value);
        services.AddScoped<IEmailService, EmailService>();

        services.AddSingleton<IReceiptPdfGenerator, ReceiptPdfGenerator>();
        services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));

        services.Configure<StripeSettings>(config.GetSection("Stripe"));
        services.AddSingleton(sp =>
            sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<StripeSettings>>().Value);
        services.AddScoped<IStripeService, StripeService>();

        return services;
    }
}
