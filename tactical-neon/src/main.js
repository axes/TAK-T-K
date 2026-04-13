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

const integerZoom = Math.max(
  1,
  Math.floor(
    Math.min(
      window.innerWidth / GAME_CONFIG.width,
      window.innerHeight / GAME_CONFIG.height
    )
  )
);

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: GAME_CONFIG.parent,
  backgroundColor: GAME_CONFIG.backgroundColor,
  scene: [BootScene, MainScene, LobbyScene, SetupScene, BattleScene, HowToPlayScene, StoryScene, CreditsScene, SettingsScene],
  pixelArt: false,
  antialias: true,
  resolution: 1,
  render: {
    antialias: true,
    roundPixels: true
  },
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: integerZoom,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height
  }
};

new Phaser.Game(config);
