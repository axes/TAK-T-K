# CHANGELOG

## 2026-04-13 — push a `fix/actions-changelog-permissions`

- fix(actions): grant contents write for changelog push


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
