import { ServerError } from "../utils/errors.utils.js";
import UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import {ENVIROMENT} from "../config/enviroment.config.js";
import { sendMail } from "../utils/mailer.utils.js";
import { AUTHORIZATION_TOKEN_PROPS } from "../utils/constants/token.constants.js";

export const registerController = async (req, res) => {
    try {
        const { username, email, password, profile_image_base64 } = req.body;

        if (!username || !email || !password) {
            throw new ServerError("All fields are required", 400);
        }

        const existingUser = await UserRepository.findUserByEmail(email);
        if (existingUser) {
            throw new ServerError("Email already in use", 400);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const verification_token = jwt.sign(
            { email },
            ENVIROMENT.SECRET_KEY_JWT,
            { expiresIn: '24h' }
        );  

        await UserRepository.create({ username, email, password: passwordHash, verification_token, profile_image_base64 });
        
        await sendMail({
            to: email,
            subject: 'Valida tu mail!',
            html: `
            <h1>Valida tu mail para entrar en nuestra pagina</h1>
            <p>Esta validación es para asegurarnos que tu mail es realmente tuyo.</p>
            <a href='${ENVIROMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}'>
                Verificar cuenta
            </a>`
        });
        
        return res.status(201).send({
            message: "User created",
            status: 201,
            ok: true
        });
    } catch (error) {
        return res.status(error.status || 500).send({
            ok: false,
            status: error.status || 500,
            message: error.message || "Internal server error"
        });
    }
};

export const verifyEmailController = async (req, res) => {
    try {
        const { verification_token } = req.query;
        const { email } = jwt.verify(verification_token, ENVIROMENT.SECRET_KEY_JWT);
        
        const user = await UserRepository.findUserByEmail(email);
        if (!user || user.verification_token !== verification_token) {
            throw new ServerError("Invalid token or user not found", 400);
        }
        
        await UserRepository.verifyUser(email);
        res.redirect(ENVIROMENT.URL_FRONTEND + '/login');
    } catch (error) {
        return res.status(error.status || 500).send({
            ok: false,
            status: error.status || 500,
            message: error.message || "Internal server error"
        });
    }
};

export const loginController = async (req, res) => {
    try {    
        const { email, password } = req.body;
        const user = await UserRepository.findUserByEmail(email);
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new ServerError("Invalid credentials", 401);
        }
        
        const authorization_token = jwt.sign(
            { userId: user._id },
            ENVIROMENT.SECRET_KEY_JWT,
            { expiresIn: AUTHORIZATION_TOKEN_PROPS.EXPIRATION }
        );
        
        return res.json({
            ok: true,
            status: 200,
            message: 'Logged in',
            data: { authorization_token }
        });
    } catch (error) {
        return res.status(error.status || 500).send({
            ok: false,
            status: error.status || 500,
            message: error.message || "Internal server error"
        });
    }
};

export const resetPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserRepository.findUserByEmail(email);
        if (!user || !user.verified) {
            throw new ServerError("User not found or not verified", 400);
        }

        const reset_token = jwt.sign({ email, _id: user._id }, ENVIROMENT.SECRET_KEY_JWT, { expiresIn: '2h' });
        await sendMail({
            to: email, 
            subject: "Reset your password",
            html: `
            <h1>Has solicitado resetear tu contraseña</h1>
            <a href='${ENVIROMENT.URL_FRONTEND}/rewrite-password?reset_token=${reset_token}'>Click aquí para resetear</a>`
        });

        res.json({ ok: true, status: 200, message: 'Reset mail sent' });
    } catch (error) {
        return res.status(error.status || 500).send({
            ok: false,
            status: error.status || 500,
            message: error.message || "Internal server error"
        });
    }
};

export const rewritePasswordController = async (req, res) => {
    try {
        const { password, reset_token } = req.body;
        const { _id } = jwt.verify(reset_token, ENVIROMENT.SECRET_KEY_JWT);
        const user = await UserRepository.findUserById(_id);

        if (!user) {
            throw new ServerError('User not found', 404);
        }

        const newHashedPassword = await bcrypt.hash(password, 10);
        await UserRepository.changeUserPassword(_id, newHashedPassword);
    
        return res.json({
            ok: true,
            message: 'Password changed successfully',
            status: 200
        });
    } catch (error) {
        return res.status(error.status || 500).send({
            ok: false,
            status: error.status || 500,
            message: error.message || "Internal server error"
        });
    }
};