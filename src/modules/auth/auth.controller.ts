import { Request, Response } from "express";
import * as authService from "./auth.service";

export const signup = async (req: Request, res: Response) => {
    res.json({ message: 'Signup endpoint' });
}

export const signin = async (req: Request, res: Response) => {
    res.json({ message: 'Signin endpoint' });
}