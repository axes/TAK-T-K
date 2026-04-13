import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { COLORS, GAME_CONFIG, PLAYER_INFO, SETUP_ROWS, UNIT_ORDER } from '../config.js';
import { createGameState } from '../gameState.js';
import { createUnitGlyph } from '../ui/unitGlyph.js';

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
    this.exitLink = this.add.text(1306, 736, 'TERMINAR PARTIDA', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: 'rgba(255,255,255,0.35)',
      letterSpacing: 2
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true }).setDepth(30);

    this.exitUnderline = this.add.rectangle(1306 - this.exitLink.width / 2, 744, this.exitLink.width, 1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.25)').color, 1)
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
    const overlay = this.add.rectangle(683, 384, GAME_CONFIG.width, GAME_CONFIG.height, Phaser.Display.Color.HexStringToColor('#000000').color, 0.72);
    const panel = this.add.rectangle(683, 384, 420, 170, Phaser.Display.Color.HexStringToColor('#0d0d0f').color, 0.95)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(255, 0, 229, 0.5)').color, 1);
    const title = this.add.text(683, 350, 'TERMINAR PARTIDA', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: COLORS.text,
      letterSpacing: 3
    }).setOrigin(0.5);
    const message = this.add.text(683, 382, '¿SEGURO QUE QUIERES VOLVER AL MENÚ PRINCIPAL?', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: 'rgba(255,255,255,0.6)',
      align: 'center',
      letterSpacing: 1
    }).setOrigin(0.5);

    const confirmYesBg = this.add.rectangle(623, 426, 110, 32, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('#ff3366').color, 0.9)
      .setInteractive({ useHandCursor: true });
    const confirmYesText = this.add.text(623, 426, 'SI, SALIR', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ff3366',
      letterSpacing: 1
    }).setOrigin(0.5);

    const confirmNoBg = this.add.rectangle(743, 426, 110, 32, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('rgba(255,255,255,0.4)').color, 1)
      .setInteractive({ useHandCursor: true });
    const confirmNoText = this.add.text(743, 426, 'NO', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 1
    }).setOrigin(0.5);

    confirmYesBg.on('pointerover', () => confirmYesBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#ff3366').color, 0.12));
    confirmYesBg.on('pointerout', () => confirmYesBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#ff3366').color, 0));
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
      this.statusText.setText(`DESPLIEGUE REMOTO: ${localName} | UNIDAD ACTIVA: ${templateKey}`);
    } else {
      this.statusText.setText(`TURNO DE CONFIGURACION: ${PLAYER_INFO[owner].name} | UNIDAD ACTIVA: ${templateKey}`);
    }
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

  createRemoteControls() {
    this.remoteConfirmBg = this.add.rectangle(1120, 708, 180, 40, Phaser.Display.Color.HexStringToColor('#000000').color, 0)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('#00f5ff').color, 0.45)
      .setInteractive({ useHandCursor: true })
      .setDepth(40);
    this.remoteConfirmText = this.add.text(1120, 708, 'CONFIRMAR', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: 'rgba(0,245,255,0.45)',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(41);

    this.remoteConfirmBg.on('pointerover', () => {
      if (!this.canSubmitRemoteSetup()) {
        return;
      }
      this.remoteConfirmBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#00f5ff').color, 0.12);
    });
    this.remoteConfirmBg.on('pointerout', () => {
      this.remoteConfirmBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#00f5ff').color, 0);
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
    this.remoteConfirmBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor('#00f5ff').color, enabled ? 0.9 : 0.35);
    this.remoteConfirmText.setColor(enabled ? '#00f5ff' : 'rgba(0,245,255,0.35)');
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
