# Backlog de organización visual de escenas

## Objetivo

Ordenar y afinar las escenas desktop de TAK-T-K sobre la base fija ya estabilizada.

La geometría general no debe modificarse durante esta etapa:

- Canvas: `1440x810`.
- Header: `72 px`.
- Main: `720 px`.
- Footer: `18 px`.
- Sidebar izquierdo: `260 px`.
- Tablero: `720x720`.
- Celda: `90x90`.
- Sidebar derecho: `380 px`.
- Phaser: `Scale.NONE`.
- Centrado de Phaser: `NO_CENTER`.
- Centrado exterior mediante CSS.
- Debug overlay mediante `F2`.

---

## Portada — estado actual

La composición inicial de `MainScene` fue reorganizada.

Implementado:

- Header compacto.
- Identidad TAK-T-K.
- Lema `MUEVE. ATACA. DOMINA.`
- Descripción principal.
- Contenedor central de `880x520`.
- Tarjetas Hot-seat, IA y Remoto.
- Tarjetas de `240x138`.
- Gap de `20 px`.
- Navegación secundaria.
- Estados normal, hover y pressed.
- Footer real.
- Regiones F2:
  - `cover`;
  - `coverCards`;
  - `coverNavigation`.

### Ajustes manuales pendientes de la portada

- Revisar posición vertical del bloque central.
- Revisar equilibrio entre header y título principal.
- Afinar tamaños tipográficos.
- Afinar separaciones verticales.
- Revisar ancho y alto de las tarjetas.
- Revisar padding interior de las tarjetas.
- Revisar jerarquía entre título, lema y descripción.
- Revisar navegación secundaria.
- Revisar legibilidad y contenido del footer.
- Revisar hover y pressed en navegador.
- Revisar composición con F2 activo y desactivado.
- Confirmar visualmente Hot-seat, IA y Remoto.
- Confirmar que los callbacks continúan funcionando.

### Archivos principales de portada

Archivo principal:

`taktk-client/src/scenes/MainScene.js`

Modificar aquí:

- composición;
- posiciones internas;
- textos;
- tipografías;
- tarjetas;
- espaciados;
- navegación;
- footer;
- estilos visuales particulares;
- estados interactivos.

Archivo auxiliar:

`taktk-client/src/ui/LayoutDebugOverlay.js`

Modificar solamente cuando cambien:

- nombres de regiones;
- dimensiones de regiones;
- regiones específicas mostradas mediante F2.

No modificar para ajustes normales de portada:

- `taktk-client/src/ui/layout.js`;
- `taktk-client/src/config.js`;
- `taktk-client/src/main.js`;
- `taktk-client/index.html`.

---

## Próxima escena: SetupScene

### Objetivo

Transformar SetupScene en una pantalla específica de preparación y despliegue, evitando que
parezca una BattleScene incompleta.

### Header

- Mostrar `PREPARACIÓN`.
- Mostrar modo:
  - Hot-seat;
  - IA;
  - Remoto.
- Mostrar jugador activo.
- Mostrar unidad activa.
- Mostrar instrucción contextual.
- Ubicar acciones reales en headerRight cuando corresponda.

### Sidebar izquierdo

- Progreso de preparación.
- Estado de cada jugador.
- Instrucciones generales.
- Unidades colocadas.
- Unidades pendientes.
- Estado de espera o preparación de IA/remoto.

### Tablero

- Zona válida de despliegue.
- Celda válida.
- Celda inválida.
- Hover.
- Unidad seleccionada.
- Unidad colocada.
- Confirmación visual.

No cambiar las reglas de despliegue.

### Sidebar derecho

- Información de unidad activa.
- Estadísticas.
- Descripción breve.
- Listado de unidades disponibles.
- Estado seleccionado.
- Estado colocado.
- Estado disabled.
- Controles reales de preparación.
- Confirmación o espera.

### Modos

Mantener intactos:

- Hot-seat.
- IA.
- Remoto.
- Eventos y protocolo de red.

