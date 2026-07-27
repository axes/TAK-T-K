import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { createDesktopTacticalLayout, createDesktopChrome } from '../ui/layout.js';
import { LayoutDebugOverlay } from '../ui/LayoutDebugOverlay.js';
import { GAME_CONFIG, COLORS, FONTS } from '../config.js';

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
    createDesktopChrome(this, this.layout, {
      drawLeftPanel: false,
      drawRightPanel: false,
      showLeftContent: false
    });




    // Titulo principal
    const title = this.add.text(mainCenterX, 156, 'TAK-T-K', {
      fontFamily: FONTS.TITLE,
      fontSize: '56px',
      fontStyle: 'bold',
      color: COLORS.playerOne,
      align: 'center',
      letterSpacing: 6
    }).setOrigin(0.5).setAlpha(0);

    // Glow neón permanente y sutil sobre el título
    const titleGlow = title.preFX.addGlow(colorToNumber(COLORS.playerOne), 2, 0, false, 0.1, 10);

    // Capas de glitch cromático (duplicados del texto, ocultos por defecto)
    const titleGlitchR = this.add.text(mainCenterX, 156, 'TAK-T-K', {
      fontFamily: FONTS.TITLE, fontSize: '56px', fontStyle: 'bold',
      color: '#ff2a5f', align: 'center', letterSpacing: 6
    }).setOrigin(0.5).setAlpha(0).setDepth(title.depth + 1);

    const titleGlitchB = this.add.text(mainCenterX, 156, 'TAK-T-K', {
      fontFamily: FONTS.TITLE, fontSize: '56px', fontStyle: 'bold',
      color: '#00f5ff', align: 'center', letterSpacing: 6
    }).setOrigin(0.5).setAlpha(0).setDepth(title.depth + 2);

    const triggerTitleGlitch = () => {
      const intensity = Phaser.Math.FloatBetween(0.4, 1); // varía la fuerza cada vez
      const offset = 2 + intensity * 3;

      this.tweens.killTweensOf([titleGlitchR, titleGlitchB, title]);
      titleGlitchR.setPosition(mainCenterX - offset, 156);
      titleGlitchB.setPosition(mainCenterX + offset, 156);

      this.tweens.chain({
        targets: titleGlitchR,
        tweens: [
          { alpha: 0.5 * intensity, duration: 30 },
          { alpha: 0, duration: 40 },
          { alpha: 0.35 * intensity, duration: 25 },
          { alpha: 0, duration: 50 }
        ]
      });
      this.tweens.chain({
        targets: titleGlitchB,
        tweens: [
          { alpha: 0.5 * intensity, duration: 25, delay: 15 },
          { alpha: 0, duration: 35 },
          { alpha: 0.3 * intensity, duration: 20 },
          { alpha: 0, duration: 50 }
        ]
      });

      // Flash breve del título base y el glow, proporcional a la intensidad
      this.tweens.add({
        targets: title,
        alpha: 1 - 0.15 * intensity,
        duration: 100,
        yoyo: true,
        repeat: 2
      });
      this.tweens.add({
        targets: titleGlow,
        outerStrength: 1 + intensity * 3,
        duration: 80,
        yoyo: true
      });
    };

    const scheduleNextGlitch = () => {
      this.time.delayedCall(Phaser.Math.Between(1000, 5000), () => {
        triggerTitleGlitch();
        scheduleNextGlitch();
      });
    };
    scheduleNextGlitch();


    // Subtítulo
    const slogan = this.add.text(mainCenterX, 204, 'JUEGO TÁCTICO POR TURNOS', {
      fontFamily: FONTS.TITLE,
      fontSize: '14px',
      color: COLORS.textPrimary,
      align: 'center',
      letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0);

    const separator = this.add.rectangle(mainCenterX, 260, 300, 1, colorToNumber(COLORS.grayBorder), 1).setAlpha(0);

    const modeLabel = this.add.text(mainCenterX, 310, 'SELECCIONAR MODO', {
      fontFamily: FONTS.GAME,
      fontSize: '16px',
      color: COLORS.textMuted,
      align: 'center',
      letterSpacing: 6
    }).setOrigin(0.5).setAlpha(0);

    const cards = [
      this.createModeCard({
        x: cardRegion.x,
        y: cardRegion.y,
        title: 'HOT-SEAT',
        subtitle: 'DOS JUGADORES\nEN ESTA PANTALLA',
        normalBorder: COLORS.grayBorder,
        hoverBorder: COLORS.stateHover,
        pressedBorder: COLORS.stateHover,
        hoverFill: COLORS.black,
        pressedFill: COLORS.black,
        titleColor: COLORS.textPrimary,
        onClick: () => this.scene.start('SetupScene', { mode: 'pvp' })
      }),
      this.createModeCard({
        x: cardRegion.x + 260,
        y: cardRegion.y,
        title: 'VS IA',
        subtitle: 'JUEGA CONTRA\nLA COMPUTADORA',
        normalBorder: COLORS.grayBorder,
        hoverBorder: COLORS.stateHover,
        pressedBorder: COLORS.stateHover,
        hoverFill: COLORS.black,
        pressedFill: COLORS.black,
        titleColor: COLORS.textPrimary,
        onClick: () => this.scene.start('SetupScene', { mode: 'pve' })
      }),
      this.createModeCard({
        x: cardRegion.x + 520,
        y: cardRegion.y,
        title: 'REMOTO',
        subtitle: 'CREA O ÚNETE\nA UNA SALA',
        normalBorder: COLORS.grayBorder,
        hoverBorder: COLORS.stateHover,
        pressedBorder: COLORS.stateHover,
        hoverFill: COLORS.black,
        pressedFill: COLORS.black,
        titleColor: COLORS.textPrimary,
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
      alpha: 1, delay: 0, duration: 800
    });
    this.tweens.add({
      targets: [slogan],
      alpha: 1, delay: 350, duration: 500
    });
    this.tweens.add({
      targets: [separator, modeLabel, ...cardTargets],
      alpha: 1, delay: 700, duration: 500
    });
    this.tweens.add({
      targets: secondaryButtons.map((button) => button.text),
      alpha: 1, delay: 950, duration: 400
    });
  }

  createModeCard(config) {
    const width = 240;
    const height = 138;
    const radius = 6;
    const centerX = config.x + width / 2;
    const graphics = this.add.graphics();
    const title = this.add.text(centerX, config.y + 44, config.title, {
      fontFamily: FONTS.TITLE, fontSize: '16px', fontStyle: 'bold', color: config.titleColor,
      align: 'center', letterSpacing: 2
    }).setOrigin(0.5);
    const subtitle = this.add.text(centerX, config.y + 83, config.subtitle, {
      fontFamily: FONTS.GAME, fontSize: '12px', color: 'rgba(255,255,255,0.38)',
      align: 'center', lineSpacing: 4, letterSpacing: 1
    }).setOrigin(0.5);


    const { layers: cornerLayers, glitchIn, glitchOut } = this.createChromaticCorners(config.x, config.y, width, height);

    const drawState = (borderColor, fillColor = null) => {
      drawRoundedCard(graphics, config.x, config.y, width, height, radius, borderColor, fillColor);
    };
    drawState(config.normalBorder);

    // Efectos
    const fadeTargets = [graphics, title, subtitle];

    if (!config.disabled) {
      const hitArea = this.add.zone(centerX, config.y + height / 2, width, height);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerover', () => {
        drawState(config.hoverBorder, config.hoverFill);
        glitchIn();
      });
      hitArea.on('pointerout', () => {
        drawState(config.normalBorder);
        glitchOut();
      });
      hitArea.on('pointerdown', () => {
        drawState(config.pressedBorder, config.pressedFill);
        this.time.delayedCall(120, () => config.onClick?.());
      });
      fadeTargets.push(hitArea);
      hitArea.setAlpha(0);
    }


    return { fadeTargets };
  }

  createChromaticCorners(x, y, width, height, cornerSize = 14, cornerThickness = 2, channelOffset = 2) {
    const cornersR = this.add.graphics().setAlpha(0);
    const cornersG = this.add.graphics().setAlpha(0);
    const cornersB = this.add.graphics().setAlpha(0);

    const drawChannel = (graphics, color, offsetX, offsetY) => {
      graphics.clear();
      graphics.lineStyle(cornerThickness, colorToNumber(color), 1);
      const cx = x + offsetX;
      const cy = y + offsetY;
      graphics.beginPath();
      graphics.moveTo(cx + width - cornerSize, cy);
      graphics.lineTo(cx + width, cy);
      graphics.lineTo(cx + width, cy + cornerSize);
      graphics.strokePath();
      graphics.beginPath();
      graphics.moveTo(cx, cy + height - cornerSize);
      graphics.lineTo(cx, cy + height);
      graphics.lineTo(cx + cornerSize, cy + height);
      graphics.strokePath();
    };

    drawChannel(cornersR, '#ff2a5f', -channelOffset, 0);
    drawChannel(cornersG, '#2be080', 0, 0);
    drawChannel(cornersB, '#00f5ff', channelOffset, 0);

    const layers = [cornersR, cornersG, cornersB];

    const glitchIn = () => {
      this.tweens.killTweensOf(layers);
      this.tweens.chain({
        targets: cornersR,
        tweens: [
          { alpha: 1, duration: 40 },
          { alpha: 0.2, duration: 30 },
          { alpha: 1, duration: 40 },
          { alpha: 0.4, duration: 25 },
          { alpha: 1, duration: 60 }
        ]
      });
      this.tweens.add({ targets: cornersG, alpha: 1, delay: 30, duration: 150 });
      this.tweens.add({ targets: cornersB, alpha: 1, delay: 60, duration: 150 });
    };

    const glitchOut = () => {
      this.tweens.killTweensOf(layers);
      this.tweens.add({ targets: layers, alpha: 0, duration: 100 });
    };

    return { layers, glitchIn, glitchOut };
  }

  createSecondaryButtons(region) {
    const labels = [
      { text: 'CÓMO JUGAR', scene: 'HowToPlayScene' },
      { text: 'HISTORIA', scene: 'StoryScene' },
      { text: 'CRÉDITOS', scene: 'CreditsScene' },
      { text: 'CONFIGURACIÓN', scene: 'SettingsScene' }
    ];
    const gap = 32;
    const textStyle = { fontFamily: FONTS.GAME, fontSize: '16px', color: COLORS.textPrimary, letterSpacing: 2 };
    const measuringTexts = labels.map((item) => this.add.text(0, -1000, item.text, textStyle));
    const widths = measuringTexts.map((text) => text.width);
    const textHeight = measuringTexts[0].height; // misma fuente/tamaño para todos, basta medir uno
    for (const text of measuringTexts) {
      text.destroy();
    }

    const totalWidth = widths.reduce((acc, value) => acc + value, 0) + gap * (labels.length - 1);
    let currentX = region.x + (region.width - totalWidth) / 2;
    const buttons = [];

    for (let i = 0; i < labels.length; i += 1) {
      const item = labels[i];
      const centerX = currentX + widths[i] / 2;

      const padding = { x: 10, y: 6 };
      const boxX = centerX - widths[i] / 2 - padding.x;
      const boxY = region.y - padding.y;
      const boxW = widths[i] + padding.x * 2;
      const boxH = textHeight + padding.y * 2; // antes: 24 + padding.y * 2
      const radius = 4;

      const background = this.add.graphics();
      const drawBackground = (fillColor = null) => {
        background.clear();
        if (fillColor) {
          background.fillStyle(colorToNumber(fillColor), 1);
          background.fillRoundedRect(boxX, boxY, boxW, boxH, radius);
        }
      };

      const text = this.add.text(centerX, region.y, item.text, textStyle).setOrigin(0.5, 0).setDepth(1);

      const { glitchIn, glitchOut } = this.createChromaticCorners(boxX, boxY, boxW, boxH, 8, 1, 1);

      text.setInteractive({ useHandCursor: true });
      text.on('pointerover', () => {
        text.setColor(COLORS.buttonActive);
        drawBackground(COLORS.black);
        glitchIn();
      });
      text.on('pointerout', () => {
        text.setColor(COLORS.textPrimary);
        drawBackground();
        glitchOut();
      });
      text.on('pointerdown', () => this.scene.start(item.scene));
      buttons.push({ text, background });
      currentX += widths[i] + gap;
    }

    return buttons;
  }
}
