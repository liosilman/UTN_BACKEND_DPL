import express from "express";
import { loginController, registerController, resetPasswordController, rewritePasswordController, verifyEmailController, verifyTokenController } from "../controllers/auth.controller.js";



const authRouter = express.Router();

authRouter.post("/register", registerController)
authRouter.get('/verify-email', verifyEmailController)
authRouter.post('/login', loginController)
authRouter.get('/reset-password', resetPasswordController) 
authRouter.post('/reset-password', resetPasswordController)
authRouter.get('/verify-reset-token', verifyTokenController);
authRouter.post('/rewrite-password', rewritePasswordController)

export default authRouter