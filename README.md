# Task Manager Backend

API REST para gestión de tareas construida con Node.js, Express y SQLite.

## Requisitos Previos

- Node.js (v14 o superior)
- npm (v6 o superior)

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd tasks-manager-backend
```

2. Instalar dependencias:
```bash
npm install
```

## Configuración

El proyecto utiliza SQLite como base de datos y no requiere configuración adicional para desarrollo.

### Variables de Entorno

- Para desarrollo: No se requieren variables de entorno
- Para testing: Las variables están configuradas en `.env.test`

## Uso

### Iniciar el servidor en desarrollo:
```bash
npm run dev
```

### Ejecutar pruebas:
```bash
npm test
```

### Ejecutar pruebas en modo watch:
```bash
npm run test:watch
```

## Endpoints API

### Autenticación

- `POST /auth/register` - Registrar nuevo usuario
  ```json
  {
    "name": "Usuario",
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }
  ```

- `POST /auth/login` - Iniciar sesión
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }
  ```

### Tareas

Todos los endpoints de tareas requieren autenticación mediante token JWT en el header:
`Authorization: Bearer <token>`

- `GET /tasks` - Obtener todas las tareas del usuario
- `POST /tasks` - Crear nueva tarea
  ```json
  {
    "title": "Nueva tarea",
    "description": "Descripción de la tarea"
  }
  ```
- `PUT /tasks/:id` - Actualizar una tarea existente
  ```json
  {
    "title": "Título actualizado",
    "description": "Descripción actualizada",
    "completed": false
  }
  ```
- `DELETE /tasks/:id` - Eliminar una tarea
- `PATCH /tasks/:id/toggle` - Cambiar el estado de completado de una tarea
  // El endpoint alterna el estado de 'completed' de la tarea

## Estructura del Proyecto

```
tasks-manager-backend/
├── src/
│   ├── config/         # Configuración de la base de datos
│   ├── controllers/    # Controladores
│   ├── middleware/     # Middlewares
│   ├── routes/         # Rutas de la API
│   ├── utils/          # Funciones de utilidad
│   └── server.js       # Punto de entrada
├── tests/             # Tests
├── database/          # Base de datos SQLite
└── package.json
```

## Tecnologías Principales

- Express.js - Framework web
- better-sqlite3 - Cliente SQLite
- JWT - Autenticación
- Jest - Testing
- Supertest - Testing de API

## Deployment

Para desplegar la aplicación en producción, siga estos pasos:

1. Configure las variables de entorno necesarias (ej. NODE_ENV, PORT, etc.).
2. Instale las dependencias:
```bash
npm install --production
```
3. Inicie la aplicación:
```bash
npm start
```

## Base de Datos

El proyecto utiliza SQLite con las siguientes tablas:

### Users
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- email (TEXT UNIQUE)
- password (TEXT)

### Tasks
- id (INTEGER PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- completed (BOOLEAN)
- user_id (INTEGER FOREIGN KEY)

## Contributing

Si desea contribuir, por favor siga estos pasos:

1. Fork el repositorio.
2. Cree una rama para su feature o fix: `git checkout -b feature/nueva-funcionalidad`
3. Realice los cambios y envíe un Pull Request.
