import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { COLORS, PLAYER_INFO } from '../config.js';

function rgba(hex, alpha) {
  const c = Phaser.Display.Color.HexStringToColor(hex).color;
  const r = (c >> 16) & 255;
  const g = (c >> 8) & 255;
  const b = c & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createActionRow(scene, x, y, width) {
  const container = scene.add.container(0, 0);
  const background = scene.add.rectangle(x + width / 2, y + 14, width, 28, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
    .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(0, 245, 255, 0.2)').color, 1)
    .setInteractive({ useHandCursor: true });

  const nameText = scene.add.text(x + 10, y + 7, '', {
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
  }).setOrigin(1, 0);

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

    this.headerBackground = scene.add.rectangle(683, 36, 1366, 72, Phaser.Display.Color.HexStringToColor('#0d0d0f').color, 1).setDepth(20);
    this.headerBorderBottom = scene.add.rectangle(683, 72, 1366, 1, Phaser.Display.Color.HexStringToColor('rgba(0, 245, 255, 0.3)').color, 1).setDepth(21);

    this.footerBackground = scene.add.rectangle(683, 732, 1366, 72, Phaser.Display.Color.HexStringToColor('#0d0d0f').color, 1).setDepth(20);
    this.footerBorderTop = scene.add.rectangle(683, 696, 1366, 1, Phaser.Display.Color.HexStringToColor('rgba(0, 245, 255, 0.2)').color, 1).setDepth(21);
    this.footerText = scene.add.text(683, 732, '- LOG / DIALOGOS -', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: 'rgba(255,255,255,0.1)'
    }).setOrigin(0.5).setDepth(22);

    this.panelBackground = scene.add.rectangle(1206, 384, 320, 624, Phaser.Display.Color.HexStringToColor('rgba(255, 0, 229, 0.03)').color, 1).setDepth(20);
    this.verticalSeparator = scene.add.rectangle(1046, 384, 1, 624, Phaser.Display.Color.HexStringToColor('rgba(255, 0, 229, 0.3)').color, 1).setDepth(21);

    this.turnText = scene.add.text(180, 36, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: COLORS.player1,
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0, 0.5).setDepth(22);

    this.headerSep1 = scene.add.rectangle(340, 36, 1, 20, Phaser.Display.Color.HexStringToColor('rgba(0,245,255,0.2)').color, 1).setDepth(22);

    this.playerDot = scene.add.circle(404, 36, 4, Phaser.Display.Color.HexStringToColor(COLORS.player1).color, 1).setDepth(22);
    this.playerText = scene.add.text(420, 36, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      color: COLORS.player1,
      letterSpacing: 1
    }).setOrigin(0, 0.5).setDepth(22);

    this.headerSep2 = scene.add.rectangle(620, 36, 1, 20, Phaser.Display.Color.HexStringToColor('rgba(0,245,255,0.2)').color, 1).setDepth(22);
    this.unitsAliveText = scene.add.text(700, 36, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: 'rgba(255,255,255,0.5)',
      letterSpacing: 1
    }).setOrigin(0, 0.5).setDepth(22);

    this.emptyPromptText = scene.add.text(1206, 384, 'SELECCIONA\nUNA UNIDAD', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: 'rgba(255,255,255,0.2)',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5).setDepth(23);

    this.unitText = scene.add.text(1066, 104, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: COLORS.player1,
      letterSpacing: 2
    }).setDepth(23);

    this.unitSubText = scene.add.text(1066, 122, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: rgba(COLORS.player1, 0.5),
      letterSpacing: 1
    }).setDepth(23);

    this.sepInfoTop = scene.add.rectangle(1206, 138, 280, 1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.1)').color, 1).setDepth(23);

    this.hpLabel = scene.add.text(1066, 160, 'HP', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1
    }).setDepth(23);

    this.hpBarBack = scene.add.rectangle(1066, 172, 220, 6, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.1)').color, 1).setOrigin(0, 0.5).setDepth(23);
    this.hpBarFill = scene.add.rectangle(1066, 172, 220, 6, Phaser.Display.Color.HexStringToColor('#39ff14').color, 1).setOrigin(0, 0.5).setDepth(24);
    this.hpValueText = scene.add.text(1300, 175, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#39ff14'
    }).setOrigin(1, 0.5).setDepth(24);

    this.apLabel = scene.add.text(1066, 196, 'PA', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1
    }).setDepth(23);

    this.apPips = [];
    for (let i = 0; i < 3; i += 1) {
      this.apPips.push(scene.add.text(1066 + i * 20, 210, '◇', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: 'rgba(0,245,255,0.25)'
      }).setDepth(23));
    }
    this.apValueText = scene.add.text(1134, 210, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: 'rgba(255,255,255,0.4)'
    }).setDepth(23);

    this.sepInfoBottom = scene.add.rectangle(1206, 234, 280, 1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.08)').color, 1).setDepth(23);

    this.actionsLabel = scene.add.text(1066, 254, 'ACCIONES', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1
    }).setDepth(23);

    this.actionRows = {
      move: createActionRow(scene, 1066, 272, 280),
      basic: createActionRow(scene, 1066, 308, 280),
      special: createActionRow(scene, 1066, 344, 280)
    };

    this.actionRows.move.container.setDepth(24);
    this.actionRows.basic.container.setDepth(24);
    this.actionRows.special.container.setDepth(24);

    this.actionRows.move.setContent('MOVER', '1-2 PA');

    this.descriptionText = scene.add.text(1066, 396, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: 'rgba(255,255,255,0.25)',
      lineSpacing: 6,
      wordWrap: { width: 280 }
    }).setDepth(23);

    this.noActionsText = scene.add.text(1206, 560, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ff3366',
      letterSpacing: 1
    }).setOrigin(0.5).setAlpha(0.7).setDepth(23);

    this.endTurnSeparator = scene.add.rectangle(1206, 624, 280, 1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.08)').color, 1).setDepth(23);

    this.endTurnColor = COLORS.player1;
    this.endTurnBg = scene.add.rectangle(1206, 656, 280, 40, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(0, 245, 255, 0.4)').color, 1)
      .setDepth(24)
      .setInteractive({ useHandCursor: true });

    this.endTurnText = scene.add.text(1206, 656, 'FINALIZAR TURNO', {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: COLORS.player1,
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(25);

    this.endTurnConfirmContainer = scene.add.container(0, 0).setDepth(32).setVisible(false);
    this.endTurnConfirmBg = scene.add.rectangle(1206, 584, 280, 88, Phaser.Display.Color.HexStringToColor('#0d0d0f').color, 0.95)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(0,245,255,0.45)').color, 1);
    this.endTurnConfirmText = scene.add.text(1206, 564, 'AUN TIENES PA DISPONIBLES.\nFINALIZAR TURNO?', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: 'rgba(255,255,255,0.85)',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);
    this.endTurnConfirmYesBg = scene.add.rectangle(1162, 606, 76, 24, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.player1).color, 0.8)
      .setInteractive({ useHandCursor: true });
    this.endTurnConfirmYesText = scene.add.text(1162, 606, 'SI', {
      fontFamily: 'monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: COLORS.player1,
      letterSpacing: 1
    }).setOrigin(0.5);
    this.endTurnConfirmNoBg = scene.add.rectangle(1250, 606, 76, 24, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.35)').color, 1)
      .setInteractive({ useHandCursor: true });
    this.endTurnConfirmNoText = scene.add.text(1250, 606, 'NO', {
      fontFamily: 'monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 1
    }).setOrigin(0.5);
    this.endTurnConfirmContainer.add([
      this.endTurnConfirmBg,
      this.endTurnConfirmText,
      this.endTurnConfirmYesBg,
      this.endTurnConfirmYesText,
      this.endTurnConfirmNoBg,
      this.endTurnConfirmNoText
    ]);

    this.endTurnBg.on('pointerover', () => {
      this.endTurnBg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0.08);
      this.endTurnBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0.7);
    });

    this.endTurnBg.on('pointerout', () => {
      this.endTurnBg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0);
      this.endTurnBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0.4);
    });

    this.endTurnBg.on('pointerdown', () => {
      this.endTurnBg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0.15);
      this.onEndTurn?.();
    });

    this.endTurnBg.on('pointerup', () => {
      this.endTurnBg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0.08);
    });

    this.endTurnConfirmYesBg.on('pointerover', () => {
      this.endTurnConfirmYesBg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0.12);
    });
    this.endTurnConfirmYesBg.on('pointerout', () => {
      this.endTurnConfirmYesBg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.endTurnColor).color, 0);
    });
    this.endTurnConfirmNoBg.on('pointerover', () => {
      this.endTurnConfirmNoBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#ffffff').color, 0.08);
    });
    this.endTurnConfirmNoBg.on('pointerout', () => {
      this.endTurnConfirmNoBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#ffffff').color, 0);
    });

    this.endTurnConfirmYesBg.on('pointerdown', () => {
      const handler = this.onEndTurnConfirm;
      this.hideEndTurnConfirmation();
      handler?.();
    });
    this.endTurnConfirmNoBg.on('pointerdown', () => {
      const handler = this.onEndTurnCancel;
      this.hideEndTurnConfirmation();
      handler?.();
    });

    this.actionRows.move.onClick(() => this.onMove?.());
    this.actionRows.basic.onClick(() => this.onBasic?.());
    this.actionRows.special.onClick(() => this.onSpecial?.());
  }

  setHandlers(handlers) {
    this.onMove = handlers.onMove;
    this.onBasic = handlers.onBasic;
    this.onSpecial = handlers.onSpecial;
    this.onEndTurn = handlers.onEndTurn;
  }

  showEndTurnConfirmation(onConfirm, onCancel) {
    this.onEndTurnConfirm = onConfirm;
    this.onEndTurnCancel = onCancel;
    this.endTurnConfirmContainer.setVisible(true);
  }

  hideEndTurnConfirmation() {
    this.onEndTurnConfirm = null;
    this.onEndTurnCancel = null;
    this.endTurnConfirmContainer.setVisible(false);
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
    this.endTurnConfirmBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(currentPlayerInfo.color).color, 0.45);
    this.endTurnConfirmYesBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(currentPlayerInfo.color).color, 0.8);
    this.endTurnConfirmYesText.setColor(currentPlayerInfo.color);

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
