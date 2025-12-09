// Update src/modules/auth/auth.service.ts
import { UserService } from "../users/user.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userService = new UserService(); // Use the shared service

export class AuthService {
  async signup(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }) {
    // Validate required fields
    if (
      !userData.name ||
      !userData.email ||
      !userData.password ||
      !userData.phone
    ) {
      throw new Error("Name, email, password, and phone are required");
    }

    // Validate password length
    if (userData.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Validate role
    if (userData.role && !["admin", "customer"].includes(userData.role)) {
      throw new Error("Role must be either admin or customer");
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user using pool directly (since userService doesn't have createUser)
    const pool = require("../../config/db").default;
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, phone, role, created_at`,
      [
        userData.name,
        userData.email.toLowerCase(),
        hashedPassword,
        userData.phone,
        userData.role || "customer",
      ]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-jwt-secret-key",
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    };
  }

  async signin(email: string, password: string) {
    // Validate input
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Find user
    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-jwt-secret-key",
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    };
  }
}
