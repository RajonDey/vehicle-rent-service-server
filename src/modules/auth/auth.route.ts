// src/modules/auth/auth.routes.ts
import { Router } from "express";
import { signup, signin } from "./auth.controller";

const router = Router();

// POST /api/v1/auth/signup
router.post("/signup", signup);

// POST /api/v1/auth/signin
router.post("/signin", signin);

export default router;
