import { ENVIROMENT } from "./config/enviroment.config.js"
import express from "express"
// Importamos mongoose después de la conexión
import mongoose from "./config/mongodb.config.js"
import cors from "cors"

// Routers
import userRouter from "./routes/user.routes.js"
import authRouter from "./routes/auth.routes.js"
import workspaceRouter from "./routes/workspaces.routes.js"
import channelRouter from "./routes/channel.router.js"

const app = express()

// Basic configuration
app.use(cors({ origin: true, credentials: true }))
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
  res.status(500).json({
    ok: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
    }),
  })
})

// Start server
app.listen(ENVIROMENT.PORT, () => {
  console.log(`\n🚀 Server running on port ${ENVIROMENT.PORT}`)
})

