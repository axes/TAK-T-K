import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { COLORS, GAME_CONFIG, PLAYER_INFO } from '../config.js';
import { HUD } from '../ui/HUD.js';
import { TurnSystem } from '../systems/TurnSystem.js';
import { MovementSystem } from '../systems/MovementSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';

function centerOfCell(x, y) {
  return {
    x: GAME_CONFIG.gridLeft + x * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2,
    y: GAME_CONFIG.gridTop + y * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2
  };
}

export class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  init(data) {
    this.gameState = data.gameState;
    this.turnSystem = new TurnSystem(this.gameState);
    this.pendingStartingPlayer = data.startingPlayer || 1;
    this.gameState.turnNumber = 0;
    this.gameState.log = ['BATALLA INICIADA'];
  }

  create() {
    this.boardGroup = this.add.group();
    this.overlayGroup = this.add.group();
    this.unitGroup = this.add.group();
    this.hud = new HUD(this);
    this.hoveredCell = null;

    this.hud.setHandlers({
      onMove: () => this.setAction('move'),
      onBasic: () => this.setAction('basic'),
      onSpecial: () => this.setAction('special'),
      onEndTurn: () => this.endTurn()
    });

    this.titleText = this.add.text(24, 120, 'BATTLE MODE: HOT-SEAT', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: COLORS.text,
      letterSpacing: 3
    }).setDepth(21);

    this.statusText = this.add.text(24, 96, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: COLORS.text,
      letterSpacing: 2
    }).setDepth(21);

    this.titleText.setPosition(24, 72);

    this.drawBoard();
    this.input.keyboard.on('keydown-ESC', () => {
      this.clearSelection();
    });
    this.turnSystem.startTurn(this.pendingStartingPlayer);
    this.updateBoard();
  }

  getActionAvailability(unit) {
    if (!unit) {
      return {
        move: false,
        basic: false,
        special: false,
        any: false
      };
    }

    if (unit.owner !== this.gameState.currentPlayer) {
      return {
        move: false,
        basic: false,
        special: false,
        any: false
      };
    }

    const moveCells = unit.specialLockedMove ? [] : MovementSystem.getReachableCells(unit, this.gameState.units, GAME_CONFIG);
    const basicTargets = CombatSystem.getValidTargets(unit, 'basic', this.gameState.units, GAME_CONFIG);
    const specialTargets = CombatSystem.getValidTargets(unit, 'special', this.gameState.units, GAME_CONFIG);

    const move = !unit.specialLockedMove && unit.ap > 0 && moveCells.length > 0;
    const basic = unit.ap >= unit.basicAttack.cost && basicTargets.length > 0;
    const special = unit.ap >= unit.specialAttack.cost && !(unit.key === 'SNIPER' && unit.movedThisTurn) && specialTargets.length > 0;

    return {
      move,
      basic,
      special,
      any: move || basic || special
    };
  }

  clearSelection() {
    const selectedUnit = this.getSelectedUnit();
    if (!selectedUnit) {
      return;
    }

    this.turnSystem.clearSelection();
    this.renderOverlays();
    this.renderUnits();
    this.hud.update(this.gameState, null, this.getActionAvailability(null));
    this.updateStatusText();
  }

  drawBoard() {
    for (let y = 0; y < GAME_CONFIG.gridRows; y += 1) {
      for (let x = 0; x < GAME_CONFIG.gridCols; x += 1) {
        const baseColor = (x + y) % 2 === 0 ? COLORS.cellA : COLORS.cellB;
        const cell = this.add.rectangle(
          GAME_CONFIG.gridLeft + x * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2,
          GAME_CONFIG.gridTop + y * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2,
          GAME_CONFIG.cellSize,
          GAME_CONFIG.cellSize,
          Phaser.Display.Color.HexStringToColor(baseColor).color,
          1
        ).setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.gridBorder).color, 1);

        cell.setInteractive({ useHandCursor: true });
        cell.on('pointerover', () => {
          this.hoveredCell = { x, y };
          cell.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.hover).color, 1);
          this.renderOverlays();
        });
        cell.on('pointerout', () => {
          this.hoveredCell = null;
          cell.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.gridBorder).color, 1);
          this.renderOverlays();
        });
        cell.on('pointerdown', () => this.handleCellClick(x, y));

        this.boardGroup.add(cell);
      }
    }
  }

  getUnitAt(x, y) {
    return this.gameState.units.find((unit) => unit.isAlive() && unit.position && unit.position.x === x && unit.position.y === y) || null;
  }

  getSelectedUnit() {
    return this.turnSystem.getSelectedUnit();
  }

  setAction(action) {
    const selectedUnit = this.getSelectedUnit();
    if (!selectedUnit) {
      return;
    }

    if (selectedUnit.owner !== this.gameState.currentPlayer) {
      this.addLog('SOLO PUEDES ACTUAR CON UNIDADES DEL JUGADOR ACTIVO');
      return;
    }

    if (action === 'move' && selectedUnit.specialLockedMove) {
      this.addLog(`${selectedUnit.name} NO PUEDE MOVERSE TRAS SU ESPECIAL`);
      return;
    }

    this.gameState.selectedAction = action;
    this.renderOverlays();
    this.hud.update(this.gameState, selectedUnit, this.getActionAvailability(selectedUnit));
  }

  handleCellClick(x, y) {
    if (this.gameState.winner) {
      return;
    }

    const clickedUnit = this.getUnitAt(x, y);
    const selectedUnit = this.getSelectedUnit();

    // Si estamos en una acción activa, resolver esa acción
    if (this.gameState.selectedAction === 'move' && selectedUnit) {
      this.tryMoveSelectedUnit(x, y);
      return;
    }

    if ((this.gameState.selectedAction === 'basic' || this.gameState.selectedAction === 'special') && selectedUnit) {
      this.tryAttackSelectedUnit(x, y, this.gameState.selectedAction);
      return;
    }

    // Si no hay una acción activa, permitir selección de unidades
    if (!selectedUnit) {
      if (clickedUnit) {
        this.turnSystem.selectUnit(clickedUnit.id);
        this.gameState.selectedAction = 'preview';
        this.refreshSelection();
      }
      return;
    }

    if (!clickedUnit && this.gameState.selectedAction === 'preview') {
      this.clearSelection();
      return;
    }

    // En modo preview se puede cambiar entre unidades para estrategia e inspeccion.
    if (selectedUnit && clickedUnit && clickedUnit.id !== selectedUnit.id) {
      this.turnSystem.selectUnit(clickedUnit.id);
      this.gameState.selectedAction = 'preview';
      this.refreshSelection();
      return;
    }
  }

  tryMoveSelectedUnit(x, y) {
    const unit = this.getSelectedUnit();
    if (!unit || unit.specialLockedMove) {
      return;
    }

    const reachable = MovementSystem.getReachableCells(unit, this.gameState.units, GAME_CONFIG);
    const match = reachable.find((cell) => cell.x === x && cell.y === y);
    if (!match) {
      this.addLog(`CELDA FUERA DE ALCANCE`);
      return;
    }

    const moved = MovementSystem.moveUnit(unit, { x, y }, this.gameState.units, GAME_CONFIG, match.cost);
    if (!moved) {
      this.addLog(`MOVIMIENTO FALLO (PA insuficientes?)`);
      return;
    }

    this.gameState.selectedAction = 'preview';
    this.addLog(`${unit.name} SE MUEVE A ${x + 1},${y + 1} POR ${match.cost} PA`);
    this.refreshSelection();
    this.checkEndOfTurnConditions();
  }

  tryAttackSelectedUnit(x, y, actionType) {
    const attacker = this.getSelectedUnit();
    if (!attacker) {
      return;
    }

    const target = this.getUnitAt(x, y);
    if (!target || target.owner === attacker.owner) {
      return;
    }

    const validTargets = CombatSystem.getValidTargets(attacker, actionType, this.gameState.units, GAME_CONFIG);
    if (!validTargets.includes(target)) {
      return;
    }

    const result = CombatSystem.resolveAttack(attacker, target, actionType, this.gameState.units, GAME_CONFIG);
    if (!result.success) {
      return;
    }

    this.gameState.selectedAction = 'preview';
    let logEntry = `${attacker.name} ATACA A ${target.name} POR ${result.damage} DMG`;
    if (actionType === 'special' && attacker.key === 'MYSTIC') {
      logEntry += ' Y REDUCE SU PA FUTURO';
    }

    this.addLog(logEntry);

    if (result.defeated) {
      this.addLog(`${target.name} HA SIDO DESTRUIDA/O`);
    }

    this.turnSystem.checkVictory();
    this.refreshSelection();
    this.checkEndOfTurnConditions();
  }

  refreshSelection() {
    const selectedUnit = this.getSelectedUnit();
    if (!selectedUnit) {
      this.gameState.selectedAction = 'preview';
    }

    this.renderOverlays();
    this.renderUnits();
    this.hud.update(this.gameState, selectedUnit, this.getActionAvailability(selectedUnit));
    this.updateStatusText();
  }

  renderUnits() {
    this.unitGroup.clear(true, true);

    for (const unit of this.gameState.units) {
      if (!unit.isAlive() || !unit.position) {
        continue;
      }

      const { x, y } = centerOfCell(unit.position.x, unit.position.y);
      const color = PLAYER_INFO[unit.owner].color;
      const circle = this.add.circle(x, y, 24, Phaser.Display.Color.HexStringToColor(color).color, 1)
        .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor('#ffffff').color, 0.35);
      const label = this.add.text(x, y - 12, unit.symbol, {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: COLORS.text,
        letterSpacing: 2
      }).setOrigin(0.5);

      if (unit.hp <= 3) {
        circle.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.attack).color, 1);
      }

      this.unitGroup.add(circle);
      this.unitGroup.add(label);
    }
  }

  updateBoard() {
    this.renderUnits();
    this.renderOverlays();
    const selectedUnit = this.getSelectedUnit();
    this.hud.update(this.gameState, selectedUnit, this.getActionAvailability(selectedUnit));
    this.updateStatusText();
  }

  renderOverlays() {
    this.overlayGroup.clear(true, true);

    const selectedUnit = this.getSelectedUnit();
    if (!selectedUnit) {
      return;
    }

    const previewMode = this.gameState.selectedAction === 'preview';
    const isMoveMode = this.gameState.selectedAction === 'move';
    const isBasicMode = this.gameState.selectedAction === 'basic';
    const isSpecialMode = this.gameState.selectedAction === 'special';

    const moveCells = MovementSystem.getReachableCells(selectedUnit, this.gameState.units, GAME_CONFIG);
    const basicTargets = CombatSystem.getValidTargets(selectedUnit, 'basic', this.gameState.units, GAME_CONFIG);
    const specialTargets = CombatSystem.getValidTargets(selectedUnit, 'special', this.gameState.units, GAME_CONFIG);

    const showMoves = previewMode || isMoveMode;
    const showBasics = previewMode || isBasicMode;
    const showSpecials = isSpecialMode;

    if (showMoves) {
      for (const cell of moveCells) {
        this.addOverlay(cell.x, cell.y, COLORS.move, 0.2, false);
      }
    }

    if (showBasics) {
      for (const target of basicTargets) {
        if (target.position) {
          this.addOverlay(target.position.x, target.position.y, COLORS.attack, 0.3, false);
        }
      }
    }

    if (showSpecials) {
      for (const target of specialTargets) {
        if (target.position) {
          this.addOverlay(target.position.x, target.position.y, '#aa66ff', 0.25, false);
        }
      }
    }

    if (this.hoveredCell) {
      this.addOverlay(this.hoveredCell.x, this.hoveredCell.y, COLORS.hover, 0, true);
    }
  }

  addOverlay(x, y, color, alpha, outlineOnly) {
    const px = GAME_CONFIG.gridLeft + x * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2;
    const py = GAME_CONFIG.gridTop + y * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2;
    const rect = this.add.rectangle(px, py, GAME_CONFIG.cellSize, GAME_CONFIG.cellSize, Phaser.Display.Color.HexStringToColor(color).color, alpha)
      .setStrokeStyle(outlineOnly ? 3 : 2, Phaser.Display.Color.HexStringToColor(color).color, 1);
    if (!outlineOnly) {
      rect.setBlendMode(Phaser.BlendModes.ADD);
    }
    this.overlayGroup.add(rect);
  }

  updateStatusText() {
    const selectedUnit = this.getSelectedUnit();
    if (!selectedUnit) {
      this.statusText.setText(`${PLAYER_INFO[this.gameState.currentPlayer].name} DEBE SELECCIONAR UNA UNIDAD`);
      this.statusText.setColor(PLAYER_INFO[this.gameState.currentPlayer].color);
      return;
    }

    const mode = this.gameState.selectedAction.toUpperCase();
    this.statusText.setText(`SELECCIONADA: ${selectedUnit.name} | MODO: ${mode} | PA: ${selectedUnit.ap}`);
    this.statusText.setColor(PLAYER_INFO[this.gameState.currentPlayer].color);
  }

  addLog(message) {
    this.gameState.log.unshift(message.toUpperCase());
    this.gameState.log = this.gameState.log.slice(0, 10);
  }

  checkEndOfTurnConditions() {
    if (this.gameState.winner) {
      this.scene.pause();
      this.add.text(278, 360, `VICTORIA DE ${PLAYER_INFO[this.gameState.winner].name}`, {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: PLAYER_INFO[this.gameState.winner].color,
        letterSpacing: 5
      });
      return;
    }

    const selectedUnit = this.getSelectedUnit();
    if (selectedUnit && selectedUnit.ap <= 0) {
      this.turnSystem.clearSelection();
      this.refreshSelection();
    }

    if (!this.turnSystem.activePlayerHasActions()) {
      this.endTurn();
      return;
    }

    this.refreshSelection();
  }

  endTurn() {
    this.turnSystem.endTurn();
    this.addLog(`TURNO DE ${PLAYER_INFO[this.gameState.currentPlayer].name}`);
    this.refreshSelection();
  }
}
