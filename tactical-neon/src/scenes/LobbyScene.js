import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { GAME_CONFIG, SERVER_URL } from '../config.js';
import { SocketManager } from '../SocketManager.js';

function colorToNumber(value) {
  return Phaser.Display.Color.HexStringToColor(value).color;
}

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super('LobbyScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d0d0f');
    this.state = 'entry';
    this.roomId = '';
    this.playerId = null;
    this.nickname = '';
    this.opponentNickname = '';
    this.errorMessage = '';
    this.domNodes = [];
    this.domLayoutEntries = [];
    this.socketManager = SocketManager.getInstance();
    this.socketManager.connect(SERVER_URL);

    this.createBaseUI();
    this.bindSocketEvents();
    this.renderState();

    this.scale.on('resize', this.updateDomLayout, this);
    this.events.once('shutdown', () => this.cleanup());
    this.events.once('destroy', () => this.cleanup());
  }

  createBaseUI() {
    this.titleText = this.add.text(683, 140, '', {
      fontFamily: 'monospace',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#00f5ff',
      align: 'center',
      letterSpacing: 4
    }).setOrigin(0.5);

    this.subtitleText = this.add.text(683, 180, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: 'rgba(255,255,255,0.45)',
      align: 'center',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.infoText = this.add.text(683, 240, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.secondaryInfoText = this.add.text(683, 290, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: 'rgba(255,255,255,0.65)',
      align: 'center',
      letterSpacing: 1
    }).setOrigin(0.5);

    this.errorText = this.add.text(683, 360, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: 'rgba(255,51,102,0.8)',
      align: 'center',
      letterSpacing: 1
    }).setOrigin(0.5);

    this.progressBg = this.add.rectangle(683, 380, 260, 10, colorToNumber('rgba(255,255,255,0.12)'), 1).setVisible(false);
    this.progressFill = this.add.rectangle(553, 380, 0, 10, colorToNumber('rgba(57,255,20,0.85)'), 1)
      .setOrigin(0, 0.5)
      .setVisible(false);

    this.waitingText = this.add.text(683, 420, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: 'rgba(0,245,255,0.5)',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.codeText = this.add.text(683, 280, '', {
      fontFamily: 'monospace',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#00f5ff',
      letterSpacing: 6
    }).setOrigin(0.5);

    this.backButton = this.createButton(74, 708, 118, 36, '← VOLVER', 'rgba(255,255,255,0.45)', () => {
      this.socketManager.disconnect();
      this.scene.start('MainScene');
    });
  }

  createButton(x, y, width, height, label, borderColor, onClick) {
    const border = colorToNumber(borderColor);
    const bg = this.add.rectangle(x, y, width, height, colorToNumber('#000000'), 0)
      .setStrokeStyle(1, border, 1)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: borderColor,
      letterSpacing: 1
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(border, 0.1));
    bg.on('pointerout', () => bg.setFillStyle(border, 0));
    bg.on('pointerdown', onClick);

    return { bg, text };
  }

  createTextLink(x, y, label, onClick) {
    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: 'rgba(255,255,255,0.6)',
      letterSpacing: 1
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    text.on('pointerover', () => text.setColor('rgba(255,255,255,0.95)'));
    text.on('pointerout', () => text.setColor('rgba(255,255,255,0.6)'));
    text.on('pointerdown', onClick);
    return text;
  }

  createDomInput({ x, y, width, maxLength, placeholder }) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = maxLength;
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.style.position = 'fixed';
    input.style.height = '44px';
    input.style.padding = '0 12px';
    input.style.border = '1px solid rgba(0,245,255,0.3)';
    input.style.background = 'rgba(0,0,0,0.5)';
    input.style.color = '#00f5ff';
    input.style.fontFamily = 'monospace';
    input.style.fontSize = '16px';
    input.style.textTransform = 'uppercase';
    input.style.textAlign = 'center';
    input.style.outline = 'none';
    input.style.zIndex = '50';
    input.style.boxSizing = 'border-box';
    input.style.borderRadius = '2px';

    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase().replace(/\s+/g, '').slice(0, maxLength);
      this.errorMessage = '';
      this.errorText.setText('');
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        if (this.state === 'entry') {
          this.handleCreateRoom();
        } else if (this.state === 'join') {
          this.handleJoinRoom();
        }
      }
    });

    document.body.appendChild(input);
    this.domNodes.push(input);
    this.domLayoutEntries.push({ node: input, x, y, width });
    this.updateDomLayout();
    return input;
  }

  updateDomLayout() {
    const canvas = this.game.canvas;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / GAME_CONFIG.width;
    const scaleY = rect.height / GAME_CONFIG.height;

    for (const entry of this.domLayoutEntries) {
      const left = rect.left + (entry.x - entry.width / 2) * scaleX;
      const top = rect.top + (entry.y - 22) * scaleY;
      entry.node.style.left = `${left}px`;
      entry.node.style.top = `${top}px`;
      entry.node.style.width = `${entry.width * scaleX}px`;
      entry.node.style.height = `${44 * scaleY}px`;
    }
  }

  clearStateObjects() {
    for (const node of this.domNodes) {
      node.remove();
    }
    this.domNodes = [];
    this.domLayoutEntries = [];

    if (this.stateButtons) {
      for (const item of this.stateButtons) {
        if (item.bg) {
          item.bg.destroy();
          item.text.destroy();
        } else {
          item.destroy();
        }
      }
    }
    this.stateButtons = [];

    if (this.waitingTween) {
      this.waitingTween.stop();
      this.waitingTween = null;
    }

    if (this.codePulseTween) {
      this.codePulseTween.stop();
      this.codePulseTween = null;
    }

    if (this.progressTween) {
      this.progressTween.stop();
      this.progressTween = null;
    }

    this.nicknameInput = null;
    this.codeInput = null;
  }

  renderState() {
    this.clearStateObjects();
    this.titleText.setColor('#00f5ff');
    this.errorText.setText(this.errorMessage || '');
    this.progressBg.setVisible(false);
    this.progressFill.setVisible(false).setSize(0, 10);
    this.codeText.setText('').setVisible(false);
    this.waitingText.setText('');
    this.infoText.setText('');
    this.secondaryInfoText.setText('');

    if (this.state === 'entry') {
      this.titleText.setText('MODO REMOTO');
      this.subtitleText.setText('SIN REGISTRO. SOLO UN NOMBRE.');
      this.nicknameInput = this.createDomInput({
        x: 683,
        y: 240,
        width: 280,
        maxLength: 12,
        placeholder: 'TU NOMBRE'
      });

      this.stateButtons.push(
        this.createButton(617, 300, 170, 40, 'CREAR SALA', '#00f5ff', () => this.handleCreateRoom()),
        this.createButton(789, 300, 170, 40, 'UNIRSE', '#ff00e5', () => this.showJoinState())
      );
      return;
    }

    if (this.state === 'created') {
      this.titleText.setText('SALA CREADA');
      this.subtitleText.setText('');
      this.codeText.setText(this.roomId).setVisible(true);
      this.infoText.setText('COMPARTE ESTE CODIGO CON TU OPONENTE');
      this.infoText.setColor('rgba(255,255,255,0.4)');
      this.waitingText.setText('ESPERANDO...');
      this.waitingTween = this.tweens.add({
        targets: this.waitingText,
        alpha: 0.35,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
      this.codePulseTween = this.tweens.add({
        targets: this.codeText,
        alpha: 0.7,
        duration: 2000,
        yoyo: true,
        repeat: -1
      });
      this.stateButtons.push(
        this.createButton(683, 500, 180, 42, 'CANCELAR', 'rgba(255,51,102,0.9)', () => {
          this.socketManager.disconnect();
          this.socketManager.connect(SERVER_URL);
          this.state = 'entry';
          this.errorMessage = '';
          this.renderState();
        })
      );
      return;
    }

    if (this.state === 'join') {
      this.titleText.setText('INGRESAR CODIGO DE SALA');
      this.subtitleText.setText('');
      this.codeInput = this.createDomInput({
        x: 683,
        y: 270,
        width: 200,
        maxLength: 6,
        placeholder: 'ABC123'
      });

      this.stateButtons.push(
        this.createButton(683, 330, 170, 40, 'CONFIRMAR', '#00f5ff', () => this.handleJoinRoom()),
        this.createTextLink(683, 380, 'VOLVER', () => {
          this.state = 'entry';
          this.errorMessage = '';
          this.renderState();
        })
      );
      return;
    }

    if (this.state === 'ready') {
      this.titleText.setText('OPONENTE ENCONTRADO');
      this.titleText.setColor('#39ff14');
      this.subtitleText.setText(this.opponentNickname || 'JUGADOR LISTO');
      this.secondaryInfoText.setText('INICIANDO PARTIDA...');
      this.progressBg.setVisible(true);
      this.progressFill.setVisible(true);
      this.progressTween = this.tweens.add({
        targets: this.progressFill,
        width: 260,
        duration: 1300,
        ease: 'Sine.easeInOut'
      });
      return;
    }

    this.titleText.setText('MODO REMOTO');
    this.subtitleText.setText('');
  }

  showJoinState() {
    if (!this.nicknameInput) {
      return;
    }

    this.nickname = this.nicknameInput.value.trim().toUpperCase();
    if (!this.nickname) {
      this.errorMessage = 'INGRESA UN NOMBRE';
      this.errorText.setText(this.errorMessage);
      return;
    }

    this.state = 'join';
    this.errorMessage = '';
    this.renderState();
  }

  handleCreateRoom() {
    if (!this.nicknameInput) {
      return;
    }

    this.nickname = this.nicknameInput.value.trim().toUpperCase();
    if (!this.nickname) {
      this.errorMessage = 'INGRESA UN NOMBRE';
      this.errorText.setText(this.errorMessage);
      return;
    }

    this.errorMessage = '';
    this.socketManager.emit('room:create', { nickname: this.nickname });
  }

  handleJoinRoom() {
    if (!this.codeInput) {
      return;
    }

    const roomId = this.codeInput.value.trim().toUpperCase();
    if (!roomId || roomId.length !== 6) {
      this.errorMessage = 'CODIGO INVALIDO';
      this.errorText.setText(this.errorMessage);
      return;
    }

    this.roomId = roomId;
    this.errorMessage = '';
    this.socketManager.emit('room:join', { roomId, nickname: this.nickname });
  }

  bindSocketEvents() {
    this.socketHandlers = {
      roomCreated: (payload = {}) => {
        this.roomId = String(payload.roomId || '').toUpperCase();
        this.playerId = payload.playerId || 'p1';
        this.state = 'created';
        this.renderState();
      },
      roomJoined: (payload = {}) => {
        this.playerId = payload.playerId || 'p2';
        this.state = 'ready';
        this.renderState();
      },
      roomReady: (payload = {}) => {
        this.opponentNickname = String(payload.opponent || '').toUpperCase();
        this.state = 'ready';
        this.renderState();
        this.time.delayedCall(1500, () => {
          this.scene.start('SetupScene', {
            mode: 'remote',
            playerId: this.playerId,
            roomId: this.roomId,
            opponentNickname: this.opponentNickname,
            socketManager: this.socketManager
          });
        });
      },
      roomError: (payload = {}) => {
        this.errorMessage = payload.msg || 'ERROR DE SALA';
        this.errorText.setText(this.errorMessage);
      },
      roomWaiting: () => {
        this.state = 'created';
        this.renderState();
      }
    };

    this.socketManager.on('room:created', this.socketHandlers.roomCreated);
    this.socketManager.on('room:joined', this.socketHandlers.roomJoined);
    this.socketManager.on('room:ready', this.socketHandlers.roomReady);
    this.socketManager.on('room:error', this.socketHandlers.roomError);
    this.socketManager.on('room:waiting', this.socketHandlers.roomWaiting);
  }

  cleanup() {
    this.scale.off('resize', this.updateDomLayout, this);
    this.clearStateObjects();

    if (!this.socketHandlers) {
      return;
    }

    this.socketManager.off('room:created', this.socketHandlers.roomCreated);
    this.socketManager.off('room:joined', this.socketHandlers.roomJoined);
    this.socketManager.off('room:ready', this.socketHandlers.roomReady);
    this.socketManager.off('room:error', this.socketHandlers.roomError);
    this.socketManager.off('room:waiting', this.socketHandlers.roomWaiting);
    this.socketHandlers = null;
  }
}
