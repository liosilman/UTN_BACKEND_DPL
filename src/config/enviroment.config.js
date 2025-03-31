import dotenv from "dotenv";

dotenv.config();

export const ENVIROMENT = {
  PORT: process.env.PORT || 3000,
  MONGODB_URL: process.env.MONGO_DB_URL, 
  SECRET_KEY_JWT: process.env.SECRET_KEY_JWT,
  GMAIL_USERNAME: process.env.GMAIL_USERNAME,
  GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
  URL_BACKEND: process.env.URL_BACKEND || "https//localhost:3000",
  URL_FRONTEND: process.env.URL_FRONTEND ||"http://localhost:5173",
  MYSQL:{
    HOST: process.env.MYSQL_HOST,
    USER: process.env.MYSQL_USER,
    PASSWORD: process.env.MYSQL_PASSWORD,
    DB_NAME: process.env.MYSQL_DB_NAME
  }
};

for(let key in ENVIROMENT){
    if(ENVIROMENT[key] === undefined){
        console.error('La variable ' + key  +' esta indefinida')
    }
}

