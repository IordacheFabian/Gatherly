using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class BookingLifecycleFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "ActivityAttendees",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "StatusUpdatedAt",
                table: "ActivityAttendees",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "BookingDeadline",
                table: "Activities",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxParticipants",
                table: "Activities",
                type: "INTEGER",
                nullable: false,
                defaultValue: 20);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresHostConfirmation",
                table: "Activities",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "ActivityAttendees");

            migrationBuilder.DropColumn(
                name: "StatusUpdatedAt",
                table: "ActivityAttendees");

            migrationBuilder.DropColumn(
                name: "BookingDeadline",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "MaxParticipants",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RequiresHostConfirmation",
                table: "Activities");
        }
    }
}
