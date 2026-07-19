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
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  render: {
    antialias: true,
    roundPixels: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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

  console.table({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    canvasWidth: canvas?.width,
    canvasHeight: canvas?.height,
    canvasRect: rect ? `${rect.x},${rect.y} ${rect.width}x${rect.height}` : 'N/A',
    displaySize: displaySize ? `${displaySize.width}x${displaySize.height}` : 'N/A',
    effectiveScale: effectiveScale ? `${effectiveScale.x.toFixed(4)}x${effectiveScale.y.toFixed(4)}` : 'N/A'
  });
}, 250);
