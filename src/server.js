import { ENVIROMENT } from "./config/enviroment.config.js";
import express from 'express';
import mongoose from "./config/mongodb.config.js";
import cors from 'cors';

// Routers
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import workspaceRouter from "./routes/workspaces.routes.js";
import channelRouter from "./routes/channel.router.js";

const app = express();

// 1. Configuración básica
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// 2. Middleware de diagnóstico mejorado
app.use((req, res, next) => {
  console.log('\n🔹 Nueva petición:', {
    method: req.method,
    url: req.originalUrl,
    time: new Date().toISOString()
  });
  next();
});

// 3. Rutas principales
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// 4. Solución definitiva para los parámetros:
// Middleware para capturar workspace_id en todas las rutas relevantes
app.use('/api/workspaces/:workspace_id/channels', (req, res, next) => {
  const workspace_id = req.params.workspace_id || 
                      req.originalUrl.match(/workspaces\/([a-f0-9]{24})/)?.[1];

  if (!workspace_id || !mongoose.Types.ObjectId.isValid(workspace_id)) {
    console.error('❌ ID de workspace inválido:', workspace_id);
    return res.status(400).json({ 
      ok: false,
      message: "ID de workspace inválido",
      received_id: workspace_id
    });
  }

  req.workspace_id = workspace_id;
  console.log('✅ workspace_id capturado:', workspace_id);
  next();
});

// 5. Montaje de routers (ORDEN CRÍTICO)
app.use('/api/workspaces/:workspace_id/channels', channelRouter);
app.use('/api/workspaces', workspaceRouter);

// 6. Manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error('🔥 Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    params: req.params,
    workspace_id: req.workspace_id // Para diagnóstico
  });
  res.status(500).json({ 
    ok: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message
    })
  });
});

// 7. Inicio del servidor con información clara
app.listen(ENVIROMENT.PORT, () => {
  console.log(`\n✅ Servidor activo en http://localhost:${ENVIROMENT.PORT}`);
  console.log(`📌 Rutas de channels: /api/workspaces/:workspace_id/channels`);
  console.log(`📌 Ejemplo válido: /api/workspaces/507f1f77bcf86cd799439011/channels`);
});
