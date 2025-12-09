// src/modules/bookings/booking.controller.ts
import { Request, Response } from "express";
import { BookingService } from "./booking.service";

const bookingService = new BookingService();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { vehicle_id, rent_start_date, rent_end_date } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const booking = await bookingService.createBooking(
      vehicle_id,
      rent_start_date,
      rent_end_date,
      customerId
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const bookings = await bookingService.getBookings(userId, role);

    res.json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId || "");
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await bookingService.cancelBooking(bookingId, userId);

    res.json({
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const returnBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId || "");

    const result = await bookingService.markAsReturned(bookingId);

    res.json({
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
