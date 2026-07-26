import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { createDesktopTacticalLayout, createDesktopChrome } from '../ui/layout.js';
import { LayoutDebugOverlay } from '../ui/LayoutDebugOverlay.js';
import { GAME_CONFIG, COLORS } from '../config.js';

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
    this.cameras.main.setBackgroundColor(GAME_CONFIG.backgroundColor);
    this.layout = createDesktopTacticalLayout();

    const mainCenterX = this.layout.main.x + this.layout.main.width / 2;
    const cover = { x: mainCenterX - 440, y: 112, width: 880, height: 520 };
    const cardRegion = { x: mainCenterX - 380, y: 342, width: 760, height: 138 };
    const navigationRegion = { x: mainCenterX - 300, y: 548, width: 600, height: 32 };
    this.layout.cover = cover;
    this.layout.coverCards = cardRegion;
    this.layout.coverNavigation = navigationRegion;

    this.layoutDebugOverlay = new LayoutDebugOverlay(this, this.layout);
    const desktopChrome = createDesktopChrome(this, this.layout, {
      drawLeftPanel: false,
      drawRightPanel: false,
      showLeftContent: false
    });
    desktopChrome.footerText.setText('TAK-T-K · 0.4.0-dev · COPYLEFT · DESARROLLO ACTIVO · CLIENTE PHASER');

    this.add.text(this.layout.headerLeft.x + 18, this.layout.headerLeft.y + 36, 'TAK-T-K', {
      fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: COLORS.text, letterSpacing: 2
    }).setOrigin(0, 0.5).setDepth(12);
    this.add.text(this.layout.headerCenter.x + this.layout.headerCenter.width / 2, this.layout.headerCenter.y + 36, 'MUEVE · ATACA · DOMINA', {
      fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: 2
    }).setOrigin(0.5).setDepth(12);

    const title = this.add.text(mainCenterX, 156, 'TAK-T-K', {
      fontFamily: 'monospace',
      fontSize: '38px',
      fontStyle: 'bold',
      color: COLORS.player1,
      align: 'center',
      letterSpacing: 6
    }).setOrigin(0.5).setAlpha(0);

    const slogan = this.add.text(mainCenterX, 204, 'MUEVE. ATACA. DOMINA.', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: COLORS.text,
      align: 'center',
      letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0);

    const description = this.add.text(mainCenterX, 242, 'UN JUEGO TÁCTICO POR TURNOS', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: 'rgba(255,255,255,0.45)',
      align: 'center',
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0);

    const separator = this.add.rectangle(mainCenterX, 276, 420, 1, colorToNumber('rgba(0,245,255,0.25)'), 1).setAlpha(0);

    const modeLabel = this.add.text(mainCenterX, 310, 'SELECCIONAR MODO', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: 'rgba(255,255,255,0.5)',
      align: 'center',
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0);

    const cards = [
      this.createModeCard({
        x: cardRegion.x,
        y: cardRegion.y,
        title: 'HOT-SEAT',
        subtitle: 'DOS JUGADORES\nEN ESTA PANTALLA',
        normalBorder: 'rgba(0,245,255,0.3)',
        hoverBorder: 'rgba(0,245,255,0.8)',
        pressedBorder: 'rgba(0,245,255,1)',
        hoverFill: 'rgba(0,245,255,0.06)',
        pressedFill: 'rgba(0,245,255,0.12)',
        titleColor: COLORS.player1,
        onClick: () => this.scene.start('SetupScene', { mode: 'pvp' })
      }),
      this.createModeCard({
        x: cardRegion.x + 260,
        y: cardRegion.y,
        title: 'VS IA',
        subtitle: 'JUEGA CONTRA\nLA COMPUTADORA',
        normalBorder: 'rgba(255,0,229,0.3)',
        hoverBorder: 'rgba(255,0,229,0.8)',
        pressedBorder: 'rgba(255,0,229,1)',
        hoverFill: 'rgba(255,0,229,0.06)',
        pressedFill: 'rgba(255,0,229,0.12)',
        titleColor: COLORS.player2,
        onClick: () => this.scene.start('SetupScene', { mode: 'pve' })
      }),
      this.createModeCard({
        x: cardRegion.x + 520,
        y: cardRegion.y,
        title: 'REMOTO',
        subtitle: 'CREA O ÚNETE\nA UNA SALA',
        normalBorder: 'rgba(255,170,0,0.35)',
        hoverBorder: 'rgba(255,170,0,0.85)',
        pressedBorder: 'rgba(255,170,0,1)',
        hoverFill: 'rgba(255,170,0,0.08)',
        pressedFill: 'rgba(255,170,0,0.14)',
        titleColor: '#ffaa00',
        onClick: () => this.scene.start('LobbyScene')
      })
    ];

    const cardTargets = cards.flatMap((card) => card.fadeTargets);
    for (const target of cardTargets) {
      target.setAlpha(0);
    }

    const secondaryButtons = this.createSecondaryButtons(navigationRegion);
    for (const button of secondaryButtons) {
      button.text.setAlpha(0);
    }

    this.tweens.add({
      targets: title,
      alpha: 1,
      delay: 0,
      duration: 800,
      onComplete: () => {
        this.tweens.add({ targets: title, alpha: 0.85, duration: 2000, yoyo: true, repeat: -1 });
      }
    });
    this.tweens.add({ targets: [slogan, description], alpha: 1, delay: 350, duration: 500 });
    this.tweens.add({ targets: [separator, modeLabel, ...cardTargets], alpha: 1, delay: 700, duration: 500 });
    this.tweens.add({ targets: secondaryButtons.map((button) => button.text), alpha: 1, delay: 950, duration: 400 });
  }

  createModeCard(config) {
    const width = 240;
    const height = 138;
    const radius = 4;
    const centerX = config.x + width / 2;
    const graphics = this.add.graphics();
    const title = this.add.text(centerX, config.y + 44, config.title, {
      fontFamily: 'monospace', fontSize: '13px', fontStyle: 'bold', color: config.titleColor,
      align: 'center', letterSpacing: 2
    }).setOrigin(0.5);
    const subtitle = this.add.text(centerX, config.y + 83, config.subtitle, {
      fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.38)',
      align: 'center', lineSpacing: 4, letterSpacing: 1
    }).setOrigin(0.5);

    const drawState = (borderColor, fillColor = null) => {
      drawRoundedCard(graphics, config.x, config.y, width, height, radius, borderColor, fillColor);
    };
    drawState(config.normalBorder);

    const fadeTargets = [graphics, title, subtitle];
    if (!config.disabled) {
      const hitArea = this.add.zone(centerX, config.y + height / 2, width, height);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerover', () => drawState(config.hoverBorder, config.hoverFill));
      hitArea.on('pointerout', () => drawState(config.normalBorder));
      hitArea.on('pointerdown', () => {
        drawState(config.pressedBorder, config.pressedFill);
        config.onClick?.();
      });
      fadeTargets.push(hitArea);
      hitArea.setAlpha(0);
    }

    return { fadeTargets };
  }

  createSecondaryButtons(region) {
    const labels = [
      { text: 'CÓMO JUGAR', scene: 'HowToPlayScene' },
      { text: 'HISTORIA', scene: 'StoryScene' },
      { text: 'CRÉDITOS', scene: 'CreditsScene' },
      { text: 'CONFIGURACIÓN', scene: 'SettingsScene' }
    ];
    const gap = 32;
    const textStyle = { fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.38)', letterSpacing: 2 };
    const measuringTexts = labels.map((item) => this.add.text(0, -1000, item.text, textStyle));
    const widths = measuringTexts.map((text) => text.width);
    for (const text of measuringTexts) {
      text.destroy();
    }

    const totalWidth = widths.reduce((acc, value) => acc + value, 0) + gap * (labels.length - 1);
    let currentX = region.x + (region.width - totalWidth) / 2;
    const buttons = [];

    for (let i = 0; i < labels.length; i += 1) {
      const item = labels[i];
      const centerX = currentX + widths[i] / 2;
      const text = this.add.text(centerX, region.y, item.text, textStyle).setOrigin(0.5, 0);
      const underline = this.add.rectangle(centerX, region.y + 18, widths[i], 1, colorToNumber('rgba(255,255,255,0.5)'), 1).setVisible(false);
      text.setInteractive({ useHandCursor: true });
      text.on('pointerover', () => {
        text.setColor('rgba(255,255,255,0.8)');
        underline.setVisible(true);
      });
      text.on('pointerout', () => {
        text.setColor('rgba(255,255,255,0.38)');
        underline.setVisible(false);
      });
      text.on('pointerdown', () => this.scene.start(item.scene));
      buttons.push({ text, underline });
      currentX += widths[i] + gap;
    }

    return buttons;
  }
}