### Archivo principal

`taktk-client/src/scenes/SetupScene.js`

Archivos auxiliares posibles:

- `taktk-client/src/ui/LayoutDebugOverlay.js`;
- helpers UI existentes;
- `taktk-client/src/ui/layout.js` solo cuando exista una región realmente compartida.

---

## Escena posterior: BattleScene

### Sidebar izquierdo

- Registro de acciones.
- Placeholder mejor organizado.
- Región preparada para historial real.
- Jerarquía entre mensajes.

### Header

- Ronda.
- Jugador activo.
- Estado de partida.
- Unidades restantes.
- Modo de juego.

No revisar todavía la semántica definitiva de Ronda y Turno.

### Sidebar derecho

- Identidad de unidad.
- Estadísticas.
- Puntos de acción.
- Acciones.
- Habilidad.
- Descripción contextual.
- Estado sin unidad seleccionada.
- Controles anclados al fondo.

### Controles

Mantener:

- Finalizar turno.
- Rendirse.
- Confirmación mediante segundo clic.
- Disabled.
- Callbacks actuales.

### Archivo principal

`taktk-client/src/scenes/BattleScene.js`

Archivos auxiliares principales:

- `taktk-client/src/ui/HUD.js`;
- `taktk-client/src/ui/LayoutDebugOverlay.js`;
- helpers compartidos de UI.

---

## Escena posterior: LobbyScene

### Objetivo

Ordenar la interfaz de creación y entrada a partidas remotas.

Pendientes:

- Composición central.
- Formularios.
- Inputs DOM.
- Crear sala.
- Entrar a sala.
- Estados de conexión.
- Mensajes de error.
- Espera del rival.
- Barra o estado de progreso.
- Foco.
- Navegación.
- Alineación entre DOM y Phaser.

### Archivo principal

`taktk-client/src/scenes/LobbyScene.js`

Archivos auxiliares posibles:

- estilos DOM de `taktk-client/index.html`;
- helpers de posicionamiento;
- `taktk-client/src/ui/LayoutDebugOverlay.js`.

No modificar el protocolo del servidor.

---

## Componentes visuales compartidos

Después de ordenar las escenas:

- Paneles.
- Tarjetas.
- Botones primarios.
- Botones secundarios.
- Botones destructivos.
- Títulos.
- Subtítulos.
- Texto auxiliar.
- Listados.
- Separadores.
- Estados:
  - normal;
  - hover;
  - pressed;
  - selected;
  - disabled;
  - focus;
  - confirmación.

Evitar crear una abstracción antes de comprobar que un patrón se repite realmente.

---

## Sistema de temas

Implementar después de estabilizar la composición de las escenas.

Tema predeterminado:

- Neon.

Temas futuros:

- High Contrast.
- Medieval.
- Notebook.

Separar:

- colores;
- tipografía;
- fondos;
- bordes;
- iconos;
- sprites;
- texturas;
- efectos.

No incluir en los temas:

- reglas;
- posiciones;
- dimensiones estructurales;
- lógica;
- red;
- IA.

Principio:

- Layout: dónde se muestra.
- Tema: cómo se ve.
- Lógica: cómo funciona.

---

## Validación desktop pendiente

Validar en Chrome al 100 %:

- MainScene.
- SetupScene Hot-seat.
- SetupScene IA.
- SetupScene remoto.
- LobbyScene.
- BattleScene.
- Hover.
- Pressed.
- Selected.
- Disabled.
- Confirmaciones.
- F2 activo.
- F2 desactivado.
- Footer.
- Navegación completa.
- Build de producción.

---

## Fuera de alcance actual

- Responsive.
- Dispositivos móviles.
- Portrait.
- Safe areas.
- `visualViewport`.
- Touch.
- Sistema funcional de log.
- Guardado de partidas.
- Reproducción.
- Estadísticas.
- Limpieza completa de referencias históricas.
- Temas adicionales.
