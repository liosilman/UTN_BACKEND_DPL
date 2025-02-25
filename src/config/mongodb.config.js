import mongoose from "mongoose";
import { ENVIROMENT } from "./enviroment.config.js";
const connectToMongoDB = async () => {
    try {
   const response = await mongoose.connect(ENVIROMENT.MONGODB_URL);
   console.log("Conectado a MongoDB // ","Conectado a la base de datos: ",response.connection.name);
    } catch (error) {
        
        console.log("ocurrio un error al conectar a la base de datos", error);
    }
}

connectToMongoDB()

export default mongoose