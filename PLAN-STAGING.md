# PLAN STAGING TAK-T-K

## Objetivo

Dejar una versión pública y estable del multijugador remoto para probar con usuarios reales sin depender de entornos locales.

## Cuentas a crear

1. **GitHub**: acceso de administración al repositorio y permisos para conectar despliegues automáticos.
2. **Railway o Render**: cuenta para publicar el servidor Node.js + Socket.IO.
3. **Vercel o Netlify**: cuenta para publicar el cliente Vite si queremos una URL pública de prueba.
4. **Opcional**: un dominio propio si más adelante queremos separar claramente `staging` y `production`.

## Variables que vamos a usar

- Servidor: `PORT`, `CLIENT_URL`, `PRODUCTION_CLIENT_URL`
- Cliente: `VITE_SERVER_URL`

## Secuencia de trabajo

1. Unificar la rama estable en `main` y dejar como referencia la release `v0.3.1`.
2. Crear o actualizar el despliegue del servidor apuntando a `server/`.
3. Publicar el cliente Vite en una URL pública de staging.
4. Configurar en el servidor la URL real del cliente para que CORS permita la conexión.
5. Configurar en el cliente la URL pública del servidor con `VITE_SERVER_URL`.
6. Verificar `GET /health` en el servidor antes de abrir pruebas externas.
7. Probar el flujo completo con dos pestañas o dos navegadores distintos:
   - crear sala
   - compartir ID
   - unir segunda sesión
   - pasar por `SetupScene`
   - jugar una partida completa en remoto
   - confirmar rematch y validar cierre limpio si alguien cancela

## Orden recomendado de despliegue

### Opción A: staging mínimo

1. Publicar solo el servidor.
2. Mantener el cliente en local.
3. Probar desde dos pestañas apuntando al servidor remoto.

### Opción B: staging completo

1. Publicar servidor y cliente.
2. Compartir la URL pública del cliente con testers reales.
3. Medir reconexión, rematch y desconexión sin tocar el entorno local.

## Checklist antes de abrir pruebas

- `main` limpio y sincronizado.
- `v0.3.1` documentado como referencia.
- `server/DEPLOY.md` actualizado con la URL real del cliente.
- `tactical-neon/.env.local` apuntando al servidor correcto.
- Prueba de `room:create`, `room:join`, `game:setup`, `game:action`, `game:endturn` y `game:rematch_*` completada.

## Criterio para pasar a usuarios reales

El staging queda listo cuando dos personas externas pueden entrar desde enlaces distintos, completar una partida y salir sin errores de sincronización ni salas colgadas.