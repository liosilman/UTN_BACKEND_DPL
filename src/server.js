import {ENVIROMENT} from "./config/enviroment.config.js";
import express from 'express'
import authRouter from "./routes/auth.routes.js";
import mongoose from "./config/mongoDB.config.js";
import { sendMail } from "./utils/mailer.utils.js";
import cors from 'cors'
import { verifyLuckyMiddleware } from "./middlewares/verifyLuckyMiddleware.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";

const app = express()



//Dehabilito la politica de cors
//Si quieren un backend publico
app.use(cors())
//Si quieren que sea reservado para cierto dominio
/* 
app.use(cors(
    {
        origin: ENVIROMENT.URL_FRONTEND
    }
)) 
*/
app.use(express.json())


/* 
Crear una ruta llamada /api/auth

POST /register
body {
    username
    email
    password
}

response: {
    message: "User registered",
    status:201,
    ok: true
}

NO SE DEBE GUARDAR AL USUARIO EN NINGUN LADO con consologuear que llegan los datos en el body basta
Probar hacer el registro con postman
*/

app.use('/api/auth', authRouter)
app.get('/api/test/comprar', authMiddleware, (req, res) =>{
    console.log(req.user)
    res.json({
        message: 'Producto comprado'
    })
})

app.listen(ENVIROMENT.PORT, () =>{
    console.log(`El servidor se esta ejecutando en http://localhost:${ENVIROMENT.PORT}`)
})