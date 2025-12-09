import express from "express";
import dotenv from "dotenv";

// Import routes
import authRoutes from './modules/auth/auth.route';
import vehicleRoutes from './modules/vehicles/vehicle.routes';
import userRoutes from "./modules/users/user.routes";
import bookingRoutes from "./modules/bookings/booking.routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/bookings", bookingRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('Vehicle Rental System API is running...');
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}