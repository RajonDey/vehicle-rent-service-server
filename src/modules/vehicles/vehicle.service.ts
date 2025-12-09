import pool from "../../config/db";

export class VehicleService {
  // Create a new vehicle (Admin only)
  async createVehicle(vehicleData: {
    vehicle_name: string;
    type: string;
    registration_number: string;
    daily_rent_price: number;
    availability_status?: string;
  }) {
    // Validate required fields
    if (
      !vehicleData.vehicle_name ||
      !vehicleData.type ||
      !vehicleData.registration_number ||
      !vehicleData.daily_rent_price
    ) {
      throw new Error(
        "All fields are required: vehicle_name, type, registration_number, daily_rent_price"
      );
    }

    // Validate vehicle type
    const validTypes = ["car", "bike", "van", "SUV"];
    if (!validTypes.includes(vehicleData.type.toLowerCase())) {
      throw new Error("Vehicle type must be: car, bike, van, or SUV");
    }

    // Validate daily rent price is positive
    if (vehicleData.daily_rent_price <= 0) {
      throw new Error("Daily rent price must be positive");
    }

    // Validate availability_status if provided
    if (
      vehicleData.availability_status &&
      !["available", "booked"].includes(vehicleData.availability_status)
    ) {
      throw new Error("Availability status must be: available or booked");
    }

    // Check if registration number already exists
    const existingVehicle = await pool.query(
      "SELECT id FROM vehicles WHERE registration_number = $1",
      [vehicleData.registration_number]
    );

    if (existingVehicle.rows.length > 0) {
      throw new Error("Registration number already exists");
    }

    // Insert vehicle into database
    const result = await pool.query(
      `INSERT INTO vehicles 
             (vehicle_name, type, registration_number, daily_rent_price, availability_status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, vehicle_name, type, registration_number, 
                       daily_rent_price, availability_status, created_at`,
      [
        vehicleData.vehicle_name,
        vehicleData.type.toLowerCase(),
        vehicleData.registration_number,
        vehicleData.daily_rent_price,
        vehicleData.availability_status || "available",
      ]
    );

    return result.rows[0];
  }

  // Get all vehicles
  async getAllVehicles() {
    const result = await pool.query(
      `SELECT id, vehicle_name, type, registration_number, 
                    daily_rent_price, availability_status, created_at
             FROM vehicles
             ORDER BY created_at DESC`
    );

    return result.rows;
  }

  // Get vehicle by ID
  async getVehicleById(vehicleId: number) {
    const result = await pool.query(
      `SELECT id, vehicle_name, type, registration_number, 
                    daily_rent_price, availability_status, created_at
             FROM vehicles 
             WHERE id = $1`,
      [vehicleId]
    );

    if (result.rows.length === 0) {
      throw new Error("Vehicle not found");
    }

    return result.rows[0];
  }

  // Update vehicle by ID (Admin only)
  async updateVehicle(
    vehicleId: number,
    updateData: {
      vehicle_name?: string;
      type?: string;
      registration_number?: string;
      daily_rent_price?: number;
      availability_status?: string;
    }
  ) {
    // Check if vehicle exists
    const existingVehicle = await this.getVehicleById(vehicleId);

    // Validate type if provided
    if (updateData.type) {
      const validTypes = ["car", "bike", "van", "SUV"];
      if (!validTypes.includes(updateData.type.toLowerCase())) {
        throw new Error("Vehicle type must be: car, bike, van, or SUV");
      }
      updateData.type = updateData.type.toLowerCase();
    }

    // Validate daily rent price if provided
    if (
      updateData.daily_rent_price !== undefined &&
      updateData.daily_rent_price <= 0
    ) {
      throw new Error("Daily rent price must be positive");
    }

    // Validate availability_status if provided
    if (
      updateData.availability_status &&
      !["available", "booked"].includes(updateData.availability_status)
    ) {
      throw new Error("Availability status must be: available or booked");
    }

    // Check registration number uniqueness if being updated
    if (
      updateData.registration_number &&
      updateData.registration_number !== existingVehicle.registration_number
    ) {
      const duplicate = await pool.query(
        "SELECT id FROM vehicles WHERE registration_number = $1 AND id != $2",
        [updateData.registration_number, vehicleId]
      );

      if (duplicate.rows.length > 0) {
        throw new Error("Registration number already exists");
      }
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(vehicleId);

    const query = `
            UPDATE vehicles 
            SET ${fields.join(", ")}
            WHERE id = $${paramCount}
            RETURNING id, vehicle_name, type, registration_number, 
                      daily_rent_price, availability_status, created_at
        `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete vehicle by ID (Admin only)
  async deleteVehicle(vehicleId: number) {
    // Check if vehicle exists
    await this.getVehicleById(vehicleId);

    // Check if vehicle has any active bookings
    const activeBookings = await pool.query(
      `SELECT id FROM bookings 
             WHERE vehicle_id = $1 AND status = 'active'`,
      [vehicleId]
    );

    if (activeBookings.rows.length > 0) {
      throw new Error("Cannot delete vehicle with active bookings");
    }

    // Delete the vehicle
    await pool.query("DELETE FROM vehicles WHERE id = $1", [vehicleId]);

    return { message: "Vehicle deleted successfully" };
  }
}

