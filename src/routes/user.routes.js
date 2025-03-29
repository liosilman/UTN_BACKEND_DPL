import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getCurrentUserController, searchUserByEmail } from "../controllers/user.controller.js";

const userRouter = Router();

// Ruta protegida para obtener información del usuario actual
userRouter.get('/me', authMiddleware, getCurrentUserController);
userRouter.get("/search", searchUserByEmail);
export default userRouter;