// src/config/seedData.ts
import pool from "./db";

async function seedDatabase() {
  console.log("Seeding database with dummy data...");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Clear existing data (optional - be careful!)
    // await client.query('TRUNCATE TABLE bookings, vehicles, users RESTART IDENTITY CASCADE');

    // 1. Create Admin User
    console.log("Creating admin user...");
    await client.query(`
            INSERT INTO users (name, email, password, phone, role) 
            VALUES ('Admin User', 'admin@rental.com', '$2b$10$hashedpassword123', '1234567890', 'admin')
            ON CONFLICT (email) DO NOTHING
        `);

    // 2. Create Customer Users
    console.log("Creating customer users...");
    await client.query(`
            INSERT INTO users (name, email, password, phone, role) 
            VALUES 
            ('John Doe', 'john@example.com', '$2b$10$hashedpassword123', '1111111111', 'customer'),
            ('Jane Smith', 'jane@example.com', '$2b$10$hashedpassword123', '2222222222', 'customer'),
            ('Bob Wilson', 'bob@example.com', '$2b$10$hashedpassword123', '3333333333', 'customer')
            ON CONFLICT (email) DO NOTHING
        `);

    // 3. Create Vehicles
    console.log("Creating vehicles...");
    await client.query(`
            INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) 
            VALUES 
            ('Toyota Camry', 'car', 'ABC123', 50.00, 'available'),
            ('Honda Civic', 'car', 'XYZ789', 45.00, 'available'),
            ('Harley Davidson', 'bike', 'BIKE001', 30.00, 'available'),
            ('Ford Transit', 'van', 'VAN123', 80.00, 'available'),
            ('Toyota RAV4', 'SUV', 'SUV456', 70.00, 'available'),
            ('Tesla Model 3', 'car', 'TESLA001', 100.00, 'booked')
            ON CONFLICT (registration_number) DO NOTHING
        `);

    // 4. Create Bookings (for testing)
    console.log("Creating bookings...");
    await client.query(`
            INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
            VALUES 
            (2, 1, '2024-12-20', '2024-12-25', 250.00, 'active'),
            (3, 2, '2024-12-18', '2024-12-22', 180.00, 'returned'),
            (4, 3, '2024-12-15', '2024-12-20', 150.00, 'cancelled')
            ON CONFLICT DO NOTHING
        `);

    await client.query("COMMIT");
    console.log("Database seeded successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
