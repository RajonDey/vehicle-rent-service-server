
import { Router } from "express";
import { getAllUsers, updateUser, deleteUser } from "./user.controller";

import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

// GET /api/v1/users - Admin only
router.get('/', authenticate, authorize('admin'), getAllUsers);

// PUT /api/v1/users/:userId - Admin or own profile
router.put('/:userId', authenticate, updateUser);

// DELETE /api/v1/users/:userId - Admin only
router.delete('/:userId', authenticate, authorize('admin'), deleteUser);

export default router;

