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
- HUD de stats y acciones
- layout listo para seguir ampliando

## Licencia

No hay licencia técnica restrictiva en esta base. Úsala, modifícala y adapátala libremente para aprender o construir algo nuevo.

---

Hecho para jugar, probar ideas y seguir construyendo.
