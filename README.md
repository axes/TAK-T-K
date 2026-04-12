# TAC-T-K

TAC-T-K es un juego táctico por turnos para navegador, construido como una base abierta para experimentar, aprender y derivar nuevas versiones. El nombre juega con la palabra **TACTICA** y refleja la intención del proyecto: una mezcla de sistema táctico, combate por turnos y una estructura pensada para crecer.

Este proyecto está siendo **vibecodeado**: iterado con ayuda de múltiples herramientas y mucha prueba práctica. En el proceso han participado **Claude**, **GPT**, **Copilot**, más bastante **café** y **amor**.

## Qué es

Una experiencia táctica hot-seat para dos jugadores en el mismo navegador, con:

- tablero 8x8
- movimiento con puntos de acción
- combate básico y habilidades especiales
- unidades con roles diferenciados
- HUD lateral para stats, habilidades y descripciones
- base modular preparada para IA, red y futuras expansiones

## Tecnologías

- **JavaScript puro**
- **Phaser 3**
- **Vite**
- **HTML5 / CSS3**
- **Git / GitHub**

## Filosofía

Este repositorio es **totalmente libre** para aprender, experimentar, bifurcar y adaptar. Si quieres construir sobre esta base, adelante:

- cambia las unidades
- reequilibra el combate
- reimagina la interfaz
- agrega IA
- agrega multijugador
- convierte el prototipo en otro juego táctico distinto

La idea es que TAC-T-K sirva como un punto de partida limpio, entendible y flexible.

## Cómo ejecutarlo en local

Si tienes Node.js instalado:

```bash
cd tactical-neon
npm install
npm run dev
```

Luego abre la URL que te muestra Vite en el navegador.

## Cómo clonar y adaptar

```bash
git clone git@github.com:axes/TAK-T-K.git
cd TAK-T-K/tactical-neon
npm install
npm run dev
```

Si quieres crear tu propia adaptación:

```bash
git remote rename origin upstream
git remote add origin git@github.com:tu-usuario/tu-fork.git
git push -u origin main
```

O simplemente haz un fork y empieza a experimentar.

## Estructura principal

```text
tactical-neon/
├── index.html
├── package.json
├── src/
│   ├── main.js
│   ├── config.js
│   ├── scenes/
│   ├── systems/
│   ├── entities/
│   └── ui/
```

## Estado actual

La base actual incluye:

- setup de unidades
- turnos hot-seat
- movimiento por PA
- combate con habilidades
- HUD rediseñado por zonas (header, tablero, panel, footer)
- flujo de acciones más claro para selección/movimiento por defecto
- botón de fin de turno con confirmación contextual integrada

## Cambios recientes (abril 2026)

### Layout y resolución

- canvas actualizado a **1366 × 768**
- tablero 8x8 ajustado a celdas de **64 × 64**
- tablero centrado en zona de juego con esquina superior izquierda en **x:267, y:128**
- división visual consistente en 4 zonas: header, tablero, panel lateral y footer

### HUD y UI

- header simplificado: turno, jugador activo y conteo de unidades vivas
- panel lateral reorganizado con jerarquía clara:
	- datos de unidad (HP/PA)
	- acciones
	- descripción
	- estado de “sin acciones”
- botón **FINALIZAR TURNO** fijo al pie del panel lateral
- color del botón de fin de turno sincronizado con el jugador activo
- modal de confirmación visual (estética neon) al finalizar turno con PA disponibles (sin alert nativa del navegador)

### Flujo de interacción

- al seleccionar unidad propia con acciones disponibles, el movimiento queda como acción por defecto
- clic en celda fuera de rango durante movimiento cancela la selección (equivalente a ESC)
- mejora de claridad para distinguir acciones de unidad vs cambio de turno

### Marcadores de unidad

- en batalla: unidad renderizada con círculo por propietario y letra centrada
- fallback de glifos simples disponible para setup en [tactical-neon/src/ui/unitGlyph.js](tactical-neon/src/ui/unitGlyph.js):
	- Vanguard: cuadrado
	- Sniper: círculo
	- Mystic: rombo

### Preparación para sprites

- carpeta preparada para sprites de unidades en [tactical-neon/public/assets/sprites/units](tactical-neon/public/assets/sprites/units)
- archivo de control de carpeta: [tactical-neon/public/assets/sprites/units/.gitkeep](tactical-neon/public/assets/sprites/units/.gitkeep)

### Limpieza y estructura del proyecto

- reglas de ignorado ampliadas en [tactical-neon/.gitignore](tactical-neon/.gitignore)
- lockfile generado para reproducibilidad: [tactical-neon/package-lock.json](tactical-neon/package-lock.json)

## Licencia

No hay licencia técnica restrictiva en esta base. Úsala, modifícala y adapátala libremente para aprender o construir algo nuevo.

---

Hecho para jugar, probar ideas y seguir construyendo.
