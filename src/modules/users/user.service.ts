import pool from "../../config/db";
import bcrypt from "bcrypt";

export class UserService {
  // Get all users (Admin only)
  async getAllUsers() {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, created_at
             FROM users
             ORDER BY created_at DESC`
    );

    return result.rows;
  }

  // Get user by ID
  async getUserById(userId: number) {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, created_at
             FROM users 
             WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  }

  // Update user by ID
  async updateUser(
    userId: number,
    updateData: {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      role?: string;
    },
    currentUserRole: string,
    currentUserId: number
  ) {
    // Check if user exists
    const existingUser = await this.getUserById(userId);

    // Authorization check:
    // 1. Admin can update anyone
    // 2. Customer can only update themselves
    if (currentUserRole !== "admin" && currentUserId !== userId) {
      throw new Error("You can only update your own profile");
    }

    // Validate role if being updated
    if (updateData.role) {
      // Only admin can change roles
      if (currentUserRole !== "admin") {
        throw new Error("Only admin can change user roles");
      }

      if (!["admin", "customer"].includes(updateData.role)) {
        throw new Error("Role must be either admin or customer");
      }
    }

    // Validate password if being updated
    if (updateData.password) {
      if (updateData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      // Hash the new password
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Check email uniqueness if being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const duplicate = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [updateData.email.toLowerCase(), userId]
      );

      if (duplicate.rows.length > 0) {
        throw new Error("Email already exists");
      }
      updateData.email = updateData.email.toLowerCase();
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

    values.push(userId);

    const query = `
            UPDATE users 
            SET ${fields.join(", ")}
            WHERE id = $${paramCount}
            RETURNING id, name, email, phone, role, created_at
        `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete user by ID (Admin only)
  async deleteUser(userId: number) {
    // Check if user exists
    const user = await this.getUserById(userId);

    // Check if user has any active bookings
    const activeBookings = await pool.query(
      `SELECT id FROM bookings 
             WHERE customer_id = $1 AND status = 'active'`,
      [userId]
    );

    if (activeBookings.rows.length > 0) {
      throw new Error("Cannot delete user with active bookings");
    }

    // Delete the user (cascade will delete their bookings)
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    return { message: "User deleted successfully" };
  }

    // Helper: Get user by email (for auth service)
    async getUserByEmail(email: string) {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );
        
        return result.rows[0];
    }
}