export const GAME_CONFIG = {
  width: 1440,
  height: 810,
  backgroundColor: '#0a0b10',
  parent: 'game-container',
  cellSize: 90,
  gridCols: 8,
  gridRows: 8,
  gridWidth: 720,
  gridHeight: 720
};

// Configuración de familias de fuentes
export const FONTS = {
  TITLE: 'Orbitron, sans-serif',
  GAME: 'Rajdhani, sans-serif',
  BODY: '"Plus Jakarta Sans", sans-serif'
};

export const FOOTER_URL = 'https://github.com/axes/tak-t-k';
export const FOOTER_TEXT = '0.4.0-dev ··· by Axes ··· 2026';

// Gris = estado por defecto. Neón = solo activo/seleccionable/status.
export const COLORS = {
  // Fondo base general
  bgBase: '#0a0b10',

  // Escala de grises — uso por defecto en UI estructural
  grayBorder: '#2a2d38',
  grayText: '#8b949e',
  grayTextDim: '#5c6270',
  grayPanelBg: '#111420',

  // Tablero / Celdas
  boardCellA: '#12141d',
  boardCellB: '#171a26',
  boardGridBorder: 'rgba(0, 245, 255, 0.08)',

  // Interacción y Estados
  stateHover: '#00f5ff40',
  stateHoverBorder: '#00f5ff',
  stateMove: '#2be080',
  stateAttack: '#ff2a5f',

  // Jugadores
  playerOne: '#00e5ff',
  playerTwo: '#f626a8',

  // Texto
  textPrimary: '#e6edf3',
  textMuted: '#8b949e',

  // UI / Paneles
  panelBg: '#111420',
  panelBorder: 'rgba(0, 245, 255, 0.20)',

  // Botones
  buttonBase: '#1a1f2c',
  buttonHover: '#252d40',
  buttonActive: '#00e5ff',
  buttonDisabled: '#0e1117',

  // Colores
  black : '#000',

};

export const PLAYER_INFO = {
  1: { name: 'JUGADOR 1', color: COLORS.playerOne },
  2: { name: 'JUGADOR 2', color: COLORS.playerTwo }
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
