# Pendientes de desarrollo

## Estado actual

- Layout desktop de Battle reorganizado sobre resolución lógica 1280x720.
- Phaser configurado con escalado FIT.
- Tablero desktop de 640x640 con celdas de 80.
- Sidebar desktop integrado al layout compartido.
- Footer eliminado.
- Botones Finalizar turno y Rendirse ubicados en una misma fila.
- Confirmación mediante segundo clic implementada para ambas acciones.
- Debug overlay disponible mediante F2.
- Build actual correcto.
- Commit de punto de control ya publicado: d131bdf.

## Próxima tarea

Completar la migración desktop de SetupScene:

- migrar título, estado e instrucciones al header;
- integrar información y controles dentro del sidebar;
- utilizar las subregiones compartidas;
- eliminar las coordenadas directas restantes;
- mantener intactos los flujos hot-seat, IA y remoto;
- validar Setup con debug overlay activo y desactivado;
- ejecutar npm run build.

## Etapas posteriores

1. Cerrar SetupScene para desktop.
2. Validar Scale.FIT, resize y alineación de los inputs DOM de LobbyScene.
3. Completar estados visuales desktop:
   - hover;
   - pressed;
   - selected;
   - disabled;
   - confirmaciones.
4. Ejecutar regresión desktop en:
   - 1280x720;
   - 1366x768;
   - 1600x900;
   - 1920x1080.
5. Diseñar createMobileLandscapeTacticalLayout().
6. Implementar layout específico para celulares apaisados.
7. Implementar bloqueo de orientación vertical, safe areas y visualViewport.
8. Validar interacción táctil en:
   - 844x390;
   - 915x412;
   - 390x844 en modo portrait bloqueado.
9. Reemplazar representaciones temporales por iconos o PNG definitivos, especialmente el botón Rendirse.
10. Revisar posteriormente el uso separado de los conceptos Ronda y Turno.
11. Realizar más adelante la limpieza completa del nombre Tactical Neon a TAK-T-K.

## Ideas para versión 2.0

- Panel de feedback narrativo de acciones.
- Mensajes como: “Vanguard cyan golpea a Mystic magenta y causa 2 puntos de daño”.
- Historial estructurado de movimientos, ataques y habilidades.
- Guardado y reproducción de partidas.
- Exportación de registros de partidas.
- Estadísticas de comportamiento y balance.
- Uso de partidas almacenadas para evaluar o mejorar la IA.
