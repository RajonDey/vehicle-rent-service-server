// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Call service to create user
    const result = await authService.signup({
      name,
      email,
      password,
      phone,
      role,
    });

    // Return success response matching API Reference format
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    // Return error response
    res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Call service to authenticate user
    const result = await authService.signin(email, password);

    // Return success response matching API Reference format
    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    // Return error response
    res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};
