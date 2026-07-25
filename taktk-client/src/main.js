import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { GAME_CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MainScene } from './scenes/MainScene.js';
import { SetupScene } from './scenes/SetupScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { LobbyScene } from './scenes/LobbyScene.js';
import { HowToPlayScene } from './scenes/HowToPlayScene.js';
import { StoryScene } from './scenes/StoryScene.js';
import { CreditsScene } from './scenes/CreditsScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: GAME_CONFIG.parent,
  backgroundColor: GAME_CONFIG.backgroundColor,
  scene: [BootScene, MainScene, LobbyScene, SetupScene, BattleScene, HowToPlayScene, StoryScene, CreditsScene, SettingsScene],
  pixelArt: false,
  antialias: true,
  // El canvas desktop se mantiene 1:1 también en pantallas con DPR alto.
  // Phaser sigue dibujando con antialias, pero no introduce un segundo tamaño
  // físico que pueda confundirse con el tamaño CSS del canvas.
  resolution: 1,
  render: {
    antialias: true,
    roundPixels: true
  },
  scale: {
    mode: Phaser.Scale.NONE,
    // El centrado exterior lo controla exclusivamente #game-container.
    // Evita que Phaser agregue márgenes propios al canvas.
    autoCenter: Phaser.Scale.NO_CENTER,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height
  }
};

const game = new Phaser.Game(config);

// Diagnóstico temporal para validar el tamaño real del canvas y la nitidez.
window.setTimeout(() => {
  const canvas = game.canvas;
  const rect = canvas?.getBoundingClientRect();
  const displaySize = game.scale.displaySize;
  const effectiveScale = rect ? {
    x: rect.width / GAME_CONFIG.width,
    y: rect.height / GAME_CONFIG.height
  } : null;
  const expectedLeft = rect ? Math.max(0, (window.innerWidth - rect.width) / 2) : null;
  const expectedTop = rect ? Math.max(0, (window.innerHeight - rect.height) / 2) : null;

  console.table({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    canvasWidth: canvas?.width,
    canvasHeight: canvas?.height,
    canvasRect: rect ? `${rect.x},${rect.y} ${rect.width}x${rect.height}` : 'N/A',
    expectedLeft: expectedLeft === null ? 'N/A' : expectedLeft,
    horizontalDifference: rect ? rect.left - expectedLeft : 'N/A',
    expectedTop: expectedTop === null ? 'N/A' : expectedTop,
    verticalDifference: rect ? rect.top - expectedTop : 'N/A',
    displaySize: displaySize ? `${displaySize.width}x${displaySize.height}` : 'N/A',
    effectiveScale: effectiveScale ? `${effectiveScale.x.toFixed(4)}x${effectiveScale.y.toFixed(4)}` : 'N/A',
    cssScaleX: rect ? (rect.width / GAME_CONFIG.width).toFixed(4) : 'N/A',
    cssScaleY: rect ? (rect.height / GAME_CONFIG.height).toFixed(4) : 'N/A'
  });
}, 250);
