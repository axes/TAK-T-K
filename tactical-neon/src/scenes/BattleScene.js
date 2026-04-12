import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { COLORS, GAME_CONFIG, PLAYER_INFO } from '../config.js';
import { HUD } from '../ui/HUD.js';
import { TurnSystem } from '../systems/TurnSystem.js';
import { MovementSystem } from '../systems/MovementSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { AISystem } from '../systems/AISystem.js';

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
    this.aiSystem = new AISystem(this.gameState, MovementSystem, CombatSystem, this);
    this.aiSystem.onAction = (action) => this.handleAIAction(action);
    this.pendingStartingPlayer = data.startingPlayer || 1;
    this.gameState.turnNumber = 0;
    this.gameState.inputLocked = false;
    this.gameState.log = ['BATALLA INICIADA'];
    this.aiTurnInProgress = false;
    this.aiThinkingTween = null;
    this.victoryShown = false;
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
      onEndTurn: () => this.tryEndTurnFromButton()
    });

    this.titleText = this.add.text(24, 84, 'BATTLE MODE: HOT-SEAT', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: 'rgba(255,255,255,0.5)',
      letterSpacing: 2
    }).setDepth(21);

    this.statusText = this.add.text(24, 106, '', {
      fontFamily: 'monospace',
      fontSize: '1px',
      color: 'rgba(0,0,0,0)',
      letterSpacing: 0
    }).setDepth(0).setVisible(false);

    this.drawBoard();
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.gameState.inputLocked) {
        return;
      }
      this.clearSelection();
    });
    this.turnSystem.startTurn(this.pendingStartingPlayer);
    this.updateBoard();
    this.updateBattleTitle();
    this.maybeRunAITurn();
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
        ).setStrokeStyle(0.5, Phaser.Display.Color.HexStringToColor(COLORS.gridBorder).color, 1);

        cell.setInteractive({ useHandCursor: true });
        cell.on('pointerover', () => {
          this.hoveredCell = { x, y };
          cell.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.hover).color, 1);
          this.renderOverlays();
        });
        cell.on('pointerout', () => {
          this.hoveredCell = null;
          cell.setStrokeStyle(0.5, Phaser.Display.Color.HexStringToColor(COLORS.gridBorder).color, 1);
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
    if (this.gameState.inputLocked) {
      return;
    }

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

  selectUnitWithDefaultAction(unit) {
    if (!unit) {
      return;
    }

    this.turnSystem.selectUnit(unit.id);
    const availability = this.getActionAvailability(unit);
    this.gameState.selectedAction = availability.move ? 'move' : 'preview';
    this.renderOverlays();
    this.renderUnits();
    this.hud.update(this.gameState, unit, availability);
    this.updateStatusText();
  }

  handleCellClick(x, y) {
    if (this.gameState.inputLocked) {
      return;
    }

    if (this.gameState.winner) {
      return;
    }

    const clickedUnit = this.getUnitAt(x, y);
    const selectedUnit = this.getSelectedUnit();

    // Si estamos en una acción activa, resolver esa acción
    if (this.gameState.selectedAction === 'move' && selectedUnit) {
      const moved = this.tryMoveSelectedUnit(x, y);
      if (!moved) {
        this.clearSelection();
      }
      return;
    }

    if ((this.gameState.selectedAction === 'basic' || this.gameState.selectedAction === 'special') && selectedUnit) {
      this.tryAttackSelectedUnit(x, y, this.gameState.selectedAction);
      return;
    }

    // Si no hay una acción activa, permitir selección de unidades
    if (!selectedUnit) {
      if (clickedUnit) {
        this.selectUnitWithDefaultAction(clickedUnit);
      }
      return;
    }

    if (!clickedUnit && this.gameState.selectedAction === 'preview') {
      this.clearSelection();
      return;
    }

    // En modo preview se puede cambiar entre unidades para estrategia e inspeccion.
    if (selectedUnit && clickedUnit && clickedUnit.id !== selectedUnit.id) {
      if (this.gameState.selectedAction === 'move') {
        return;
      }

      this.selectUnitWithDefaultAction(clickedUnit);
      return;
    }
  }

  tryMoveSelectedUnit(x, y) {
    const unit = this.getSelectedUnit();
    if (!unit || unit.specialLockedMove) {
      return false;
    }

    const reachable = MovementSystem.getReachableCells(unit, this.gameState.units, GAME_CONFIG);
    const match = reachable.find((cell) => cell.x === x && cell.y === y);
    if (!match) {
      return false;
    }

    const moved = MovementSystem.moveUnit(unit, { x, y }, this.gameState.units, GAME_CONFIG, match.cost);
    if (!moved) {
      return false;
    }

    this.gameState.selectedAction = 'preview';
    this.addLog(`${unit.name} SE MUEVE A ${x + 1},${y + 1} POR ${match.cost} PA`);
    this.refreshSelection();
    this.checkEndOfTurnConditions();
    return true;
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

  handleAIAction(action) {
    if (action.type === 'move') {
      this.addLog(`${action.unit.name} SE MUEVE A ${action.to.x + 1},${action.to.y + 1}`);
    }

    if (action.type === 'attack') {
      let logEntry = `${action.unit.name} ATACA A ${action.target.name} POR ${action.result.damage} DMG`;
      if (action.attackType === 'special' && action.unit.key === 'MYSTIC') {
        logEntry += ' Y REDUCE SU PA FUTURO';
      }
      this.addLog(logEntry);
      if (action.result.defeated) {
        this.addLog(`${action.target.name} HA SIDO DESTRUIDA/O`);
      }
    }

    this.turnSystem.checkVictory();
    this.refreshSelection();
    if (this.gameState.inputLocked) {
      this.showAIThinkingIndicator();
    }
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
      const fillAlpha = 0.15;
      const circle = this.add.circle(x, y, 18, Phaser.Display.Color.HexStringToColor(color).color, fillAlpha)
        .setStrokeStyle(1.5, Phaser.Display.Color.HexStringToColor(color).color, 1);

      if (unit.hp <= 3) {
        circle.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.attack).color, 1);
      }

      this.unitGroup.add(circle);
      const label = this.add.text(x, y, unit.symbol, {
        fontFamily: 'monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color
      }).setOrigin(0.5);
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
          this.addOverlay(target.position.x, target.position.y, COLORS.attack, 0.18, false);
        }
      }
    }

    if (showSpecials) {
      for (const target of specialTargets) {
        if (target.position) {
          this.addOverlay(target.position.x, target.position.y, COLORS.attack, 0.18, false);
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
      .setStrokeStyle(outlineOnly ? 2 : 1.5, Phaser.Display.Color.HexStringToColor(color).color, 1);
    if (!outlineOnly) {
      rect.setBlendMode(Phaser.BlendModes.ADD);
    }
    this.overlayGroup.add(rect);
  }

  updateStatusText() {
    const selectedUnit = this.getSelectedUnit();
    if (!selectedUnit) {
      this.statusText.setText('');
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
      this.showVictoryScreen();
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
    if (this.gameState.winner) {
      return;
    }

    this.hud.hideEndTurnConfirmation();
    this.turnSystem.endTurn();
    this.addLog(`TURNO DE ${PLAYER_INFO[this.gameState.currentPlayer].name}`);
    this.refreshSelection();
    this.updateBattleTitle();
    this.maybeRunAITurn();
  }

  tryEndTurnFromButton() {
    if (this.gameState.inputLocked) {
      return;
    }

    const hasActions = this.turnSystem.activePlayerHasActions();
    if (hasActions) {
      this.hud.showEndTurnConfirmation(
        () => this.endTurn(),
        () => {}
      );
      return;
    }

    this.endTurn();
  }

  updateBattleTitle() {
    const modeText = this.gameState.mode === 'pve' ? 'BATTLE MODE: VS IA' : 'BATTLE MODE: HOT-SEAT';
    this.titleText.setText(modeText);
  }

  maybeRunAITurn() {
    if (this.gameState.mode !== 'pve' || this.gameState.currentPlayer !== 2 || this.gameState.winner || this.aiTurnInProgress) {
      return;
    }

    this.runAITurn();
  }

  async runAITurn() {
    this.aiTurnInProgress = true;
    this.gameState.inputLocked = true;
    this.turnSystem.clearSelection();
    this.refreshSelection();
    this.showAIThinkingIndicator();

    await this.aiSystem.executeTurn();
    this.turnSystem.checkVictory();

    this.hideAIThinkingIndicator();
    this.gameState.inputLocked = false;
    this.aiTurnInProgress = false;

    if (this.gameState.winner) {
      this.showVictoryScreen();
      return;
    }

    this.hud.hideEndTurnConfirmation();
    this.turnSystem.endTurn();
    this.addLog(`TURNO DE ${PLAYER_INFO[this.gameState.currentPlayer].name}`);
    this.refreshSelection();
    this.updateBattleTitle();
  }

  showAIThinkingIndicator() {
    this.hud.playerText.setText('IA PENSANDO...');
    this.hud.playerText.setColor('rgba(255, 0, 229, 0.7)');

    if (this.aiThinkingTween) {
      return;
    }

    this.aiThinkingTween = this.tweens.add({
      targets: this.hud.playerText,
      alpha: 0.4,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  hideAIThinkingIndicator() {
    if (this.aiThinkingTween) {
      this.aiThinkingTween.stop();
      this.aiThinkingTween = null;
    }
    this.hud.playerText.setAlpha(1);
  }

  showVictoryScreen() {
    if (this.victoryShown) {
      return;
    }

    this.victoryShown = true;
    this.gameState.inputLocked = true;
    this.hud.hideEndTurnConfirmation();

    const winnerIsIA = this.gameState.mode === 'pve' && this.gameState.winner === 2;
    const winnerText = winnerIsIA ? 'IA VICTORIOSA' : `JUGADOR ${this.gameState.winner} VICTORIOSO`;
    const winnerColor = this.gameState.winner === 1 ? '#00f5ff' : '#ff00e5';
    const aliveCount = this.gameState.units.filter((unit) => unit.isAlive()).length;
    const eliminated = this.gameState.units.length - aliveCount;

    const overlay = this.add.rectangle(683, 384, 1366, 768, Phaser.Display.Color.HexStringToColor('#000000').color, 0.75).setDepth(200);
    const title = this.add.text(683, 384, winnerText, {
      fontFamily: 'monospace',
      fontSize: '28px',
      fontStyle: 'bold',
      color: winnerColor,
      letterSpacing: 4
    }).setOrigin(0.5).setDepth(201).setAlpha(0);

    const subtitle = this.add.text(683, 434, `TURNO ${this.gameState.turnNumber} · UNIDADES ELIMINADAS: ${eliminated}`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: 'rgba(255,255,255,0.4)'
    }).setOrigin(0.5).setDepth(201).setAlpha(0.95);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 600
    });

    this.createResultButton(571, 504, 200, 48, 'JUGAR DE NUEVO', '#00f5ff', () => {
      this.scene.start('SetupScene', { mode: this.gameState.mode });
    });

    this.createResultButton(795, 504, 200, 48, 'MENÚ PRINCIPAL', '#ff00e5', () => {
      this.scene.start('MainScene');
    });

    this.overlayGroup.add(overlay);
    this.overlayGroup.add(title);
    this.overlayGroup.add(subtitle);
  }

  createResultButton(x, y, width, height, label, color, onClick) {
    const border = Phaser.Display.Color.HexStringToColor(color).color;
    const button = this.add.rectangle(x, y, width, height, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
      .setDepth(202)
      .setStrokeStyle(1, border, 0.8)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color,
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(203);

    button.on('pointerover', () => {
      button.setFillStyle(border, 0.08);
      button.setStrokeStyle(1, border, 1);
    });
    button.on('pointerout', () => {
      button.setFillStyle(border, 0);
      button.setStrokeStyle(1, border, 0.8);
    });
    button.on('pointerdown', () => onClick());

    this.overlayGroup.add(button);
    this.overlayGroup.add(text);
  }
}
