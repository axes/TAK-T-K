export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  backgroundColor: '#0d0d0f',
  parent: 'app',
  cellSize: 80,
  gridCols: 8,
  gridRows: 8,
  gridWidth: 640,
  gridHeight: 640,

  // Compatibilidad temporal para SetupScene y BattleScene durante la migración
  // de las etapas siguientes. Los nuevos consumidores deben usar layout.js.
  gridLeft: 158,
  gridTop: 72
};

export const COLORS = {
  background: '#0d0d0f',
  cellA: '#111118',
  cellB: '#18181f',
  gridBorder: 'rgba(0, 245, 255, 0.12)',
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

export const TOUCH_TARGETS = {
  primary: { width: 80, height: 80 },
  secondary: { width: 80, height: 72 },
  compact: { width: 64, height: 48 }
};

export const DEBUG_LAYOUT = false;

const viteServerUrl = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_SERVER_URL
  : undefined;

export const SERVER_URL = viteServerUrl || 'http://localhost:3000';
