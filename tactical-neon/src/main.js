import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { GAME_CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MainScene } from './scenes/MainScene.js';
import { SetupScene } from './scenes/SetupScene.js';
import { BattleScene } from './scenes/BattleScene.js';
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
  scene: [BootScene, MainScene, SetupScene, BattleScene, HowToPlayScene, StoryScene, CreditsScene, SettingsScene],
  pixelArt: false,
  antialias: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height
  }
};

new Phaser.Game(config);
