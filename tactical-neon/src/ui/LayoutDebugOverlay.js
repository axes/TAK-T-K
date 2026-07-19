import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { DEBUG_LAYOUT } from '../config.js';

const REGIONS = [
  { key: 'viewport', label: 'VIEWPORT', color: 0xffffff },
  { key: 'header', label: 'HEADER', color: 0x00f5ff },
  { key: 'main', label: 'MAIN', color: 0xffaa00 },
  { key: 'contentGroup', label: 'CONTENT GROUP', color: 0x39ff14 },
  { key: 'board', label: 'BOARD', color: 0xff3366 },
  { key: 'sidebar', label: 'SIDEBAR', color: 0xff00e5 },
  { key: 'sidebar.content', label: 'SIDEBAR.CONTENT', color: 0xff66cc },
  { key: 'sidebar.unitInfo', label: 'SIDEBAR.UNIT INFO', color: 0x66ccff },
  { key: 'sidebar.actions', label: 'SIDEBAR.ACTIONS', color: 0xffcc66 },
  { key: 'sidebar.description', label: 'SIDEBAR.DESCRIPTION', color: 0xcc66ff },
  { key: 'sidebar.endTurn', label: 'SIDEBAR.END TURN', color: 0x66ff99 },
  { key: 'sidebar.surrender', label: 'SIDEBAR.SURRENDER', color: 0xff6699 },
  { key: 'sidebar.surrenderButton', label: 'SIDEBAR.SURRENDER BUTTON', color: 0xff0033 }
];

export class LayoutDebugOverlay {
  constructor(scene, layout) {
    this.scene = scene;
    this.layout = layout;
    this.visible = DEBUG_LAYOUT;
    this.graphics = scene.add.graphics().setDepth(1000);
    this.labels = [];
    this.guideLabels = [];

    this.draw();
    this.setVisible(this.visible);

    if (scene.input.keyboard) {
      scene.input.keyboard.on('keydown-F2', this.toggle, this);
    }

    scene.events.once('shutdown', this.destroy, this);
    scene.events.once('destroy', this.destroy, this);
  }

  draw() {
    this.graphics.clear();

    for (const region of REGIONS) {
      const rect = region.key.split('.').reduce((value, key) => value?.[key], this.layout);
      if (!rect) {
        continue;
      }

      if (rect.width > 0 && rect.height > 0) {
        this.graphics.fillStyle(region.color, region.key === 'viewport' ? 0.01 : 0.07);
        this.graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
        this.graphics.lineStyle(region.key === 'viewport' ? 2 : 1.5, region.color, 0.9);
        this.graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
      }

      const labelY = rect.height === 0 ? this.layout.viewport.y + this.layout.viewport.height - 22 : rect.y + 6;

      const label = this.scene.add.text(rect.x + 6, labelY, this.formatLabel(region.label, rect), {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: `#${region.color.toString(16).padStart(6, '0')}`,
        backgroundColor: 'rgba(0,0,0,0.72)',
        padding: { left: 4, right: 4, top: 3, bottom: 3 },
        lineSpacing: 2
      }).setDepth(1001);

      this.labels.push(label);
    }

    const centerX = this.layout.viewport.x + this.layout.viewport.width / 2;
    const centerY = this.layout.viewport.y + this.layout.viewport.height / 2;

    this.graphics.lineStyle(1, 0xffffff, 0.5);
    this.graphics.lineBetween(centerX, this.layout.viewport.y, centerX, this.layout.viewport.y + this.layout.viewport.height);
    this.graphics.lineBetween(this.layout.viewport.x, centerY, this.layout.viewport.x + this.layout.viewport.width, centerY);

    const verticalGuide = this.scene.add.text(centerX + 6, 8, `CENTER X ${centerX}`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.72)',
      padding: { left: 4, right: 4, top: 3, bottom: 3 }
    }).setDepth(1001);
    const horizontalGuide = this.scene.add.text(8, centerY + 6, `CENTER Y ${centerY}`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.72)',
      padding: { left: 4, right: 4, top: 3, bottom: 3 }
    }).setDepth(1001);

    this.guideLabels.push(verticalGuide, horizontalGuide);
  }

  formatLabel(name, rect) {
    return `${name}\nx:${rect.x} y:${rect.y}\nw:${rect.width} h:${rect.height}`;
  }

  toggle() {
    this.setVisible(!this.visible);
  }

  setVisible(visible) {
    this.visible = visible;
    this.graphics.setVisible(visible);
    for (const label of [...this.labels, ...this.guideLabels]) {
      label.setVisible(visible);
    }
  }

  destroy() {
    this.scene.input.keyboard?.off('keydown-F2', this.toggle, this);
    this.graphics.destroy();
    for (const label of [...this.labels, ...this.guideLabels]) {
      label.destroy();
    }
    this.labels = [];
    this.guideLabels = [];
  }
}
