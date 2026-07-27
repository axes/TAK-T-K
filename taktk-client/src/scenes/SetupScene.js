import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { COLORS, GAME_CONFIG, PLAYER_INFO, SETUP_ROWS, UNIT_ORDER, FONTS } from '../config.js';
import { createGameState } from '../gameState.js';
import { createUnitGlyph } from '../ui/unitGlyph.js';
import { createDesktopTacticalLayout, centerOfCell, createDesktopChrome, createDesktopPanel } from '../ui/layout.js';
import { LayoutDebugOverlay } from '../ui/LayoutDebugOverlay.js';

export class SetupScene extends Phaser.Scene {
  constructor() {
    super('SetupScene');
  }

  init(data) {
    const mode = data?.mode || 'pvp';
    this.gameState = createGameState({ mode });
    this.playerId = data?.playerId || null;
    this.roomId = data?.roomId || null;
    this.opponentNickname = data?.opponentNickname || null;
    this.socketManager = data?.socketManager || null;
    this.isRemote = mode === 'remote';
    this.remoteOwner = this.playerId === 'p2' ? 2 : 1;
    if (this.isRemote) {
      this.gameState.setupPlayer = this.remoteOwner;
    }

    this.unitToPlaceIndexByPlayer = {
      1: 0,
      2: 0
    };
    this.isAutoPlacing = false;
    this.isExitConfirmOpen = false;
    this.remoteSetupSubmitted = false;
    this.remoteConfirmBg = null;
    this.remoteConfirmText = null;
    this.remoteSocketHandlers = null;
  }


