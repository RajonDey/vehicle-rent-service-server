// src/modules/bookings/booking.routes.ts
import { Router } from "express";
import {
  createBooking,
  getBookings,
  cancelBooking,
  returnBooking,
} from "./booking.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

// POST /api/v1/bookings - Customer or Admin
router.post("/", authenticate, createBooking);

// GET /api/v1/bookings - Role-based
router.get("/", authenticate, getBookings);

// PUT /api/v1/bookings/:bookingId/cancel - Customer cancels their booking
router.put("/:bookingId/cancel", authenticate, cancelBooking);

// PUT /api/v1/bookings/:bookingId/return - Admin marks as returned
router.put(
  "/:bookingId/return",
  authenticate,
  authorize("admin"),
  returnBooking
);

export default router;
