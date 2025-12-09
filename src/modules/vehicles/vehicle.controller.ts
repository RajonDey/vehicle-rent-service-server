import { Request, Response } from "express";
import { VehicleService } from "./vehicle.service";

const vehicleService = new VehicleService();

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleData = req.body;

    const vehicle = await vehicleService.createVehicle(vehicleData);

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: vehicle,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to add vehicle",
    });
  }
};

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();

    res.json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: vehicles,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve vehicles",
    });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId || "");

    if (isNaN(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

    const vehicle = await vehicleService.getVehicleById(vehicleId);

    res.json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (error: any) {
    if (error.message === "Vehicle not found") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve vehicle",
    });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId || "");

    if (isNaN(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

    const updateData = req.body;

    const vehicle = await vehicleService.updateVehicle(vehicleId, updateData);

    res.json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error: any) {
    if (error.message === "Vehicle not found") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Failed to update vehicle",
    });
  }
};


export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId || "");

    if (isNaN(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

    const result = await vehicleService.deleteVehicle(vehicleId);

    res.json({
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    if (error.message === "Vehicle not found") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete vehicle",
    });
  }
};