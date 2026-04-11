export const GAME_CONFIG = {
  width: 1024,
  height: 900,
  backgroundColor: '#0d0d0f',
  parent: 'app',
  cellSize: 72,
  gridCols: 8,
  gridRows: 8,
  gridWidth: 576,
  gridHeight: 576,
  gridLeft: 40,
  gridTop: 132
};

export const COLORS = {
  background: '#0d0d0f',
  cellA: '#111118',
  cellB: '#18181f',
  gridBorder: 'rgba(0, 245, 255, 0.15)',
  hover: '#00f5ff',
  move: '#39ff14',
  attack: '#ff3366',
  player1: '#00f5ff',
  player2: '#ff00e5',
  text: '#ffffff',
  panel: '#111118',
  panelBorder: 'rgba(0, 245, 255, 0.25)',
  button: '#111118',
  buttonActive: '#1a1a24',
  buttonDisabled: '#0a0a0d'
};

export const PLAYER_INFO = {
  1: { name: 'JUGADOR 1', color: COLORS.player1 },
  2: { name: 'JUGADOR 2', color: COLORS.player2 }
};

export const UNIT_TEMPLATES = {
  VANGUARD: {
    key: 'VANGUARD',
    name: 'VANGUARD',
    symbol: 'V',
    maxHp: 12,
    maxAp: 3,
    basicAttack: { damage: 3, range: 1, cost: 1, shape: 'adjacent' },
    specialAttack: { damage: 5, range: 1, cost: 2, shape: 'adjacent', push: true }
  },
  SNIPER: {
    key: 'SNIPER',
    name: 'SNIPER',
    symbol: 'S',
    maxHp: 7,
    maxAp: 3,
    basicAttack: { damage: 2, range: 3, cost: 1, shape: 'line' },
    specialAttack: { damage: 6, range: 4, cost: 3, shape: 'line', noMoveAfter: true }
  },
  MYSTIC: {
    key: 'MYSTIC',
    name: 'MYSTIC',
    symbol: 'M',
    maxHp: 9,
    maxAp: 3,
    basicAttack: { damage: 2, range: 1, cost: 1, shape: 'adjacentAoE' },
    specialAttack: { damage: 0, range: 2, cost: 2, shape: 'line', apDrain: 2 }
  }
};

export const SETUP_ROWS = {
  1: [6, 7],
  2: [0, 1]
};

export const UNIT_ORDER = ['VANGUARD', 'SNIPER', 'MYSTIC'];

export const HUD_LAYOUT = {
  topY: 24,
  leftX: 24,
  rightX: 680,
  bottomPanelY: 816
};
