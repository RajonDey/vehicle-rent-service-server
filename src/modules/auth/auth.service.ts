import pool from '../../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  async signup(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }){
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
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [userData.email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create User
    // Create user
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
    
    // Find user by email
    const result = await pool.query(
      "SELECT id, name, email, password, phone, role FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    
    const user = result.rows[0];
    
    if (!user) {
      throw new Error('Invalid credentials');
    }  

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-jwt-secret-key',
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    };
  }
}
