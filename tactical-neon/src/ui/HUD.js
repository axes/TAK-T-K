import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { COLORS, PLAYER_INFO } from '../config.js';
import { createDesktopTacticalLayout } from './layout.js';

function rgba(hex, alpha) {
  const c = Phaser.Display.Color.HexStringToColor(hex).color;
  const r = (c >> 16) & 255;
  const g = (c >> 8) & 255;
  const b = c & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createActionRow(scene, x, y, width, height = 40) {
  const container = scene.add.container(0, 0);
  const background = scene.add.rectangle(x + width / 2, y + height / 2, width, height, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
    .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(0, 245, 255, 0.2)').color, 1)
    .setInteractive({ useHandCursor: true });

  const nameText = scene.add.text(x + 10, y + height / 2, '', {
    fontFamily: 'monospace',
    fontSize: '10px',
    color: COLORS.player1,
    fontStyle: 'bold',
    letterSpacing: 1
  });

  const costText = scene.add.text(x + width - 10, y + 8, '', {
    fontFamily: 'monospace',
    fontSize: '9px',
    color: 'rgba(0, 245, 255, 0.6)',
    letterSpacing: 1
  }).setOrigin(1, 0.5);

  container.add([background, nameText, costText]);

  return {
    container,
    background,
    nameText,
    costText,
    baseName: '',
    costLabel: '',
    setContent(name, cost) {
      this.baseName = name;
      this.costLabel = cost;
      this.nameText.setText(name);
      this.costText.setText(cost);
    },
    setEnabled(enabled) {
      if (enabled) {
        this.container.setAlpha(1);
        this.nameText.setText(this.baseName);
        this.nameText.setColor(COLORS.player1);
        this.costText.setText(this.costLabel);
        this.costText.setColor('rgba(0, 245, 255, 0.6)');
        this.background.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(0, 245, 255, 0.2)').color, 1);
      } else {
        this.container.setAlpha(0.3);
        this.nameText.setText(`X ${this.baseName}`);
        this.nameText.setColor('rgba(255,255,255,0.7)');
        this.costText.setText(this.costLabel);
        this.costText.setColor('rgba(255,255,255,0.5)');
        this.background.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.06)').color, 1);
      }
    },
    onClick(handler) {
      this.background.off('pointerdown');
      this.background.on('pointerdown', handler);
    }
  };
}

function getAbilityDetails(unit) {
  if (!unit) {
    return {
      basicName: 'ATQ. BASICO',
      basicDesc: '',
      specialName: 'ATQ. ESPECIAL',
      specialDesc: '',
      specialDetail: ''
    };
  }

  if (unit.key === 'VANGUARD') {
    return {
      basicName: 'ATQ. BASICO',
      basicDesc: 'ADYACENTE, DANO DIRECTO',
      specialName: 'ATQ. ESPECIAL',
      specialDesc: 'ADYACENTE, DANO + EMPUJE',
      specialDetail: 'GOLPE DE IMPACTO: EMPUJA 1 CELDA SI EL DESTINO ESTA LIBRE.'
    };
  }

  if (unit.key === 'SNIPER') {
    return {
      basicName: 'ATQ. BASICO',
      basicDesc: 'LINEA RECTA HASTA 3 CELDAS',
      specialName: 'ATQ. ESPECIAL',
      specialDesc: 'LINEA RECTA HASTA 4 CELDAS',
      specialDetail: 'DISPARO CARGADO: SI TE MOVISTE ESTE TURNO, NO PUEDE USARSE.'
    };
  }

  return {
    basicName: 'ATQ. BASICO',
    basicDesc: 'GOLPE EN AREA ADYACENTE',
    specialName: 'ATQ. ESPECIAL',
    specialDesc: 'ALCANCE 2, REDUCCION DE PA',
    specialDetail: 'SELLO ARCANO: APLICA -2 PA AL OBJETIVO EN SU PROXIMO TURNO.'
  };
}

export class HUD {
  constructor(scene) {
    this.scene = scene;

    this.layout = scene.layout || createDesktopTacticalLayout();
    const { header, sidebar, spacing } = this.layout;
    const { content: sidebarContent, unitInfo, actions, description, endTurn, surrenderButton } = sidebar;
    const headerCenterX = header.x + header.width / 2;
    const headerCenterY = header.y + header.height / 2;
    const sidebarLeft = sidebarContent.x;
    const sidebarRight = sidebarContent.x + sidebarContent.width;
    const sidebarWidth = sidebarContent.width;
    const sidebarCenterX = sidebar.x + sidebar.width / 2;
    const sidebarCenterY = sidebar.y + sidebar.height / 2;
    const sidebarSeparatorX = sidebar.x - spacing.contentGap / 2;

    this.headerBackground = scene.add.rectangle(headerCenterX, headerCenterY, header.width, header.height, Phaser.Display.Color.HexStringToColor('#0d0d0f').color, 1).setDepth(20);
    this.headerBorderBottom = scene.add.rectangle(headerCenterX, header.y + header.height, header.width, 1, Phaser.Display.Color.HexStringToColor('rgba(0, 245, 255, 0.3)').color, 1).setDepth(21);

    this.panelBackground = scene.add.rectangle(sidebarCenterX, sidebarCenterY, sidebar.width, sidebar.height, Phaser.Display.Color.HexStringToColor('rgba(255, 0, 229, 0.03)').color, 1).setDepth(20);
    this.verticalSeparator = scene.add.rectangle(sidebarSeparatorX, sidebarCenterY, 1, sidebar.height, Phaser.Display.Color.HexStringToColor('rgba(255, 0, 229, 0.3)').color, 1).setDepth(21);

    this.turnText = scene.add.text(header.x + 22, headerCenterY, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: COLORS.player1,
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0, 0.5).setDepth(22);

    this.headerSep1 = scene.add.rectangle(header.x + 182, headerCenterY, 1, 20, Phaser.Display.Color.HexStringToColor('rgba(0,245,255,0.2)').color, 1).setDepth(22);

    this.playerDot = scene.add.circle(header.x + 246, headerCenterY, 4, Phaser.Display.Color.HexStringToColor(COLORS.player1).color, 1).setDepth(22);
    this.playerText = scene.add.text(header.x + 262, headerCenterY, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      color: COLORS.player1,
      letterSpacing: 1
    }).setOrigin(0, 0.5).setDepth(22);

    this.headerSep2 = scene.add.rectangle(header.x + 462, headerCenterY, 1, 20, Phaser.Display.Color.HexStringToColor('rgba(0,245,255,0.2)').color, 1).setDepth(22);
    this.unitsAliveText = scene.add.text(header.x + 542, headerCenterY, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: 'rgba(255,255,255,0.5)',
      letterSpacing: 1
    }).setOrigin(0, 0.5).setDepth(22);

    this.emptyPromptText = scene.add.text(sidebarCenterX, sidebarCenterY, 'SELECCIONA\nUNA UNIDAD', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: 'rgba(255,255,255,0.2)',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5).setDepth(23);

    this.unitText = scene.add.text(unitInfo.x, unitInfo.y + 4, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: COLORS.player1,
      letterSpacing: 2
    }).setDepth(23);

    this.unitSubText = scene.add.text(unitInfo.x, unitInfo.y + 24, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: rgba(COLORS.player1, 0.5),
      letterSpacing: 1
    }).setDepth(23);

    this.sepInfoTop = scene.add.rectangle(unitInfo.x + unitInfo.width / 2, unitInfo.y + 40, unitInfo.width, 1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.1)').color, 1).setDepth(23);

    this.hpLabel = scene.add.text(unitInfo.x, unitInfo.y + 56, 'HP', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1
    }).setDepth(23);

    this.hpBarBack = scene.add.rectangle(unitInfo.x, unitInfo.y + 68, 220, 6, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.1)').color, 1).setOrigin(0, 0.5).setDepth(23);
    this.hpBarFill = scene.add.rectangle(unitInfo.x, unitInfo.y + 68, 220, 6, Phaser.Display.Color.HexStringToColor('#39ff14').color, 1).setOrigin(0, 0.5).setDepth(24);
    this.hpValueText = scene.add.text(unitInfo.x + unitInfo.width, unitInfo.y + 68, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#39ff14'
    }).setOrigin(1, 0.5).setDepth(24);

    this.apLabel = scene.add.text(unitInfo.x, unitInfo.y + 88, 'PA', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1
    }).setDepth(23);

    this.apPips = [];
    for (let i = 0; i < 3; i += 1) {
      this.apPips.push(scene.add.text(unitInfo.x + i * 20, unitInfo.y + 106, '◇', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: 'rgba(0,245,255,0.25)'
      }).setDepth(23));
    }
    this.apValueText = scene.add.text(unitInfo.x + 68, unitInfo.y + 106, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: 'rgba(255,255,255,0.4)'
    }).setDepth(23);

    this.sepInfoBottom = scene.add.rectangle(unitInfo.x + unitInfo.width / 2, unitInfo.y + unitInfo.height - 1, unitInfo.width, 1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.08)').color, 1).setDepth(23);

    this.actionsLabel = scene.add.text(actions.x, actions.y, 'ACCIONES', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1
    }).setDepth(23);

    this.actionRows = {
      move: createActionRow(scene, actions.x, actions.y + 20, actions.width, 40),
      basic: createActionRow(scene, actions.x, actions.y + 60, actions.width, 40),
      special: createActionRow(scene, actions.x, actions.y + 100, actions.width, 40)
    };

    this.actionRows.move.container.setDepth(24);
    this.actionRows.basic.container.setDepth(24);
    this.actionRows.special.container.setDepth(24);

    this.actionRows.move.setContent('MOVER', '1-2 PA');

    this.descriptionText = scene.add.text(description.x, description.y + 6, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: 'rgba(255,255,255,0.25)',
      lineSpacing: 6,
      wordWrap: { width: description.width }
    }).setDepth(23);

    this.noActionsText = scene.add.text(description.x + description.width / 2, description.y + description.height - 20, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ff3366',
      letterSpacing: 1
    }).setOrigin(0.5).setAlpha(0.7).setDepth(23);

    this.endTurnSeparator = scene.add.rectangle(endTurn.x + endTurn.width / 2, endTurn.y - 12, endTurn.width, 1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.08)').color, 1).setDepth(23);

    this.endTurnColor = COLORS.player1;
    this.endTurnBg = scene.add.rectangle(endTurn.x + endTurn.width / 2 - 28, endTurn.y + endTurn.height / 2, 204, 48, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(0, 245, 255, 0.4)').color, 1)
      .setDepth(24)
      .setInteractive({ useHandCursor: true });

    this.endTurnText = scene.add.text(endTurn.x + 102, endTurn.y + endTurn.height / 2, 'FINALIZAR TURNO', {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: COLORS.player1,
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(25);

    this.endTurnBg.on('pointerover', () => {
      this.endTurnBg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0.08);
      this.endTurnBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0.7);
    });

    this.endTurnBg.on('pointerout', () => {
      if (this.confirmationMode === 'endTurn') {
        return;
      }
      this.endTurnBg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0);
      this.endTurnBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0.4);
    });

    this.confirmationMode = null;
    this.confirmationTimer = null;
    this.confirmationText = scene.add.text(sidebarContent.x + sidebarContent.width / 2, endTurn.y - 14, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ff3366',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(26).setVisible(false);

    this.surrenderBg = scene.add.rectangle(surrenderButton.x + surrenderButton.width / 2, surrenderButton.y + surrenderButton.height / 2, surrenderButton.width, surrenderButton.height, Phaser.Display.Color.HexStringToColor('#26070d').color, 1)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('#ff3366').color, 0.9)
      .setDepth(24)
      .setInteractive({ useHandCursor: true });
    this.surrenderText = this.surrenderBg;
    this.surrenderIcon = scene.add.graphics().setDepth(25);
    this.drawSurrenderIcon('#ff3366', 0.95);

    this.endTurnBg.on('pointerdown', () => this.handleEndTurnClick());
    this.surrenderBg.on('pointerover', () => {
      if (this.confirmationMode !== 'surrender') {
        this.surrenderBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#5a101c').color, 1);
        this.surrenderBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('#ff6680').color, 1);
        this.drawSurrenderIcon('#ff99aa', 1);
      }
    });
    this.surrenderBg.on('pointerout', () => {
      if (this.confirmationMode !== 'surrender') {
        this.surrenderBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#26070d').color, 1);
        this.surrenderBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('#ff3366').color, 0.9);
        this.drawSurrenderIcon('#ff3366', 0.95);
      }
    });
    this.surrenderBg.on('pointerdown', () => this.handleSurrenderClick());
    scene.input.on('pointerdown', this.handleGlobalPointerDown, this);
    scene.events.once('shutdown', () => {
      scene.input.off('pointerdown', this.handleGlobalPointerDown, this);
      this.clearConfirmation();
    });

    this.actionRows.move.onClick(() => this.onMove?.());
    this.actionRows.basic.onClick(() => this.onBasic?.());
    this.actionRows.special.onClick(() => this.onSpecial?.());

    this.validateLayoutBounds();
  }

  drawSurrenderIcon(color, alpha = 1) {
    const bounds = this.surrenderBg.getBounds();
    const x = bounds.centerX - 7;
    const y = bounds.centerY - 12;
    const iconColor = Phaser.Display.Color.HexStringToColor(color).color;

    this.surrenderIcon.clear();
    this.surrenderIcon.lineStyle(2, iconColor, alpha);
    this.surrenderIcon.lineBetween(x, y, x, y + 24);
    this.surrenderIcon.fillStyle(iconColor, alpha);
    this.surrenderIcon.fillTriangle(x, y + 1, x + 14, y + 5, x, y + 10);
  }

  handleEndTurnClick() {
    if (this.confirmationMode === 'endTurn') {
      const handler = this.onEndTurn;
      this.clearConfirmation();
      handler?.();
      return;
    }

    this.beginConfirmation('endTurn');
  }

  handleSurrenderClick() {
    if (this.confirmationMode === 'surrender') {
      const handler = this.onSurrender;
      this.clearConfirmation();
      handler?.();
      return;
    }

    this.beginConfirmation('surrender');
  }

  beginConfirmation(mode) {
    this.clearConfirmation();
    this.confirmationMode = mode;
    this.confirmationText.setVisible(true);

    if (mode === 'endTurn') {
      this.confirmationText.setText('CONFIRMAR TURNO');
      this.confirmationText.setColor(this.endTurnColor);
      this.endTurnText.setText('CONFIRMAR TURNO');
      this.endTurnBg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0.16);
      this.endTurnBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 1);
    } else {
      this.confirmationText.setText('¿CONFIRMAR RENDICIÓN?');
      this.confirmationText.setColor('#ff6680');
      this.surrenderBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#7a1022').color, 1);
      this.surrenderBg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor('#ff6680').color, 1);
      this.drawSurrenderIcon('#ffffff', 1);
    }

    this.confirmationTimer = this.scene.time.delayedCall(1800, () => this.clearConfirmation());
  }

  handleGlobalPointerDown(pointer) {
    if (!this.confirmationMode) {
      return;
    }

    const activeButton = this.confirmationMode === 'endTurn' ? this.endTurnBg : this.surrenderBg;
    const bounds = activeButton.getBounds();
    if (bounds.contains(pointer.worldX, pointer.worldY)) {
      return;
    }

    this.clearConfirmation();
  }

  clearConfirmation() {
    if (this.confirmationTimer) {
      this.confirmationTimer.remove(false);
      this.confirmationTimer = null;
    }

    this.confirmationMode = null;
    this.confirmationText?.setVisible(false);
    this.endTurnText?.setText('FINALIZAR TURNO');
    this.endTurnBg?.setFillStyle(Phaser.Display.Color.HexStringToColor('#000000').color, 0);
    this.endTurnBg?.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(this.endTurnColor || COLORS.player1).color, 0.4);
    this.surrenderBg?.setFillStyle(Phaser.Display.Color.HexStringToColor('#26070d').color, 1);
    this.surrenderBg?.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('#ff3366').color, 0.9);
    if (this.surrenderIcon) {
      this.drawSurrenderIcon('#ff3366', 0.95);
    }
  }

  validateLayoutBounds() {
    const regions = this.layout.sidebar;
    const checks = [
      ['UNIT INFO', this.unitText, regions.unitInfo],
      ['UNIT OWNER', this.unitSubText, regions.unitInfo],
      ['HP LABEL', this.hpLabel, regions.unitInfo],
      ['HP BAR', this.hpBarBack, regions.unitInfo],
      ['PA LABEL', this.apLabel, regions.unitInfo],
      ['ACTIONS LABEL', this.actionsLabel, regions.actions],
      ['MOVE ACTION', this.actionRows.move.container, regions.actions],
      ['BASIC ACTION', this.actionRows.basic.container, regions.actions],
      ['SPECIAL ACTION', this.actionRows.special.container, regions.actions],
      ['DESCRIPTION', this.descriptionText, regions.description],
      ['END TURN', this.endTurnBg, regions.endTurn],
      ['SURRENDER', this.surrenderBg, regions.surrenderButton]
    ];

    for (const [name, object, region] of checks) {
      const bounds = object.getBounds();
      const inside = bounds.x >= region.x
        && bounds.y >= region.y
        && bounds.right <= region.x + region.width
        && bounds.bottom <= region.y + region.height;

      if (!inside) {
        console.warn(`[HUD LAYOUT] ${name} fuera de su región`, { bounds, region });
      }
    }
  }

  setHandlers(handlers) {
    this.onMove = handlers.onMove;
    this.onBasic = handlers.onBasic;
    this.onSpecial = handlers.onSpecial;
    this.onEndTurn = handlers.onEndTurn;
    this.onSurrender = handlers.onSurrender;
  }

  showEndTurnConfirmation(onConfirm, onCancel) {
    this.onEndTurn = onConfirm;
    this.beginConfirmation('endTurn');
  }

  hideEndTurnConfirmation() {
    this.clearConfirmation();
  }

  showSurrenderConfirmation(onConfirm, onCancel) {
    this.onSurrender = onConfirm;
    this.beginConfirmation('surrender');
  }

  hideSurrenderConfirmation() {
    this.clearConfirmation();
  }

  update(state, selectedUnit, availability = null) {
    const currentPlayerInfo = PLAYER_INFO[state.currentPlayer];
    const p1Alive = state.units.filter((u) => u.owner === 1 && u.isAlive()).length;
    const p2Alive = state.units.filter((u) => u.owner === 2 && u.isAlive()).length;

    this.turnText.setText(`TURNO ${state.turnNumber}`);
    this.playerText.setText(currentPlayerInfo.name);
    this.playerText.setColor(currentPlayerInfo.color);
    this.playerDot.setFillStyle(Phaser.Display.Color.HexStringToColor(currentPlayerInfo.color).color, 1);
    this.unitsAliveText.setText(`${p1Alive} VS ${p2Alive}`);

    this.endTurnColor = currentPlayerInfo.color;
    this.endTurnText.setColor(currentPlayerInfo.color);
    this.endTurnBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(currentPlayerInfo.color).color, 0.4);

    const hasSelection = Boolean(selectedUnit);
    this.emptyPromptText.setVisible(!hasSelection);
    this.unitText.setVisible(hasSelection);
    this.unitSubText.setVisible(hasSelection);
    this.sepInfoTop.setVisible(hasSelection);
    this.hpLabel.setVisible(hasSelection);
    this.hpBarBack.setVisible(hasSelection);
    this.hpBarFill.setVisible(hasSelection);
    this.hpValueText.setVisible(hasSelection);
    this.apLabel.setVisible(hasSelection);
    this.apValueText.setVisible(hasSelection);
    this.sepInfoBottom.setVisible(hasSelection);
    this.actionsLabel.setVisible(hasSelection);
    this.actionRows.move.container.setVisible(hasSelection);
    this.actionRows.basic.container.setVisible(hasSelection);
    this.actionRows.special.container.setVisible(hasSelection);
    this.descriptionText.setVisible(hasSelection);

    for (const pip of this.apPips) {
      pip.setVisible(hasSelection);
    }

    if (!selectedUnit) {
      this.noActionsText.setText('');
      this.descriptionText.setText('');
      this.actionRows.move.setEnabled(false);
      this.actionRows.basic.setEnabled(false);
      this.actionRows.special.setEnabled(false);
      return;
    }

    const details = getAbilityDetails(selectedUnit);
    const ownerInfo = PLAYER_INFO[selectedUnit.owner];
    this.unitText.setText(selectedUnit.name);
    this.unitText.setColor(ownerInfo.color);
    this.unitSubText.setText(`JUGADOR ${selectedUnit.owner} · UNIDAD SELECCIONADA`);
    this.unitSubText.setColor(rgba(ownerInfo.color, 0.5));

    const hpRatio = selectedUnit.maxHp > 0 ? selectedUnit.hp / selectedUnit.maxHp : 0;
    const hpWidth = Math.max(0, Math.round(220 * hpRatio));
    let hpColor = '#39ff14';
    if (hpRatio < 0.25) {
      hpColor = '#ff3366';
    } else if (hpRatio <= 0.5) {
      hpColor = '#ffaa00';
    }
    this.hpBarFill.width = hpWidth;
    this.hpBarFill.setFillStyle(Phaser.Display.Color.HexStringToColor(hpColor).color, 1);
    this.hpValueText.setText(`${selectedUnit.hp}/${selectedUnit.maxHp}`);
    this.hpValueText.setColor(hpColor);

    for (let i = 0; i < this.apPips.length; i += 1) {
      const isAvailable = i < selectedUnit.ap;
      this.apPips[i].setText(isAvailable ? '◆' : '◇');
      this.apPips[i].setColor(isAvailable ? '#00f5ff' : 'rgba(0,245,255,0.25)');
    }
    this.apValueText.setText(`${selectedUnit.ap}/${selectedUnit.maxAp}`);

    this.actionRows.basic.setContent(details.basicName, `${selectedUnit.basicAttack.cost} PA`);
    this.actionRows.special.setContent(details.specialName, `${selectedUnit.specialAttack.cost} PA`);

    const canAct = Boolean(selectedUnit);
    const moveEnabled = availability ? availability.move : (canAct && selectedUnit.ap > 0 && !selectedUnit.specialLockedMove);
    const basicEnabled = availability ? availability.basic : (canAct && selectedUnit.ap >= selectedUnit.basicAttack.cost);
    const specialEnabled = availability ? availability.special : (canAct && selectedUnit.ap >= selectedUnit.specialAttack.cost);

    this.actionRows.move.setEnabled(moveEnabled);
    this.actionRows.basic.setEnabled(basicEnabled);
    this.actionRows.special.setEnabled(specialEnabled);

    let description = '';
    if (state.selectedAction === 'move') {
      description = 'MOVER: CAMINA EN 4 DIRECCIONES (1 PA) O DIAGONAL (2 PA).';
    } else if (state.selectedAction === 'basic') {
      description = `${details.basicName}: COSTE ${selectedUnit.basicAttack.cost} PA. ${details.basicDesc}.`;
    } else if (state.selectedAction === 'special') {
      description = `${details.specialName}: COSTE ${selectedUnit.specialAttack.cost} PA. ${details.specialDetail}`;
    }
    this.descriptionText.setText(description);

    if (availability && !availability.any) {
      this.noActionsText.setText('SIN ACCIONES DISPONIBLES');
    } else {
      this.noActionsText.setText('');
    }
  }
}
