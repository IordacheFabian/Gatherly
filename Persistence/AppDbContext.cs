using System;
using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Persistence;

public class AppDbContext(DbContextOptions options) : IdentityDbContext<User>(options)
{
    public required DbSet<Activity> Activities { get; set; }

    public required DbSet<ActivityAttendee> ActivityAttendees { get; set; }

    public required DbSet<Photo> Photos { get; set; }

    public required DbSet<Comment> Comments { get; set; }

    public required DbSet<Notification> Notifications { get; set; }
    public required DbSet<Payment> Payments { get; set; }
    public required DbSet<ActivityReview> ActivityReviews { get; set; }
    public required DbSet<SavedActivity> SavedActivities { get; set; }
    public required DbSet<WishlistActivity> WishlistActivities { get; set; }
    public required DbSet<ActivityViewHistory> ActivityViewHistory { get; set; }

    public required DbSet<UserFollowing> UserFollowings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ActivityAttendee>(x => x.HasKey(a => new { a.ActivityId, a.UserId }));

        builder.Entity<ActivityAttendee>()
            .HasOne(x => x.User)
            .WithMany(x => x.Activities)
            .HasForeignKey(x => x.UserId);

        builder.Entity<ActivityAttendee>()
            .HasOne(x => x.Activity)
            .WithMany(x => x.Attendees)
            .HasForeignKey(x => x.ActivityId);

        builder.Entity<UserFollowing>(x =>
        {
            x.HasKey(k => new { k.ObserverId, k.TargetId });

            x.HasOne(o => o.Observer)
                .WithMany(f => f.Followings)
                .HasForeignKey(o => o.ObserverId)
                .OnDelete(DeleteBehavior.Cascade);
            
            x.HasOne(o => o.Target)
                .WithMany(f => f.Followers)
                .HasForeignKey(o => o.TargetId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Comment>()
            .HasOne(x => x.ParentComment)
            .WithMany()
            .HasForeignKey(x => x.ParentCommentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Notification>()
            .HasOne(x => x.RecipientUser)
            .WithMany(x => x.Notifications)
            .HasForeignKey(x => x.RecipientUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Notification>()
            .HasOne(x => x.ActorUser)
            .WithMany()
            .HasForeignKey(x => x.ActorUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Notification>()
            .HasOne(x => x.Activity)
            .WithMany()
            .HasForeignKey(x => x.ActivityId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Notification>()
            .HasOne(x => x.Comment)
            .WithMany()
            .HasForeignKey(x => x.CommentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Payment>()
            .HasOne(x => x.Activity)
            .WithMany(x => x.Payments)
            .HasForeignKey(x => x.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Payment>()
            .HasOne(x => x.User)
            .WithMany(x => x.Payments)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ActivityReview>()
            .HasOne(x => x.Activity)
            .WithMany(x => x.Reviews)
            .HasForeignKey(x => x.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ActivityReview>()
            .HasOne(x => x.HostUser)
            .WithMany(x => x.ReviewsReceived)
            .HasForeignKey(x => x.HostUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ActivityReview>()
            .HasOne(x => x.ReviewerUser)
            .WithMany(x => x.ReviewsWritten)
            .HasForeignKey(x => x.ReviewerUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<SavedActivity>(x => x.HasKey(k => new { k.UserId, k.ActivityId }));

        builder.Entity<SavedActivity>()
            .HasOne(x => x.User)
            .WithMany(x => x.SavedActivities)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<SavedActivity>()
            .HasOne(x => x.Activity)
            .WithMany(x => x.SavedByUsers)
            .HasForeignKey(x => x.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<WishlistActivity>(x => x.HasKey(k => new { k.UserId, k.ActivityId, k.WishlistName }));

        builder.Entity<WishlistActivity>()
            .HasOne(x => x.User)
            .WithMany(x => x.WishlistActivities)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<WishlistActivity>()
            .HasOne(x => x.Activity)
            .WithMany(x => x.WishlistedByUsers)
            .HasForeignKey(x => x.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ActivityViewHistory>(x => x.HasKey(k => new { k.UserId, k.ActivityId }));

        builder.Entity<ActivityViewHistory>()
            .HasOne(x => x.User)
            .WithMany(x => x.ActivityViewHistory)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ActivityViewHistory>()
            .HasOne(x => x.Activity)
            .WithMany(x => x.ViewedByUsers)
            .HasForeignKey(x => x.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),

            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
        );

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if(property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
                }
            }
        }
    }
}
