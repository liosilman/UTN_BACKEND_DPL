# Slack Clone Backend

## Descripción del Proyecto

Este proyecto es una API RESTful desarrollada con Node.js y Express que proporciona la funcionalidad de backend para una aplicación de chat en tiempo real. La aplicación permite a los usuarios registrarse, iniciar sesión, crear espacios de trabajo (workspaces), canales de comunicación y enviar mensajes.

El sistema incluye autenticación completa con JWT, verificación de correo electrónico, recuperación de contraseña y gestión de usuarios, workspaces y canales.

## Características Principales

- **Autenticación de usuarios**: Registro, inicio de sesión, verificación de correo electrónico y recuperación de contraseña.
- **Gestión de workspaces**: Creación de espacios de trabajo e invitación de usuarios.
- **Canales de comunicación**: Creación de canales dentro de workspaces.
- **Mensajería**: Envío y recepción de mensajes en canales.
- **Seguridad**: Protección de rutas mediante JWT, encriptación de contraseñas con bcrypt.

## Tecnologías y Librerías Utilizadas

### Principales
- **Node.js**: Entorno de ejecución para JavaScript del lado del servidor.
- **Express**: Framework web para Node.js.
- **MongoDB**: Base de datos NoSQL para almacenamiento de datos.
- **Mongoose**: ODM (Object Data Modeling) para MongoDB y Node.js.

### Autenticación y Seguridad
- **jsonwebtoken (JWT)**: Para la generación y verificación de tokens de autenticación.
- **bcrypt**: Para el hash y verificación de contraseñas.
- **dotenv**: Para la gestión de variables de entorno.

### Comunicación
- **nodemailer**: Para el envío de correos electrónicos.
- **cors**: Para habilitar el intercambio de recursos entre diferentes orígenes.

## Estructura del Proyecto
📦src
 ┣ 📂config
 ┃ ┣ 📜enviroment.config.js
 ┃ ┗ 📜mongodb.config.js
 ┣ 📂controllers
 ┃ ┣ 📜auth.controller.js
 ┃ ┣ 📜channel.controller.js
 ┃ ┣ 📜user.controller.js
 ┃ ┗ 📜workspace.controller.js
 ┣ 📂middlewares
 ┃ ┗ 📜authMiddleware.js
 ┣ 📂models
 ┃ ┣ 📜channel.model.js
 ┃ ┣ 📜message.model.js
 ┃ ┣ 📜user.model.js
 ┃ ┗ 📜workspaces.model.js
 ┣ 📂repositories
 ┃ ┣ 📜channel.repository.js
 ┃ ┣ 📜message.repository.js
 ┃ ┣ 📜user.repository.js
 ┃ ┗ 📜workspace.repository.js
 ┣ 📂routes
 ┃ ┣ 📜auth.routes.js
 ┃ ┣ 📜channel.router.js
 ┃ ┣ 📜user.routes.js
 ┃ ┗ 📜workspaces.routes.js
 ┣ 📂utils
 ┃ ┣ 📂constants
 ┃ ┃ ┗ 📜token.constants.js
 ┃ ┣ 📜errors.utils.js
 ┃ ┗ 📜mailer.utils.js
 ┗ 📜server.js