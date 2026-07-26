# Convención de commits de TAK-T-K

## Formato

```text
tipo(ámbito): descripción breve
```

## Tipos permitidos

- `feat`: nueva funcionalidad;
- `fix`: corrección de error;
- `refactor`: reorganización sin cambio funcional;
- `style`: cambios visuales sin alterar lógica;
- `docs`: documentación;
- `test`: pruebas;
- `build`: build o dependencias;
- `ci`: automatización, GitHub Actions, Vercel o Render;
- `chore`: mantenimiento;
- `perf`: rendimiento;
- `revert`: reversión.

## Ámbitos sugeridos

- `ui`;
- `main`;
- `setup`;
- `battle`;
- `lobby`;
- `remote`;
- `server`;
- `client`;
- `theme`;
- `layout`;
- `version`;
- `release`;
- `ci`;
- `docs`.

## Ejemplos

```text
feat(setup): reorganize deployment sidebar
style(main): refine desktop card spacing
fix(remote): restore room connection
refactor(theme): extract neon tokens
ci(render): update server root directory
docs(version): define 0.4 release cycle
```

## Reglas

- Usar inglés para mantener coherencia con el historial.
- Escribir la descripción en minúsculas.
- No usar punto final.
- Mantener un solo objetivo lógico por commit.
- No cambiar versión por microajustes.
- No usar mensajes genéricos como `changes`, `update` o `fix stuff`.
- Usar `[skip ci]` solo para automatizaciones documentales sin build.
- Crear tags únicamente al cerrar una release.

## Cuándo cambiar de versión

### Patch, por ejemplo 0.4.0 → 0.4.1

- Correcciones posteriores a una release.
- Ajustes compatibles.
- Errores sin nueva fase importante.

### Minor, por ejemplo 0.3.1 → 0.4.0

- Nueva fase.
- Sistema importante.
- Cambio visible sustancial.
- Nueva experiencia de juego.
- Reorganización amplia de UI.

### Major, 1.0.0

- Primera versión estable considerada completa.
- Reglas y experiencia suficientemente consolidadas.
- Despliegue y documentación estables.
