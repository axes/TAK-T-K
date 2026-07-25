import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

export function createUnitGlyph(scene, unit, x, y) {
  const color = Phaser.Display.Color.HexStringToColor('#ffffff').color;

  if (unit.key === 'VANGUARD') {
    const square = scene.add.rectangle(x, y, 14, 14, color, 1);
    return [square];
  }

  if (unit.key === 'SNIPER') {
    const circle = scene.add.circle(x, y, 7, color, 1);
    return [circle];
  }

  const diamond = scene.add.rectangle(x, y, 12, 12, color, 1).setAngle(45);
  return [diamond];
}
