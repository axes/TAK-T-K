# DEPLOY SERVIDOR TAK-T-K

## RAILWAY

1. Crear cuenta en [railway.app](https://railway.app).
2. Crear **New Project** y elegir **Deploy from GitHub repo**.
3. Seleccionar `TAK-T-K` y configurar **Root Directory** en `server/`.
4. Variables de entorno: `PORT` (Railway la define automáticamente).
5. Start command: `npm start`.
6. Copiar la URL generada (ejemplo: `https://tak-t-k.railway.app`).
7. En el cliente (`tactical-neon/.env.local`) configurar:
   `VITE_SERVER_URL=https://tak-t-k.railway.app`

## RENDER

1. Crear cuenta en [render.com](https://render.com).
2. Crear **New Web Service** y conectar el repositorio GitHub.
3. Configurar **Root Directory** en `server/`.
4. Build command: `npm install`.
5. Start command: `npm start`.
6. Plan: **Free**.
7. Copiar la URL publicada y configurarla en:
   `tactical-neon/.env.local` con `VITE_SERVER_URL=https://...`
