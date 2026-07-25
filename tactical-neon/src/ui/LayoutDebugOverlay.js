import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { DEBUG_LAYOUT } from '../config.js';

const REGIONS = [
  { key: 'canvas', label: 'CANVAS', color: 0xffffff },
  { key: 'header', label: 'HEADER', color: 0x00f5ff },
  { key: 'headerLeft', label: 'HEADER LEFT', color: 0x66ccff },
  { key: 'headerCenter', label: 'HEADER CENTER', color: 0x39ff14 },
  { key: 'headerRight', label: 'HEADER RIGHT', color: 0xffcc66 },
  { key: 'main', label: 'MAIN', color: 0xffaa00 },
  { key: 'leftSidebar', label: 'LEFT SIDEBAR', color: 0xcc66ff },
  { key: 'leftSidebar.content', label: 'LEFT CONTENT', color: 0xdd99ff },
  { key: 'boardArea', label: 'BOARD AREA', color: 0x39ff14 },
  { key: 'board', label: 'BOARD', color: 0xff3366 },
  { key: 'rightSidebar', label: 'RIGHT SIDEBAR', color: 0xff00e5 },
  { key: 'rightSidebar.content', label: 'RIGHT CONTENT', color: 0xff66cc },
  { key: 'rightSidebar.unitInfo', label: 'UNIT INFO', color: 0x66ccff },
  { key: 'rightSidebar.actions', label: 'ACTIONS', color: 0xffcc66 },
  { key: 'rightSidebar.description', label: 'DESCRIPTION', color: 0xcc66ff },
  { key: 'rightSidebar.controls', label: 'CONTROLS', color: 0x66ff99 },
  { key: 'rightSidebar.endTurn', label: 'END TURN', color: 0xff6699 },
  { key: 'rightSidebar.surrenderButton', label: 'SURRENDER', color: 0xff0033 },
  { key: 'footer', label: 'FOOTER', color: 0xffffff }
];

export class LayoutDebugOverlay {
  constructor(scene, layout) {
    this.scene = scene;
    this.layout = layout;
    this.visible = DEBUG_LAYOUT;
    this.graphics = scene.add.graphics().setDepth(1000);
    this.labels = [];
    this.guideLabels = [];
    this.statsLabel = null;

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
        this.graphics.fillStyle(region.color, region.key === 'canvas' ? 0.01 : 0.07);
        this.graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
        this.graphics.lineStyle(region.key === 'canvas' ? 2 : 1.5, region.color, 0.9);
        this.graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
      }

      const labelY = Math.min(rect.height === 0 ? this.layout.canvas.height - 22 : rect.y + 6, this.layout.canvas.height - 38);
      const labelX = Math.max(this.layout.canvas.x + 4, Math.min(rect.x + 6, this.layout.canvas.x + this.layout.canvas.width - 150));

      const label = this.scene.add.text(labelX, labelY, this.formatLabel(region.label, rect), {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: `#${region.color.toString(16).padStart(6, '0')}`,
        backgroundColor: 'rgba(0,0,0,0.72)',
        padding: { left: 4, right: 4, top: 3, bottom: 3 },
        lineSpacing: 2
      }).setDepth(1001);

      this.labels.push(label);
    }

    const centerX = this.layout.canvas.x + this.layout.canvas.width / 2;
    const centerY = this.layout.canvas.y + this.layout.canvas.height / 2;

    this.graphics.lineStyle(1, 0xffffff, 0.5);
    this.graphics.lineBetween(centerX, this.layout.canvas.y, centerX, this.layout.canvas.y + this.layout.canvas.height);
    this.graphics.lineBetween(this.layout.canvas.x, centerY, this.layout.canvas.x + this.layout.canvas.width, centerY);

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

    const canvas = this.scene.game.canvas;
    const rect = canvas?.getBoundingClientRect();
    const scaleX = rect ? rect.width / this.layout.canvas.width : 0;
    const scaleY = rect ? rect.height / this.layout.canvas.height : 0;
    const expectedLeft = rect ? Math.max(0, (window.innerWidth - rect.width) / 2) : 0;
    const expectedTop = rect ? Math.max(0, (window.innerHeight - rect.height) / 2) : 0;
    this.statsLabel = this.scene.add.text(8, 8, [
      `GAME ${this.layout.canvas.width}x${this.layout.canvas.height}`,
      `CSS ${rect ? `${Math.round(rect.width)}x${Math.round(rect.height)}` : 'N/A'}`,
      `SCALE ${scaleX.toFixed(4)}x${scaleY.toFixed(4)}`,
      `WINDOW ${window.innerWidth}x${window.innerHeight} DPR ${window.devicePixelRatio || 1}`,
      `LEFT ${rect ? Math.round(rect.left) : 'N/A'} EXP ${Math.round(expectedLeft)} Δ ${rect ? Math.round(rect.left - expectedLeft) : 'N/A'}`,
      `TOP ${rect ? Math.round(rect.top) : 'N/A'} EXP ${Math.round(expectedTop)} Δ ${rect ? Math.round(rect.top - expectedTop) : 'N/A'}`
    ].join('\n'), {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.78)', padding: { left: 5, right: 5, top: 4, bottom: 4 }, lineSpacing: 1
    }).setDepth(1002);
    this.guideLabels.push(this.statsLabel);
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
    this.statsLabel = null;
  }
}
