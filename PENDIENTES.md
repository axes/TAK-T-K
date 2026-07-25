# Pendientes de desarrollo

## Estado actual

La primera etapa de estabilización del layout desktop fue completada.

### Base desktop implementada

- Resolución lógica fija: `1440x810`.
- Canvas CSS fijo: `1440x810`.
- Phaser configurado con `Scale.NONE`.
- Centrado de Phaser desactivado mediante `NO_CENTER`.
- Centrado exterior controlado exclusivamente mediante CSS.
- Canvas centrado horizontal y verticalmente cuando existe espacio suficiente.
- Scroll natural cuando el viewport es menor que el canvas.
- Sin `FIT`, `RESIZE`, transformaciones CSS ni escalado responsive.
- Debug overlay disponible mediante `F2`.
- Overlay con información de:
  - dimensiones lógicas;
  - dimensiones CSS;
  - escala X/Y;
  - viewport;
  - posición real del canvas;
  - posición esperada;
  - diferencias de centrado.

### Layout compartido

- Header: `72 px`.
- Área principal: `720 px`.
- Footer: `18 px`.
- Sidebar izquierdo: `260 px`.
- Tablero: `720x720`.
- Celdas: `90x90`.
- Sidebar derecho: `380 px`.
- Separaciones entre columnas: `16 px`.
- Márgenes exteriores: `24 px`.

### Escenas

- BattleScene utiliza el layout compartido.
- SetupScene utiliza el layout compartido.
- LobbyScene fue ajustada a la nueva resolución lógica.
- Pantalla inicial fue adaptada a la estructura general.
- Los flujos hot-seat, IA y remoto permanecen sin cambios funcionales.
- Los botones Finalizar turno y Rendirse conservan confirmación mediante segundo clic.
- Footer mínimo incorporado.
- Sidebar izquierdo preparado para un futuro registro de acciones.

### Validaciones completadas

- `npm run build`: correcto.
- `node --check`: correcto.
- `git diff --check`: correcto.
- Validación visual desktop Full HD realizada.
- Canvas fijo y centrado correctamente.

---

## Próxima etapa: organización visual de escenas

La siguiente etapa estará enfocada en ordenar el contenido de cada escena dentro del layout ya estabilizado.

### UI-SCENES-01 — Pantalla inicial

- Definir una composición propia para la portada.
- Evitar que parezca una BattleScene vacía.
- Reducir visualmente los paneles laterales cuando no tengan contenido.
- Ordenar título, lema, descripción y selector de modo.
- Alinear las tarjetas Hot-seat, IA y Remoto.
- Mejorar espaciados verticales.
- Integrar correctamente versión y fase dentro del footer.
- Revisar navegación secundaria:
  - Cómo jugar;
  - Historia;
  - Créditos;
  - Configuración.

### UI-SCENES-02 — SetupScene

- Corregir jerarquía del header.
- Ordenar título, estado e instrucción contextual.
- Crear contenido específico para el sidebar izquierdo.
- Mostrar progreso e instrucciones de despliegue.
- Crear contenido específico para el sidebar derecho.
- Mostrar información de la unidad activa.
- Mostrar unidades pendientes de colocar.
- Agrupar controles relacionados con la preparación.
- Evitar reutilizar cajas vacías propias de BattleScene.
- Revisar alineación del flujo remoto.
- Mantener intactos hot-seat, IA y remoto.

### UI-SCENES-03 — BattleScene

- Ordenar el registro de acciones placeholder.
- Definir subregiones definitivas del HUD derecho.
- Mejorar la presentación de la unidad seleccionada.
- Ordenar estadísticas y puntos de acción.
- Ordenar acciones y habilidad especial.
- Mejorar el área de descripción contextual.
- Mantener controles de partida anclados en la parte inferior.
- Revisar los estados sin unidad seleccionada.
- Revisar el equilibrio visual entre tablero y paneles laterales.

### UI-SCENES-04 — LobbyScene

- Revisar composición general.
- Comprobar inputs DOM.
- Revisar centrado y separación de controles.
- Revisar foco y navegación.
- Validar creación y entrada a salas.
- Mantener el canvas fijo sin introducir responsive.

### UI-SCENES-05 — Sistema visual compartido

- Consolidar paddings y separaciones.
- Consolidar tamaños tipográficos.
- Definir jerarquías de títulos, subtítulos y textos auxiliares.
- Reutilizar helpers de panel.
- Separar geometría compartida de contenido específico por escena.
- Evitar coordenadas directas innecesarias.
- Evitar cajas decorativas sin contenido real.

### UI-SCENES-06 — Estados interactivos

- Hover.
- Pressed.
- Selected.
- Disabled.
- Confirmación.
- Foco.
- Feedback visual de acciones no disponibles.

### UI-SCENES-07 — Validación desktop

Validar con Chrome al `100 %` en monitor Full HD:

- portada;
- LobbyScene;
- SetupScene hot-seat;
- SetupScene IA;
- SetupScene remoto;
- BattleScene;
- selección de unidad;
- movimiento;
- ataque;
- habilidad;
- finalizar turno;
- rendición;
- confirmaciones;
- overlay F2 activo e inactivo;
- footer;
- navegación entre escenas.

---

## Etapas posteriores

1. Completar la organización visual de todas las escenas desktop.
2. Completar estados interactivos y feedback visual.
3. Ejecutar regresión funcional desktop.
4. Revisar tamaños desktop alternativos sin modificar todavía el layout interno.
5. Diseñar `createMobileLandscapeTacticalLayout()`.
6. Implementar layout para celulares apaisados.
7. Implementar bloqueo de orientación vertical.
8. Incorporar safe areas y `visualViewport`.
9. Validar interacción táctil.
10. Reemplazar iconos y representaciones temporales.
11. Revisar los conceptos Ronda y Turno.
12. Realizar la limpieza completa del nombre Tactical Neon a TAK-T-K.

---

## Ideas para versión 2.0

- Registro narrativo real de acciones.
- Mensajes de movimientos, ataques y habilidades.
- Historial estructurado de partidas.
- Guardado y reproducción de partidas.
- Exportación de registros.
- Estadísticas de balance y comportamiento.
- Uso de partidas almacenadas para evaluar o mejorar la IA.
