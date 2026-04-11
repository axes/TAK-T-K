import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { COLORS, HUD_LAYOUT, PLAYER_INFO } from '../config.js';

function createButton(scene, x, y, width, label) {
  const container = scene.add.container(x, y);
  const background = scene.add.rectangle(0, 0, width, 42, Phaser.Display.Color.HexStringToColor(COLORS.button).color, 1)
    .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.panelBorder).color, 1);
  const text = scene.add.text(0, 0, label, {
    fontFamily: 'monospace',
    fontSize: '16px',
    color: COLORS.text,
    letterSpacing: 2
  }).setOrigin(0.5);

  background.setInteractive({ useHandCursor: true });
  container.add([background, text]);

  return {
    container,
    background,
    text,
    setEnabled(enabled) {
      background.setFillStyle(Phaser.Display.Color.HexStringToColor(enabled ? COLORS.buttonActive : COLORS.buttonDisabled).color, 1);
      background.disableInteractive();
      if (enabled) {
        background.setInteractive({ useHandCursor: true });
      }
      container.setAlpha(enabled ? 1 : 0.45);
    },
    onClick(handler) {
      background.off('pointerdown');
      background.on('pointerdown', handler);
    }
  };
}

function createActionRow(scene, x, y, width) {
  const container = scene.add.container(x, y);
  const background = scene.add.rectangle(0, 0, width, 44, Phaser.Display.Color.HexStringToColor(COLORS.button).color, 1)
    .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.panelBorder).color, 1);
  const nameText = scene.add.text(-width / 2 + 12, -10, '', {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: COLORS.text,
    letterSpacing: 2
  });
  const costText = scene.add.text(width / 2 - 12, -10, '', {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: COLORS.text,
    letterSpacing: 2
  }).setOrigin(1, 0);
  const descText = scene.add.text(-width / 2 + 12, 8, '', {
    fontFamily: 'monospace',
    fontSize: '10px',
    color: COLORS.text,
    letterSpacing: 1
  });

  background.setInteractive({ useHandCursor: true });
  container.add([background, nameText, costText, descText]);

  return {
    container,
    background,
    nameText,
    costText,
    descText,
    setContent(name, cost, description) {
      nameText.setText(name);
      costText.setText(cost);
      descText.setText(description);
    },
    setEnabled(enabled) {
      background.setFillStyle(Phaser.Display.Color.HexStringToColor(enabled ? COLORS.buttonActive : COLORS.buttonDisabled).color, 1);
      container.setAlpha(enabled ? 1 : 0.3);
      background.disableInteractive();
      if (enabled) {
        background.setInteractive({ useHandCursor: true });
      }
    },
    onClick(handler) {
      background.off('pointerdown');
      background.on('pointerdown', handler);
    }
  };
}

