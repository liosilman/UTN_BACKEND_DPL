import dotenv from "dotenv"

dotenv.config()

export const ENVIROMENT = {
  PORT: process.env.PORT || 3000,
  MONGODB_URL: process.env.MONGO_DB_URL,
  SECRET_KEY_JWT: process.env.SECRET_KEY_JWT,
  GMAIL_USERNAME: process.env.GMAIL_USERNAME,
  GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
  URL_BACKEND: process.env.URL_BACKEND || "https//localhost:3000",
  URL_FRONTEND: process.env.URL_FRONTEND || "https://utn-2025-fe-dpl.vercel.app",
}

for (const key in ENVIROMENT) {
  if (ENVIROMENT[key] === undefined) {
    console.error("La variable " + key + " esta indefinida")
  }
}

