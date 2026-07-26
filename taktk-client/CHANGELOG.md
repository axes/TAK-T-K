# CHANGELOG

<<<<<<< HEAD
## 2026-07-26 — push a `main`

- fix(ci): update paths after project restructure


## 2026-07-19 — push a `main`
=======
Todos los cambios importantes de TAK-T-K se documentarán en este archivo.
>>>>>>> 28acece (docs(version): define 0.4 development cycle)

El proyecto utiliza una adaptación de versionado semántico durante su etapa previa a 1.0.

## [Unreleased]

### Agregado

- Nueva estructura desktop fija de `1440x810`.
- Sidebar izquierdo preparado para registro de acciones.
- Footer desktop compartido.
- Debug overlay ampliado mediante `F2`.
- Composición específica de portada con tarjetas Hot-seat, IA y Remoto.
- Archivo de backlog visual de escenas.

### Modificado

- Formalización del entorno local de desarrollo.
- Reorganización del repositorio en `taktk-client` y `taktk-server`.
- Migración del layout desktop a tablero de `720x720` con celdas de `90x90`.
- Centrado del canvas controlado exclusivamente mediante CSS.
- Portada desktop reorganizada.
- Configuración de despliegue adaptada a las nuevas rutas.
- Workflow de changelog actualizado para `taktk-client`.

### Corregido

- Borrosidad causada por escalado decimal del canvas.
- Doble centrado entre Phaser y CSS.
- Rutas antiguas del workflow posteriores al renombrado.
- Despliegue de Vercel después del cambio de Root Directory.

### Pendiente para v0.4.0

- Afinar visualmente MainScene.
- Reorganizar SetupScene.
- Reorganizar BattleScene.
- Reorganizar LobbyScene.
- Completar estados interactivos.
- Ejecutar regresión desktop.
- Validar hot-seat, IA y remoto.

## [v0.3.1] — 2026-04-13 — Fase 3 (rematch remoto)

### Agregado

- Flujo de rematch en `remote` con confirmación de ambos jugadores y timeout de 5s (`game:rematch_prompt` / `game:rematch_started`).
- UI de confirmación de rematch en `BattleScene` con contador visual y acciones `CONFIRMAR` / `CANCELAR`.
- Evento de cierre limpio de sala (`room:closed`) para finalizar la sesión remota en ambos clientes cuando falla el rematch.

### Modificado

- `RoomManager` ahora soporta reinicio de sala para rematch y cierre explícito de sala remota.
- `taktk-server/src/server.js` alterna el jugador inicial entre partidas consecutivas de una misma sala remota.
- Botón `JUGAR DE NUEVO` en remoto ahora inicia el handshake de rematch en vez de volver al lobby.

## [v0.3.0] — 2026-04-13 — Fase 3

### Agregado

- TAK-T-K Server: Node.js + Socket.IO en `taktk-server/`.
- `LobbyScene`: creación y unión a salas por ID.
- `SocketManager`: wrapper cliente de Socket.IO.
- Modo `remote` en `SetupScene` y `BattleScene`.
- Validación de acciones en servidor (`GameValidator`).
- Instrucciones de deploy en `taktk-server/DEPLOY.md`.

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

## [v0.1.0] — 2026-04-12 — Fase 1

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