function getAbilityDetails(unit) {
  if (!unit) {
    return {
      basicName: 'ATAQUE BASICO',
      basicDesc: '',
      specialName: 'ATAQUE ESPECIAL',
      specialDesc: '',
      specialDetail: ''
    };
  }

  if (unit.key === 'VANGUARD') {
    return {
      basicName: 'ATAQUE BASICO',
      basicDesc: 'ADYACENTE, DANO DIRECTO',
      specialName: 'ATAQUE ESPECIAL',
      specialDesc: 'ADYACENTE, DANO + EMPUJE',
      specialDetail: 'GOLPE DE IMPACTO: EMPUJA 1 CELDA SI EL DESTINO ESTA LIBRE.'
    };
  }

  if (unit.key === 'SNIPER') {
    return {
      basicName: 'ATAQUE BASICO',
      basicDesc: 'LINEA RECTA HASTA 3 CELDAS',
      specialName: 'ATAQUE ESPECIAL',
      specialDesc: 'LINEA RECTA HASTA 4 CELDAS',
      specialDetail: 'DISPARO CARGADO: SI TE MOVISTE ESTE TURNO, NO PUEDE USARSE.'
    };
  }

  return {
    basicName: 'ATAQUE BASICO',
    basicDesc: 'GOLPE EN AREA ADYACENTE',
    specialName: 'ATAQUE ESPECIAL',
    specialDesc: 'ALCANCE 2, REDUCCION DE PA',
    specialDetail: 'SELLO ARCANO: APLICA -2 PA AL OBJETIVO EN SU PROXIMO TURNO.'
  };
}

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.buttons = {};
    const sidePanelX = 814;
    const sidePanelY = 420;
    const sidePanelWidth = 340;
    const sidePanelHeight = 576;

    this.panel = scene.add.rectangle(512, 54, 968, 92, Phaser.Display.Color.HexStringToColor(COLORS.panel).color, 0.95)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.panelBorder).color, 1)
      .setDepth(20);

    this.sidePanel = scene.add.rectangle(sidePanelX, sidePanelY, sidePanelWidth, sidePanelHeight, Phaser.Display.Color.HexStringToColor(COLORS.panel).color, 0.92)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.panelBorder).color, 1)
      .setDepth(20);

    this.sidePanelTitle = scene.add.text(660, 146, 'DETALLE DE UNIDAD', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: COLORS.text,
      letterSpacing: 3
    }).setDepth(21);

    this.bottomReservedPanel = scene.add.rectangle(512, HUD_LAYOUT.bottomPanelY, 968, 140, Phaser.Display.Color.HexStringToColor(COLORS.panel).color, 0.65)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.panelBorder).color, 1)
      .setDepth(20);

    this.bottomReservedText = scene.add.text(512, HUD_LAYOUT.bottomPanelY - 8, 'ESPACIO RESERVADO PARA DIALOGOS / ALERTAS / LOGS / CHAT', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: COLORS.text,
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0.55).setDepth(21);

    this.turnText = scene.add.text(HUD_LAYOUT.leftX, HUD_LAYOUT.topY, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: COLORS.text,
      letterSpacing: 3
    }).setDepth(21);

    this.playerText = scene.add.text(HUD_LAYOUT.leftX, HUD_LAYOUT.topY + 24, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: COLORS.text,
      letterSpacing: 3
    }).setDepth(21);

    this.unitText = scene.add.text(660, 172, '', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: COLORS.text,
      letterSpacing: 3
    }).setDepth(21);

    this.hpLabel = scene.add.text(660, 212, 'HP', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: COLORS.text,
      letterSpacing: 3
    }).setDepth(21);

    this.hpBarBack = scene.add.rectangle(746, 230, 172, 14, Phaser.Display.Color.HexStringToColor(COLORS.buttonDisabled).color, 1)
      .setOrigin(0, 0.5).setDepth(21);
    this.hpBarFill = scene.add.rectangle(746, 230, 172, 14, Phaser.Display.Color.HexStringToColor('#39ff14').color, 1)
      .setOrigin(0, 0.5).setDepth(22);
    this.hpValueText = scene.add.text(924, 222, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: COLORS.text,
      letterSpacing: 1
    }).setDepth(22);

    this.apLabel = scene.add.text(660, 252, 'PA', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: COLORS.text,
      letterSpacing: 3
    }).setDepth(21);
    this.apPipsText = scene.add.text(746, 252, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: COLORS.text,
      letterSpacing: 3
    }).setDepth(21);
    this.apValueText = scene.add.text(924, 252, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: COLORS.text,
      letterSpacing: 1
    }).setDepth(21);

    this.actionText = scene.add.text(660, 276, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: COLORS.text,
      letterSpacing: 2
    }).setDepth(21);

    this.actionPanelTitle = scene.add.text(660, 302, 'ACCIONES', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: COLORS.text,
      letterSpacing: 4
    }).setDepth(21);

    this.actionRows = {
      move: createActionRow(scene, sidePanelX, 338, 300),
      basic: createActionRow(scene, sidePanelX, 390, 300),
      special: createActionRow(scene, sidePanelX, 442, 300),
      endTurn: createActionRow(scene, sidePanelX, 494, 300)
    };
    this.actionRows.move.container.setDepth(22);
    this.actionRows.basic.container.setDepth(22);
    this.actionRows.special.container.setDepth(22);
    this.actionRows.endTurn.container.setDepth(22);

    this.actionRows.move.setContent('MOVER', '1-2 PA', 'SEGUN DIRECCION');
    this.actionRows.endTurn.setContent('FIN TURNO', '0 PA', 'CEDE EL CONTROL AL RIVAL');

    this.noActionsText = scene.add.text(sidePanelX, 536, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ff3366',
      letterSpacing: 2,
      align: 'center'
    }).setOrigin(0.5).setDepth(21);

    this.descriptionTitle = scene.add.text(660, 564, 'DESCRIPCION HABILIDAD', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: COLORS.text,
      letterSpacing: 2
    }).setDepth(21);
    this.descriptionBox = scene.add.rectangle(sidePanelX, 640, 300, 112, Phaser.Display.Color.HexStringToColor(COLORS.button).color, 1)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.panelBorder).color, 1)
      .setDepth(21);
    this.descriptionText = scene.add.text(672, 600, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: COLORS.text,
      wordWrap: { width: 274 },
      lineSpacing: 5
    }).setDepth(22);

    this.selectPromptText = scene.add.text(sidePanelX, sidePanelY, 'SELECCIONA UNA UNIDAD', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: COLORS.text,
      letterSpacing: 3
    }).setOrigin(0.5).setDepth(23);

    this.buttons.move = createButton(scene, 2000, 2000, 1, '');
    this.buttons.basic = createButton(scene, 2000, 2000, 1, '');
    this.buttons.special = createButton(scene, 2000, 2000, 1, '');
    this.buttons.endTurn = createButton(scene, 2000, 2000, 1, '');

    this.buttons.move.container.setDepth(22);
    this.buttons.basic.container.setDepth(22);
    this.buttons.special.container.setDepth(22);
    this.buttons.endTurn.container.setDepth(22);
    this.buttons.move.container.setVisible(false);
    this.buttons.basic.container.setVisible(false);
    this.buttons.special.container.setVisible(false);
    this.buttons.endTurn.container.setVisible(false);

    this.actionRows.move.onClick(() => this.onMove?.());
    this.actionRows.basic.onClick(() => this.onBasic?.());
    this.actionRows.special.onClick(() => this.onSpecial?.());
    this.actionRows.endTurn.onClick(() => this.onEndTurn?.());
  }

  setHandlers(handlers) {
    this.onMove = handlers.onMove;
    this.onBasic = handlers.onBasic;
    this.onSpecial = handlers.onSpecial;
    this.onEndTurn = handlers.onEndTurn;
  }

  update(state, selectedUnit, availability = null) {
    const currentPlayerInfo = PLAYER_INFO[state.currentPlayer];
    this.turnText.setText(`TURNO ${state.turnNumber}`);
    this.playerText.setText(`ACTIVO: ${currentPlayerInfo.name}`);
    this.playerText.setColor(currentPlayerInfo.color);

    const hasSelection = Boolean(selectedUnit);
    this.selectPromptText.setVisible(!hasSelection);
    this.unitText.setVisible(hasSelection);
    this.hpLabel.setVisible(hasSelection);
    this.hpBarBack.setVisible(hasSelection);
    this.hpBarFill.setVisible(hasSelection);
    this.hpValueText.setVisible(hasSelection);
    this.apLabel.setVisible(hasSelection);
    this.apPipsText.setVisible(hasSelection);
    this.apValueText.setVisible(hasSelection);
    this.actionText.setVisible(hasSelection);
    this.actionPanelTitle.setVisible(hasSelection);
    this.descriptionTitle.setVisible(hasSelection);
    this.descriptionBox.setVisible(hasSelection);
    this.descriptionText.setVisible(hasSelection);
    this.actionRows.move.container.setVisible(hasSelection);
    this.actionRows.basic.container.setVisible(hasSelection);
    this.actionRows.special.container.setVisible(hasSelection);
    this.actionRows.endTurn.container.setVisible(true);

    if (selectedUnit) {
      const details = getAbilityDetails(selectedUnit);
      const ownerInfo = PLAYER_INFO[selectedUnit.owner];

      this.unitText.setText(selectedUnit.name);
      this.unitText.setColor(ownerInfo.color);
      this.actionText.setText(`ACCION: ${state.selectedAction.toUpperCase()}`);

      const hpRatio = selectedUnit.maxHp > 0 ? selectedUnit.hp / selectedUnit.maxHp : 0;
      const hpWidth = Math.max(0, Math.round(172 * hpRatio));
      let hpColor = '#39ff14';
      if (hpRatio <= 0.25) {
        hpColor = '#ff3366';
      } else if (hpRatio <= 0.5) {
        hpColor = '#ffaa00';
      }
      this.hpBarFill.width = hpWidth;
      this.hpBarFill.setFillStyle(Phaser.Display.Color.HexStringToColor(hpColor).color, 1);
      this.hpValueText.setText(`${selectedUnit.hp} / ${selectedUnit.maxHp}`);

      let pips = '';
      for (let i = 0; i < selectedUnit.maxAp; i += 1) {
        pips += i < selectedUnit.ap ? '* ' : '- ';
      }
      this.apPipsText.setText(pips.trim());
      this.apValueText.setText(`${selectedUnit.ap} / ${selectedUnit.maxAp}`);

      const canSpecial = availability ? availability.special : selectedUnit.ap >= selectedUnit.specialAttack.cost;
      const specialName = canSpecial ? details.specialName : `X ${details.specialName}`;
      this.actionRows.basic.setContent(details.basicName, `${selectedUnit.basicAttack.cost} PA`, details.basicDesc);
      this.actionRows.special.setContent(specialName, `${selectedUnit.specialAttack.cost} PA`, details.specialDesc);

      let description = 'SELECCIONA UNA ACCION PARA VER SU DESCRIPCION DETALLADA.';
      if (state.selectedAction === 'move') {
        description = 'MOVER: CAMINA EN 4 DIRECCIONES (1 PA) O DIAGONAL (2 PA).';
      } else if (state.selectedAction === 'basic') {
        description = `${details.basicName}: COSTE ${selectedUnit.basicAttack.cost} PA. ${details.basicDesc}.`;
      } else if (state.selectedAction === 'special') {
        description = `${details.specialName}: COSTE ${selectedUnit.specialAttack.cost} PA. ${details.specialDetail}`;
      }
      this.descriptionText.setText(description);
    } else {
      this.unitText.setText('');
      this.actionText.setText('');
      this.noActionsText.setText('');
      this.descriptionText.setText('');
      this.actionRows.move.setEnabled(false);
      this.actionRows.basic.setEnabled(false);
      this.actionRows.special.setEnabled(false);
      this.actionRows.endTurn.setEnabled(true);
      this.actionRows.endTurn.setContent('FIN TURNO', '0 PA', 'CEDE EL CONTROL AL RIVAL');
      return;
    }

    if (availability && !availability.any && selectedUnit) {
      this.noActionsText.setText('SIN ACCIONES DISPONIBLES');
      this.noActionsText.setAlpha(0.7);
    } else {
      this.noActionsText.setText('');
    }

    const canAct = Boolean(selectedUnit);
    const moveEnabled = availability ? availability.move : (canAct && selectedUnit.ap > 0 && !selectedUnit.specialLockedMove);
    const basicEnabled = availability ? availability.basic : (canAct && selectedUnit.ap >= selectedUnit.basicAttack.cost);
    const specialEnabled = availability ? availability.special : (canAct && selectedUnit.ap >= selectedUnit.specialAttack.cost);

    this.actionRows.move.setEnabled(moveEnabled);
    this.actionRows.basic.setEnabled(basicEnabled);
    this.actionRows.special.setEnabled(specialEnabled);
    this.actionRows.endTurn.setEnabled(true);
  }
}
