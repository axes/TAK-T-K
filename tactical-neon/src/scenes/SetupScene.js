import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { COLORS, GAME_CONFIG, PLAYER_INFO, SETUP_ROWS, UNIT_ORDER } from '../config.js';
import { createGameState } from '../gameState.js';
import { createUnitGlyph } from '../ui/unitGlyph.js';

export class SetupScene extends Phaser.Scene {
  constructor() {
    super('SetupScene');
  }

  init() {
    this.gameState = createGameState();
    this.unitToPlaceIndexByPlayer = {
      1: 0,
      2: 0
    };
  }

  create() {
    this.boardGroup = this.add.group();
    this.unitGroup = this.add.group();

    this.titleText = this.add.text(24, 16, 'SETUP DE PARTIDA', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: COLORS.text,
      letterSpacing: 4
    });

    this.statusText = this.add.text(24, 44, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: COLORS.text,
      letterSpacing: 3
    });

    this.hintText = this.add.text(24, 70, 'CLICK EN UNA CELDA VALIDA PARA COLOCAR LA UNIDAD ACTIVA', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: COLORS.text,
      letterSpacing: 2
    });

    this.drawBoard();
    this.refreshSetupStatus();
  }

  drawBoard() {
    for (let y = 0; y < GAME_CONFIG.gridRows; y += 1) {
      for (let x = 0; x < GAME_CONFIG.gridCols; x += 1) {
        const baseColor = (x + y) % 2 === 0 ? COLORS.cellA : COLORS.cellB;
        const px = GAME_CONFIG.gridLeft + x * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2;
        const py = GAME_CONFIG.gridTop + y * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2;

        const tile = this.add.rectangle(px, py, GAME_CONFIG.cellSize, GAME_CONFIG.cellSize, Phaser.Display.Color.HexStringToColor(baseColor).color, 1)
          .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.gridBorder).color, 1);
        tile.setInteractive({ useHandCursor: true });
        tile.on('pointerover', () => {
          tile.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.hover).color, 1);
        });
        tile.on('pointerout', () => {
          tile.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.gridBorder).color, 1);
        });
        tile.on('pointerdown', () => this.handleCellClick(x, y));

        this.boardGroup.add(tile);
      }
    }
  }

  handleCellClick(x, y) {
    const owner = this.gameState.setupPlayer;
    const rows = SETUP_ROWS[owner];

    if (!rows.includes(y)) {
      return;
    }

    if (this.gameState.units.some((unit) => unit.position && unit.position.x === x && unit.position.y === y)) {
      return;
    }

    const templateKey = UNIT_ORDER[this.unitToPlaceIndexByPlayer[owner]];
    const unit = this.gameState.units.find((candidate) => candidate.owner === owner && candidate.key === templateKey && !candidate.position);
    if (!unit) {
      return;
    }

    unit.position = { x, y };
    this.gameState.setupPlacedByPlayer[owner].push(unit.id);
    this.unitToPlaceIndexByPlayer[owner] += 1;
    this.gameState.log.unshift(`${PLAYER_INFO[owner].name} COLOCA ${unit.name} EN ${x + 1},${y + 1}`);

    if (this.unitToPlaceIndexByPlayer[owner] >= UNIT_ORDER.length) {
      if (owner === 1) {
        this.gameState.setupPlayer = 2;
        this.gameState.log.unshift('JUGADOR 2, COLOCA TUS UNIDADES');
      } else {
        const startingPlayer = Phaser.Math.Between(0, 1) === 0 ? 1 : 2;
        this.gameState.phase = 'battle';
        this.scene.start('BattleScene', { gameState: this.gameState, startingPlayer });
        return;
      }
    }

    this.refreshSetupStatus();
  }

  refreshSetupStatus() {
    const owner = this.gameState.setupPlayer;
    const templateKey = UNIT_ORDER[this.unitToPlaceIndexByPlayer[owner]] || 'LISTO';
    this.statusText.setText(`TURNO DE CONFIGURACION: ${PLAYER_INFO[owner].name} | UNIDAD ACTIVA: ${templateKey}`);
    this.refreshUnitMarkers();
  }

  refreshUnitMarkers() {
    this.unitGroup.clear(true, true);
    for (const unit of this.gameState.units) {
      if (!unit.position) {
        continue;
      }

      const px = GAME_CONFIG.gridLeft + unit.position.x * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2;
      const py = GAME_CONFIG.gridTop + unit.position.y * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2;
      const color = PLAYER_INFO[unit.owner].color;
      const circle = this.add.circle(px, py, 22, Phaser.Display.Color.HexStringToColor(color).color, 1)
        .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor('#ffffff').color, 0.25);
      this.unitGroup.add(circle);
      const glyphParts = createUnitGlyph(this, unit, px, py);
      for (const part of glyphParts) {
        this.unitGroup.add(part);
      }
    }
  }
}
