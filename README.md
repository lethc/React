# Sistema de Pacientes

React muestra los pacientes y el backend de Express, dentro de `backend/`, los consulta y guarda en MongoDB.

## Ejecutar en desarrollo

1. Inicia MongoDB. Por defecto, la aplicación utiliza el servidor local `127.0.0.1:27017` y la colección `mydb02.pacientes`.
2. Desde la raíz de `Project01-app`, ejecuta `npm install`.
3. En una terminal, ejecuta `npm run dev:api`. La API queda disponible en `http://127.0.0.1:3001/api/pacientes`.
4. En otra terminal, ejecuta `npm run dev` y abre la dirección que muestra Vite. Vite reenvía automáticamente las peticiones de la API a Express.

Si usas otra conexión, copia `backend/.env.example` a `backend/.env` y ajusta `MONGODB_URI`.

El backend carga el catálogo inicial en la colección `especialidades` al arrancar. El formulario obtiene sus opciones de `GET /api/especialidades`.

## Ejecutar con React compilado

Ejecuta `npm run build` y luego `npm start`. Abre `http://127.0.0.1:3001` para usar React y la API desde el mismo servidor.
