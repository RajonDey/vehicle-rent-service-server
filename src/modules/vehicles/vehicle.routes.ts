import { Router } from "express";
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "./vehicle.controller";


// Import middleware
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

// POST /api/v1/vehicles - Admin only
router.post("/", authenticate, authorize("admin"), createVehicle);

// GET /api/v1/vehicles - Public
router.get('/', getAllVehicles);

// GET /api/v1/vehicles/:vehicleId - Public
router.get('/:vehicleId', getVehicleById);

// PUT /api/v1/vehicles/:vehicleId - Admin only
router.put("/:vehicleId", authenticate, authorize("admin"), updateVehicle);

// DELETE /api/v1/vehicles/:vehicleId - Admin only
router.delete("/:vehicleId", authenticate, authorize("admin"), deleteVehicle);

export default router;