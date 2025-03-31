import express from "express"
import cors from "cors"
import { ENVIROMENT } from "./config/enviroment.config.js"

// Importamos mongoose después de la conexión
import mongoose from "./config/mongodb.config.js"

// Routers
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import workspaceRouter from "./routes/workspaces.routes.js"
import channelRouter from "./routes/channel.router.js"

const app = express()

// Basic configuration
app.use(cors({}))
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true }))


// Routes
app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)

// Workspace ID extraction middleware
app.use("/api/workspaces/:workspace_id/channels", (req, res, next) => {
  const workspace_id = req.params.workspace_id || req.originalUrl.match(/workspaces\/([a-f0-9]{24})/)?.[1]

  if (!workspace_id || !mongoose.Types.ObjectId.isValid(workspace_id)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid workspace ID",
      received_id: workspace_id,
    })
  }

  req.workspace_id = workspace_id
  next()
})

// Mount routers
app.use("/api/workspaces/:workspace_id/channels", channelRouter)
app.use("/api/workspaces", workspaceRouter)

// Error handler
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err)
  res.status(500).json({
    ok: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV !== "production" && {
      error: err.message,
      stack: err.stack,
    }),
  })
})

// Start server
const PORT = ENVIROMENT.PORT || 3000
app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}

`)
})

