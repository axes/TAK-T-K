import { UNIT_ORDER, UNIT_TEMPLATES } from './config.js';
import { Unit } from './entities/Unit.js';

export function createGameState() {
  const startingUnits = [];

  for (const owner of [1, 2]) {
    for (const key of UNIT_ORDER) {
      startingUnits.push(new Unit(UNIT_TEMPLATES[key], owner));
    }
  }

  return {
    phase: 'setup',
    setupPlayer: 1,
    currentPlayer: 1,
    turnNumber: 1,
    winner: null,
    selectedUnitId: null,
    selectedAction: 'preview',
    setupPlacedByPlayer: {
      1: [],
      2: []
    },
    units: startingUnits,
    log: []
  };
}