  create() {
    this.layout = createDesktopTacticalLayout();
    this.layoutDebugOverlay = new LayoutDebugOverlay(this, this.layout);
    this.desktopChrome = createDesktopChrome(this, this.layout, {
      leftTitle: 'PREPARACIÓN',
      leftLines: ['Coloca tus unidades.', '', '• Selecciona una unidad disponible.', '', '• Haz clic en una celda válida.', '', '• Confirma el despliegue cuando corresponda.'],
      drawRightPanel: false
    });
    createDesktopPanel(this, this.layout.rightSidebar, {
      borderColor: Phaser.Display.Color.HexStringToColor(COLORS.grayBorder).color,
      fillColor: 0x111118,
      alpha: 0.92
    });
    this.boardGroup = this.add.group();
    this.unitGroup = this.add.group();


    this.titleText = this.add.text(this.layout.headerLeft.x + 18, this.layout.headerLeft.y + 27, 'PREPARACIÓN', {
      fontFamily: FONTS.GAME,
      fontSize: '16px',
      fontStyle: 'bold',
      color: COLORS.textPrimary,
      letterSpacing: 2
    }).setOrigin(0, 0.5).setDepth(21);

    this.turnText = this.add.text(this.layout.headerCenter.x + 120, this.layout.headerCenter.y + 36, '', {
      fontFamily: FONTS.GAME,
      fontSize: '13px',
      color: COLORS.textPrimary,
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5, 0.5).setDepth(22);

    this.playerText = this.add.text(this.layout.headerCenter.x + 368, this.layout.headerCenter.y + 36, '', {
      fontFamily: FONTS.GAME,
      fontSize: '13px',
      fontStyle: 'bold',
      color: COLORS.playerOne,
      letterSpacing: 1
    }).setOrigin(0, 0.5).setDepth(22);

    this.hintText = this.add.text(this.layout.headerCenter.x + 18, this.layout.headerCenter.y + 51, 'CLICK EN UNA CELDA VALIDA PARA COLOCAR LA UNIDAD ACTIVA', {
      fontFamily: FONTS.GAME,
      fontSize: '11px',
      color: 'rgba(255,255,255,0.62)',
      letterSpacing: 1
    }).setOrigin(0, 0.5);

    const rightContent = this.layout.rightSidebar.content;
    this.setupPanelTitle = this.add.text(rightContent.x, rightContent.y, 'ESTADO DE DESPLIEGUE', {
      fontFamily: FONTS.GAME, fontSize: '11px', fontStyle: 'bold', color: '#ff00e5', letterSpacing: 1
    }).setDepth(30);
    this.setupProgressText = this.add.text(rightContent.x, rightContent.y + 38, '', {
      fontFamily: FONTS.GAME, fontSize: '11px', color: 'rgba(255,255,255,0.72)', lineSpacing: 8,
      wordWrap: { width: rightContent.width }
    }).setDepth(30);

    this.drawBoard();
    this.createExitControls();
    if (this.isRemote) {
      this.createRemoteControls();
      this.bindRemoteSetupEvents();
      this.hintText.setText('COLOCA TUS UNIDADES Y CONFIRMA DESPLIEGUE');
    }
    this.refreshSetupStatus();

    this.events.once('shutdown', () => this.cleanupRemoteSetup());
    this.events.once('destroy', () => this.cleanupRemoteSetup());
  }

  createExitControls() {
    const headerRight = this.layout.headerRight.x + this.layout.headerRight.width - this.layout.spacing.sidebarPadding;
    this.exitLink = this.add.text(headerRight, this.layout.header.y + this.layout.header.height / 2, 'TERMINAR PARTIDA', {
      fontFamily: FONTS.GAME,
      fontSize: '10px',
      color: 'rgba(255,255,255,0.35)',
      letterSpacing: 2
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true }).setDepth(30);

    this.exitUnderline = this.add.rectangle(headerRight - this.exitLink.width / 2, this.layout.header.y + this.layout.header.height / 2 + 8, this.exitLink.width, 1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.25)').color, 1)
      .setVisible(false)
      .setDepth(30);

    this.exitLink.on('pointerover', () => {
      this.exitLink.setColor('#ff3366');
      this.exitUnderline.setVisible(true);
    });
    this.exitLink.on('pointerout', () => {
      this.exitLink.setColor('rgba(255,255,255,0.35)');
      this.exitUnderline.setVisible(false);
    });
    this.exitLink.on('pointerdown', () => {
      if (this.isExitConfirmOpen) {
        return;
      }
      this.showExitConfirmation();
    });

    this.exitConfirmContainer = this.add.container(0, 0).setDepth(200).setVisible(false);
    const centerX = this.layout.viewport.x + this.layout.viewport.width / 2;
    const centerY = this.layout.viewport.y + this.layout.viewport.height / 2;
    const overlay = this.add.rectangle(centerX, centerY, this.layout.viewport.width, this.layout.viewport.height, Phaser.Display.Color.HexStringToColor('#000000').color, 0.72);
    const panel = this.add.rectangle(centerX, centerY, 420, 170, Phaser.Display.Color.HexStringToColor('#0d0d0f').color, 0.95)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(255, 0, 229, 0.5)').color, 1);
    const title = this.add.text(centerX, centerY - 34, 'TERMINAR PARTIDA', {
      fontFamily: FONTS.GAME,
      fontSize: '16px',
      color: COLORS.textPrimary,
      letterSpacing: 3
    }).setOrigin(0.5);
    const message = this.add.text(centerX, centerY - 2, '¿SEGURO QUE QUIERES VOLVER AL MENÚ PRINCIPAL?', {
      fontFamily: FONTS.GAME,
      fontSize: '10px',
      color: 'rgba(255,255,255,0.6)',
      align: 'center',
      letterSpacing: 1
    }).setOrigin(0.5);

    const confirmYesBg = this.add.rectangle(centerX - 60, centerY + 42, 110, 32, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.grayBorder).color, 0.9)
      .setInteractive({ useHandCursor: true });
    const confirmYesText = this.add.text(centerX - 60, centerY + 42, 'SI, SALIR', {
      fontFamily: FONTS.GAME,
      fontSize: '10px',
      color: COLORS.grayText,
      letterSpacing: 1
    }).setOrigin(0.5);

    const confirmNoBg = this.add.rectangle(centerX + 60, centerY + 42, 110, 32, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.4)').color, 1)
      .setInteractive({ useHandCursor: true });
    const confirmNoText = this.add.text(centerX + 60, centerY + 42, 'NO', {
      fontFamily: FONTS.GAME,
      fontSize: '10px',
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 1
    }).setOrigin(0.5);

    confirmYesBg.on('pointerover', () => {
      confirmYesBg.setFillStyle(Phaser.Display.Color.HexStringToColor(COLORS.stateAttack).color, 0.12);
      confirmYesBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.stateAttack).color, 1);
      confirmYesText.setColor(COLORS.stateAttack);
    });
    confirmYesBg.on('pointerout', () => {
      confirmYesBg.setFillStyle(Phaser.Display.Color.HexStringToColor(COLORS.buttonBase).color, 1);
      confirmYesBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.grayBorder).color, 0.9);
      confirmYesText.setColor(COLORS.grayText);
    });
    confirmNoBg.on('pointerover', () => confirmNoBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#ffffff').color, 0.08));
    confirmNoBg.on('pointerout', () => confirmNoBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#ffffff').color, 0));

    confirmYesBg.on('pointerdown', () => {
      this.hideExitConfirmation();
      if (this.isRemote && this.socketManager) {
        this.socketManager.disconnect();
      }
      this.scene.start('MainScene');
    });
    confirmNoBg.on('pointerdown', () => this.hideExitConfirmation());

    this.exitConfirmContainer.add([
      overlay,
      panel,
      title,
      message,
      confirmYesBg,
      confirmYesText,
      confirmNoBg,
      confirmNoText
    ]);
  }

  showExitConfirmation() {
    this.isExitConfirmOpen = true;
    this.exitConfirmContainer.setVisible(true);
  }

  hideExitConfirmation() {
    this.isExitConfirmOpen = false;
    this.exitConfirmContainer.setVisible(false);
  }

  drawBoard() {
    for (let y = 0; y < GAME_CONFIG.gridRows; y += 1) {
      for (let x = 0; x < GAME_CONFIG.gridCols; x += 1) {
        const baseColor = (x + y) % 2 === 0 ? COLORS.boardCellA : COLORS.boardCellB;
        const { x: px, y: py } = centerOfCell(this.layout, x, y);

        const tile = this.add.rectangle(px, py, GAME_CONFIG.cellSize, GAME_CONFIG.cellSize, Phaser.Display.Color.HexStringToColor(baseColor).color, 1)
          .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.boardGridBorder).color, 1);
        tile.setInteractive({ useHandCursor: true });
        tile.on('pointerover', () => {
          tile.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.stateHover).color, 1);
        });
        tile.on('pointerout', () => {
          tile.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.boardGridBorder).color, 1);
        });
        tile.on('pointerdown', () => this.handleCellClick(x, y));

        this.boardGroup.add(tile);
      }
    }
  }

  handleCellClick(x, y) {
    if (this.isAutoPlacing || this.isExitConfirmOpen) {
      return;
    }

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
      if (this.isRemote) {
        this.updateRemoteConfirmState();
        this.refreshSetupStatus();
        return;
      }

      if (owner === 1) {
        if (this.gameState.mode === 'pve') {
          this.gameState.setupPlayer = 2;
          this.gameState.log.unshift('IA: INICIANDO DESPLIEGUE');
          this.refreshSetupStatus();
          this.startAutoPlacementForAI();
          return;
        }

        this.gameState.setupPlayer = 2;
        this.gameState.log.unshift('JUGADOR 2, COLOCA TUS UNIDADES');
      } else {
        this.startBattle();
        return;
      }
    }

    this.refreshSetupStatus();
  }

  async startAutoPlacementForAI() {
    this.isAutoPlacing = true;
    this.hintText.setText('IA DESPLEGANDO UNIDADES...');

    const availableCells = [];
    for (const y of SETUP_ROWS[2]) {
      for (let x = 0; x < GAME_CONFIG.gridCols; x += 1) {
        availableCells.push({ x, y });
      }
    }

    for (let i = 0; i < UNIT_ORDER.length; i += 1) {
      const templateKey = UNIT_ORDER[this.unitToPlaceIndexByPlayer[2]];
      const unit = this.gameState.units.find((candidate) =>
        candidate.owner === 2 && candidate.key === templateKey && !candidate.position
      );
      if (!unit || availableCells.length === 0) {
        continue;
      }

      const randomIndex = Phaser.Math.Between(0, availableCells.length - 1);
      const [cell] = availableCells.splice(randomIndex, 1);
      unit.position = { x: cell.x, y: cell.y };
      this.gameState.setupPlacedByPlayer[2].push(unit.id);
      this.unitToPlaceIndexByPlayer[2] += 1;
      this.gameState.log.unshift(`IA COLOCA ${unit.name} EN ${cell.x + 1},${cell.y + 1}`);
      this.refreshSetupStatus();
      await this.wait(400);
    }

    this.startBattle();
  }

  startBattle() {
    if (this.isRemote) {
      return;
    }

    const startingPlayer = Phaser.Math.Between(0, 1) === 0 ? 1 : 2;
    this.gameState.phase = 'battle';
    this.scene.start('BattleScene', { gameState: this.gameState, startingPlayer });
  }

  wait(ms) {
    return new Promise((resolve) => {
      this.time.delayedCall(ms, resolve);
    });
  }

  refreshSetupStatus() {
    const owner = this.gameState.setupPlayer;
    const templateKey = UNIT_ORDER[this.unitToPlaceIndexByPlayer[owner]] || 'LISTO';
    if (this.isRemote) {
      const localName = this.playerId === 'p2' ? 'JUGADOR 2' : 'JUGADOR 1';
      this.turnText.setText('DESPLIEGUE REMOTO');
      this.playerText.setText(localName).setColor(PLAYER_INFO[this.playerId === 'p2' ? 2 : 1].color);
      this.setupProgressText.setText(`JUGADOR LOCAL: ${localName}\nUNIDAD ACTIVA: ${templateKey}\n\nCOLOCADAS: ${this.unitToPlaceIndexByPlayer[owner]}/${UNIT_ORDER.length}`);
    } else {
      this.turnText.setText('TURNO DE CONFIGURACION');
      this.playerText.setText(PLAYER_INFO[owner].name).setColor(PLAYER_INFO[owner].color);
      this.setupProgressText.setText(`JUGADOR ACTIVO: ${PLAYER_INFO[owner].name}\nUNIDAD ACTIVA: ${templateKey}\n\nCOLOCADAS: ${this.unitToPlaceIndexByPlayer[owner]}/${UNIT_ORDER.length}`);
    }
    this.refreshUnitMarkers();
  }

  refreshUnitMarkers() {
    this.unitGroup.clear(true, true);
    for (const unit of this.gameState.units) {
      if (!unit.position) {
        continue;
      }

      const { x: px, y: py } = centerOfCell(this.layout, unit.position.x, unit.position.y);
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

  createRemoteControls() {
    const { controls } = this.layout.rightSidebar;
    const sidebarCenterX = controls.x + controls.width / 2;
    const sidebarBottomY = controls.y + 38;
    this.remoteConfirmBg = this.add.rectangle(sidebarCenterX, sidebarBottomY, 180, 40, Phaser.Display.Color.HexStringToColor(COLORS.buttonBase).color, 1)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.grayBorder).color, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(40);
    this.remoteConfirmText = this.add.text(sidebarCenterX, sidebarBottomY, 'FINALIZAR DESPLIEGUE', {
      fontFamily: FONTS.GAME,
      fontSize: '10px',
      color: COLORS.textPrimary,
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(41);

    this.remoteConfirmBg.on('pointerover', () => {
      if (!this.canSubmitRemoteSetup()) {
        return;
      }
      this.remoteConfirmBg.setFillStyle(Phaser.Display.Color.HexStringToColor(COLORS.stateHover).color, 0.12);
      this.remoteConfirmBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.stateHoverBorder).color, 1);
      this.remoteConfirmText.setColor(COLORS.stateHoverBorder);
    });
    this.remoteConfirmBg.on('pointerout', () => {
      this.remoteConfirmBg.setFillStyle(Phaser.Display.Color.HexStringToColor(COLORS.buttonBase).color, 1);
      this.remoteConfirmBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.grayBorder).color, 0.9);
      this.remoteConfirmText.setColor(COLORS.textPrimary);
    });
    this.remoteConfirmBg.on('pointerdown', () => this.submitRemoteSetup());
    this.updateRemoteConfirmState();
  }

  canSubmitRemoteSetup() {
    return this.isRemote && !this.remoteSetupSubmitted && this.unitToPlaceIndexByPlayer[this.remoteOwner] >= UNIT_ORDER.length;
  }

  updateRemoteConfirmState() {
    if (!this.remoteConfirmBg || !this.remoteConfirmText) {
      return;
    }

    const enabled = this.canSubmitRemoteSetup();
    this.remoteConfirmBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.grayBorder).color, enabled ? 0.9 : 0.35);
    this.remoteConfirmText.setColor(enabled ? COLORS.textPrimary : COLORS.grayTextDim);
  }

  buildRemotePlacements() {
    const placements = {};
    const localUnits = this.gameState.units.filter((unit) => unit.owner === this.remoteOwner);
    for (const key of UNIT_ORDER) {
      const unit = localUnits.find((item) => item.key === key);
      if (!unit?.position) {
        return null;
      }
      placements[key] = { x: unit.position.x, y: unit.position.y };
    }

    return placements;
  }

  submitRemoteSetup() {
    if (!this.canSubmitRemoteSetup()) {
      return;
    }

    const placements = this.buildRemotePlacements();
    if (!placements) {
      return;
    }

    this.remoteSetupSubmitted = true;
    this.isAutoPlacing = true;
    this.updateRemoteConfirmState();
    this.hintText.setText('ESPERANDO AL OPONENTE...');
    this.remoteConfirmText.setText('ENVIADO');
    this.socketManager.emit('game:setup', {
      playerId: this.playerId,
      placements
    });
  }

  bindRemoteSetupEvents() {
    if (!this.socketManager) {
      return;
    }

    this.remoteSocketHandlers = {
      gameStart: (payload = {}) => {
        if (!payload.gameState) {
          return;
        }

        this.scene.start('BattleScene', {
          gameState: payload.gameState,
          playerId: this.playerId,
          roomId: this.roomId,
          opponentNickname: this.opponentNickname,
          socketManager: this.socketManager
        });
      },
      gameInvalid: (payload = {}) => {
        if (!payload.reason) {
          return;
        }

        this.remoteSetupSubmitted = false;
        this.isAutoPlacing = false;
        this.updateRemoteConfirmState();
        this.hintText.setText(payload.reason);
      },
      opponentDisconnected: () => {
        this.hintText.setText('OPONENTE DESCONECTADO');
      }
    };

    this.socketManager.on('game:start', this.remoteSocketHandlers.gameStart);
    this.socketManager.on('game:invalid', this.remoteSocketHandlers.gameInvalid);
    this.socketManager.on('room:opponent_disconnected', this.remoteSocketHandlers.opponentDisconnected);
  }

  cleanupRemoteSetup() {
    if (!this.socketManager || !this.remoteSocketHandlers) {
      return;
    }

    this.socketManager.off('game:start', this.remoteSocketHandlers.gameStart);
    this.socketManager.off('game:invalid', this.remoteSocketHandlers.gameInvalid);
    this.socketManager.off('room:opponent_disconnected', this.remoteSocketHandlers.opponentDisconnected);
    this.remoteSocketHandlers = null;
  }
}
