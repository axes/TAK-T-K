# CHANGELOG

## 2026-04-13 — push a `feature/fase3-client-lobby-socket`

- feat(server): add multiplayer room backend
- feat(remote): add lobby and socket flow

## [v0.3.1] — 2026-04-13 — Fase 3 (rematch remoto)

### Agregado
- Flujo de rematch en `remote` con confirmación de ambos jugadores y timeout de 5s (`game:rematch_prompt` / `game:rematch_started`).
- UI de confirmación de rematch en `BattleScene` con contador visual y acciones `CONFIRMAR` / `CANCELAR`.
- Evento de cierre limpio de sala (`room:closed`) para finalizar la sesión remota en ambos clientes cuando falla el rematch.

### Modificado
- `RoomManager` ahora soporta reinicio de sala para rematch y cierre explícito de sala remota.
- `server/src/server.js` alterna el jugador inicial entre partidas consecutivas de una misma sala remota.
- Botón `JUGAR DE NUEVO` en remoto ahora inicia el handshake de rematch en vez de volver al lobby.

## [v0.3.0] — 2026-04-13 — Fase 3

### Agregado
- Servidor Node.js + Socket.IO en `server/`.
- `LobbyScene`: creación y unión a salas por ID.
- `SocketManager`: wrapper cliente de Socket.IO.
- Modo `remote` en `SetupScene` y `BattleScene`.
- Validación de acciones en servidor (`GameValidator`).
- Instrucciones de deploy en `server/DEPLOY.md`.

### Modificado
- `MainScene`: card `REMOTO` habilitada.
- `config.js`: `SERVER_URL` desde variable de entorno.

## [v0.2.1] — 2026-04-13 — Ajustes cliente

### Agregado
- Acción `RENDIRSE` en HUD con confirmación explícita antes de conceder la victoria al rival.

### Modificado
- `BattleScene` separa la capa de resultado (`resultGroup`) y bloquea interacciones del combate al mostrar pantalla de victoria.
- Ajustes visuales del canvas para una presentación más estable: fondo plano en `index.html`, `integer zoom` en `main.js` y escala por `Phaser.Scale.NONE`.
- `SetupScene` incorpora confirmación para salir al menú principal durante el despliegue.

### Corregido
- Se ocultan overlays de confirmación pendientes (`finalizar turno` y `rendirse`) al cerrar turno o al mostrar resultado final.


## [v0.2.0] — 2026-04-12 — Fase 2

### Agregado
- MainScene con animación de entrada secuencial, selección de modo (`HOTSEAT`/`VS IA`) y accesos a escenas secundarias.
- Escenas secundarias placeholder: `HowToPlayScene`, `StoryScene`, `CreditsScene` y `SettingsScene` con navegación de retorno a menú principal.
- `src/systems/AISystem.js` con estrategia greedy básica para J2 reutilizando `MovementSystem`, `CombatSystem` y `TurnSystem`.
- Pantalla de fin de partida en `BattleScene` con resumen de resultado y acciones `JUGAR DE NUEVO` / `MENÚ PRINCIPAL`.

### Modificado
- `BootScene` ahora redirige a `MainScene` como primera pantalla visible.
- `BattleScene` incorpora bloqueo de input (`gameState.inputLocked`) durante turno IA, indicador de estado "IA PENSANDO..." y ejecución automática del turno CPU en modo `pve`.
- `SetupScene` recibe `mode` desde transición, persiste `gameState.mode` y automatiza despliegue de J2 en `pve` con delay visual.
- Registro de escenas en `main.js` ampliado para incluir menú principal y escenas auxiliares.

## 2026-04-12 — Fase 1

### Agregado
- Flujo base de partida con escenas `BootScene` -> `SetupScene` -> `BattleScene` y estado compartido serializado entre setup y combate.
- Sistemas de dominio para turno, movimiento y combate (`TurnSystem`, `MovementSystem`, `CombatSystem`) con consumo de PA y validación de objetivos por tipo de unidad.
- Interfaz HUD con panel de unidad activa, acciones `Mover`/`ATQ. BASICO`/`ATQ. ESPECIAL`, log táctico y confirmación contextual para `FINALIZAR TURNO`.
- Representación visual de clases en setup mediante `src/ui/unitGlyph.js` (Vanguard cuadrado, Sniper círculo, Mystic rombo).

### Modificado
- Flujo de selección en `BattleScene` para usar `preview` como estado neutral y conmutar a `move` por defecto cuando la unidad seleccionada tiene desplazamientos válidos.

### Corregido
- Reglas de combate para impedir `ATQ. ESPECIAL` del Sniper tras movimiento en el mismo turno y aplicar bloqueo de movimiento tras ejecutar su especial.
- Cierre automático de turno cuando el jugador activo ya no tiene PA disponibles en unidades vivas.
