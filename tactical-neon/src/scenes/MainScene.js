import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

function colorToNumber(value) {
  return Phaser.Display.Color.HexStringToColor(value).color;
}

function drawRoundedCard(graphics, x, y, width, height, radius, borderColor, fillColor = null) {
  graphics.clear();
  if (fillColor) {
    graphics.fillStyle(colorToNumber(fillColor), 1);
    graphics.fillRoundedRect(x, y, width, height, radius);
  }
  graphics.lineStyle(1, colorToNumber(borderColor), 1);
  graphics.strokeRoundedRect(x, y, width, height, radius);
}

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d0d0f');

    const title = this.add.text(683, 140, 'TAK-T-K', {
      fontFamily: 'monospace',
      fontSize: '72px',
      fontStyle: 'bold',
      color: '#00f5ff',
      align: 'center',
      letterSpacing: 10
    }).setOrigin(0.5).setAlpha(0);

    const slogan = this.add.text(683, 210, 'MUEVE. ATACA. DOMINA.', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.5)',
      align: 'center',
      letterSpacing: 4
    }).setOrigin(0.5).setAlpha(0);

    const description = this.add.text(683, 265, 'UN JUEGO TÁCTICO POR TURNOS.\nDECISIONES PRECISAS. SIN MARGEN DE ERROR.', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: 'rgba(255, 255, 255, 0.25)',
      align: 'center',
      letterSpacing: 1,
      lineSpacing: 8
    }).setOrigin(0.5).setAlpha(0);

    const separator = this.add.rectangle(683, 300, 400, 1, colorToNumber('rgba(0, 245, 255, 0.2)'), 1).setAlpha(0);

    const modeLabel = this.add.text(683, 330, 'SELECCIONAR MODO', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: 'rgba(255,255,255,0.3)',
      align: 'center',
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0);

    const cards = [
      this.createModeCard({
        x: 371,
        y: 356,
        title: 'HOTSEAT',
        subtitle: 'DOS JUGADORES\nEN ESTA PANTALLA',
        normalBorder: 'rgba(0,245,255,0.3)',
        hoverBorder: 'rgba(0,245,255,0.8)',
        hoverFill: 'rgba(0,245,255,0.06)',
        titleColor: '#00f5ff',
        onClick: () => this.scene.start('SetupScene', { mode: 'pvp' })
      }),
      this.createModeCard({
        x: 595,
        y: 356,
        title: 'VS IA',
        subtitle: 'JUEGA CONTRA\nEL SISTEMA',
        normalBorder: 'rgba(255,0,229,0.3)',
        hoverBorder: 'rgba(255,0,229,0.8)',
        hoverFill: 'rgba(255,0,229,0.06)',
        titleColor: '#ff00e5',
        onClick: () => this.scene.start('SetupScene', { mode: 'pve' })
      }),
      this.createModeCard({
        x: 819,
        y: 356,
        title: 'REMOTO',
        subtitle: 'SALAS PRIVADAS\nPOR CODIGO',
        normalBorder: 'rgba(255,170,0,0.35)',
        hoverBorder: 'rgba(255,170,0,0.85)',
        hoverFill: 'rgba(255,170,0,0.08)',
        titleColor: '#ffaa00',
        onClick: () => this.scene.start('LobbyScene')
      })
    ];

    const cardTargets = cards.flatMap((card) => card.fadeTargets);
    for (const target of cardTargets) {
      target.setAlpha(0);
    }

    const secondaryButtons = this.createSecondaryButtons();
    for (const button of secondaryButtons) {
      button.text.setAlpha(0);
    }

    const versionText = this.add.text(1346, 748, 'v0.3.0 — FASE 3', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: 'rgba(255,255,255,0.15)'
    }).setOrigin(1, 1);

    this.tweens.add({
      targets: title,
      alpha: 1,
      delay: 0,
      duration: 800,
      onComplete: () => {
        this.tweens.add({
          targets: title,
          alpha: 0.85,
          duration: 2000,
          yoyo: true,
          repeat: -1
        });
      }
    });

    this.tweens.add({ targets: slogan, alpha: 1, delay: 400, duration: 600 });
    this.tweens.add({ targets: [description, separator], alpha: 1, delay: 700, duration: 500 });
    this.tweens.add({ targets: [modeLabel, ...cardTargets], alpha: 1, delay: 900, duration: 500 });
    this.tweens.add({
      targets: secondaryButtons.map((button) => button.text),
      alpha: 1,
      delay: 1100,
      duration: 400
    });

    versionText.setAlpha(0);
    this.tweens.add({ targets: versionText, alpha: 1, delay: 1200, duration: 400 });
  }

  createModeCard(config) {
    const width = 200;
    const height = 120;
    const radius = 4;
    const titleY = config.y + 40;
    const subtitleY = config.y + 65;
    const graphics = this.add.graphics();

    const title = this.add.text(config.x + width / 2, titleY, config.title, {
      fontFamily: 'monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      color: config.titleColor,
      align: 'center',
      letterSpacing: 2
    }).setOrigin(0.5);

    const subtitle = this.add.text(config.x + width / 2, subtitleY, config.subtitle, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: config.disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.3)',
      align: 'center',
      lineSpacing: 4,
      letterSpacing: 1
    }).setOrigin(0.5);

    drawRoundedCard(graphics, config.x, config.y, width, height, radius, config.normalBorder);

    const fadeTargets = [graphics, title, subtitle];

    if (!config.disabled) {
      const hitArea = this.add.zone(config.x + width / 2, config.y + height / 2, width, height);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerover', () => {
        drawRoundedCard(graphics, config.x, config.y, width, height, radius, config.hoverBorder, config.hoverFill);
      });
      hitArea.on('pointerout', () => {
        drawRoundedCard(graphics, config.x, config.y, width, height, radius, config.normalBorder);
      });
      hitArea.on('pointerdown', () => config.onClick?.());
      fadeTargets.push(hitArea);
      hitArea.setAlpha(0);
    } else {
      title.setAlpha(0.25);
      subtitle.setAlpha(0.25);
      if (config.showPhaseBadge) {
        const badgeBg = this.add.rectangle(config.x + width - 28, config.y + 14, 54, 18, colorToNumber('rgba(255,255,255,0.08)'), 1);
        const badgeText = this.add.text(config.x + width - 28, config.y + 14, 'FASE 3', {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: 'rgba(255,255,255,0.3)'
        }).setOrigin(0.5);
        fadeTargets.push(badgeBg, badgeText);
      }
    }

    return { fadeTargets };
  }

  createSecondaryButtons() {
    const labels = [
      { text: 'CÓMO JUGAR', scene: 'HowToPlayScene' },
      { text: 'HISTORIA', scene: 'StoryScene' },
      { text: 'CRÉDITOS', scene: 'CreditsScene' },
      { text: 'CONFIGURACIÓN', scene: 'SettingsScene' }
    ];

    const tempTexts = labels.map((item) => this.add.text(0, -1000, item.text, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: 'rgba(255,255,255,0.3)',
      letterSpacing: 2
    }));
    const widths = tempTexts.map((text) => text.width);
    for (const temp of tempTexts) {
      temp.destroy();
    }

    const gap = 40;
    const totalWidth = widths.reduce((acc, value) => acc + value, 0) + gap * (labels.length - 1);
    let currentX = 683 - totalWidth / 2;
    const buttons = [];

    for (let i = 0; i < labels.length; i += 1) {
      const item = labels[i];
      const width = widths[i];
      const centerX = currentX + width / 2;
      const text = this.add.text(centerX, 530, item.text, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 2
      }).setOrigin(0.5);

      const underline = this.add.rectangle(centerX, 540, width, 1, colorToNumber('rgba(255,255,255,0.3)'), 1).setVisible(false);

      text.setInteractive({ useHandCursor: true });
      text.on('pointerover', () => {
        text.setColor('rgba(255,255,255,0.7)');
        underline.setVisible(true);
      });
      text.on('pointerout', () => {
        text.setColor('rgba(255,255,255,0.3)');
        underline.setVisible(false);
      });
      text.on('pointerdown', () => this.scene.start(item.scene));

      buttons.push({ text, underline });
      currentX += width + gap;
    }

    return buttons;
  }
}
