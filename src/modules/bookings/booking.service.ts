// src/modules/bookings/booking.service.ts
import pool from "../../config/db";

export class BookingService {
  // Create booking
  async createBooking(
    vehicleId: number,
    startDate: string,
    endDate: string,
    customerId: number
  ) {
    // Check vehicle exists and is available
    const vehicleCheck = await pool.query(
      "SELECT daily_rent_price FROM vehicles WHERE id = $1 AND availability_status = $2",
      [vehicleId, "available"]
    );

    if (vehicleCheck.rows.length === 0) {
      throw new Error("Vehicle not available");
    }

    const dailyPrice = vehicleCheck.rows[0].daily_rent_price;

    // Calculate total days and price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
    );

    if (days <= 0) {
      throw new Error("End date must be after start date");
    }

    const totalPrice = days * dailyPrice;

    // Create booking
    const bookingResult = await pool.query(
      `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
      [customerId, vehicleId, startDate, endDate, totalPrice]
    );

    // Update vehicle to booked
    await pool.query(
      "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
      ["booked", vehicleId]
    );

    return bookingResult.rows[0];
  }

  // Get all bookings (for admin) or customer's bookings
  async getBookings(userId: number, role: string) {
    let query = `
            SELECT b.*, u.name as customer_name, v.vehicle_name 
            FROM bookings b
            JOIN users u ON b.customer_id = u.id
            JOIN vehicles v ON b.vehicle_id = v.id
        `;

    if (role === "customer") {
      query += " WHERE b.customer_id = $1";
      return (await pool.query(query, [userId])).rows;
    } else {
      // admin sees all
      return (await pool.query(query)).rows;
    }
  }

  // Cancel booking (customer only, before start date)
  async cancelBooking(bookingId: number, userId: number) {
    // Check booking exists and belongs to user
    const bookingCheck = await pool.query(
      "SELECT * FROM bookings WHERE id = $1 AND customer_id = $2",
      [bookingId, userId]
    );

    if (bookingCheck.rows.length === 0) {
      throw new Error("Booking not found or not authorized");
    }

    const booking = bookingCheck.rows[0];
    const today = new Date();
    const startDate = new Date(booking.rent_start_date);

    // Can only cancel before start date
    if (today >= startDate) {
      throw new Error("Cannot cancel booking after start date");
    }

    // Update booking status
    await pool.query("UPDATE bookings SET status = $1 WHERE id = $2", [
      "cancelled",
      bookingId,
    ]);

    // Update vehicle back to available
    await pool.query(
      "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
      ["available", booking.vehicle_id]
    );

    return { message: "Booking cancelled successfully" };
  }

  // Mark booking as returned (admin only)
  async markAsReturned(bookingId: number) {
    const bookingCheck = await pool.query(
      "SELECT vehicle_id FROM bookings WHERE id = $1",
      [bookingId]
    );

    if (bookingCheck.rows.length === 0) {
      throw new Error("Booking not found");
    }

    const vehicleId = bookingCheck.rows[0].vehicle_id;

    // Update booking status
    await pool.query("UPDATE bookings SET status = $1 WHERE id = $2", [
      "returned",
      bookingId,
    ]);

    // Update vehicle back to available
    await pool.query(
      "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
      ["available", vehicleId]
    );

    return { message: "Booking marked as returned" };
  }
}
