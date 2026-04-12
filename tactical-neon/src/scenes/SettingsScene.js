import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

function createBackButton(scene) {
  const back = scene.add.text(60, 708, '← VOLVER', {
    fontFamily: 'monospace',
    fontSize: '10px',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2
  }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

  back.on('pointerover', () => back.setColor('#00f5ff'));
  back.on('pointerout', () => back.setColor('rgba(255,255,255,0.3)'));
  back.on('pointerdown', () => scene.scene.start('MainScene'));
}

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d0d0f');

    this.add.text(683, 120, 'CONFIGURACIÓN', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.5)',
      letterSpacing: 4
    }).setOrigin(0.5);

    this.add.text(683, 200, 'CONTENIDO PRÓXIMAMENTE', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: 'rgba(255,255,255,0.25)',
      align: 'center'
    }).setOrigin(0.5);

    createBackButton(this);
  }
}
