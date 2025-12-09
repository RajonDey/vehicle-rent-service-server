import { Request, Response } from "express";
import { UserService } from "./user.service";

const userService = new UserService();


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // This endpoint is admin-only (enforced by middleware)
    const users = await userService.getAllUsers();

    res.json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve users",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId || "");

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const updateData = req.body;

    // Get current user from authentication middleware
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const updatedUser = await userService.updateUser(
      userId,
      updateData,
      currentUser.role,
      currentUser.id
    );

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId || "");

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const result = await userService.deleteUser(userId);

    res.json({
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
};

