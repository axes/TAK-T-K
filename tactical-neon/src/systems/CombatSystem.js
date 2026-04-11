import { MovementSystem } from './MovementSystem.js';

function cellKey(x, y) {
  return `${x},${y}`;
}

function isInBounds(x, y, grid) {
  const cols = grid.cols || grid.gridCols || 8;
  const rows = grid.rows || grid.gridRows || 8;
  return x >= 0 && y >= 0 && x < cols && y < rows;
}

function sign(value) {
  if (value > 0) {
    return 1;
  }

  if (value < 0) {
    return -1;
  }

  return 0;
}

function collectLineTargets(unit, range, units, grid, allowThroughUnits = true) {
  const targets = [];
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];

  for (const [dx, dy] of directions) {
    for (let step = 1; step <= range; step += 1) {
      const x = unit.position.x + dx * step;
      const y = unit.position.y + dy * step;

      if (!isInBounds(x, y, grid)) {
        break;
      }

      const target = units.find((candidate) => candidate.isAlive() && candidate.position && candidate.position.x === x && candidate.position.y === y);
      if (target) {
        if (target.owner !== unit.owner) {
          targets.push(target);
        }

        if (!allowThroughUnits || target) {
          break;
        }
      }
    }
  }

  return targets;
}

function collectAdjacentTargets(unit, units, grid) {
  const targets = [];
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
  ];

  for (const [dx, dy] of directions) {
    const x = unit.position.x + dx;
    const y = unit.position.y + dy;

    if (!isInBounds(x, y, grid)) {
      continue;
    }

    const target = units.find((candidate) => candidate.isAlive() && candidate.position && candidate.position.x === x && candidate.position.y === y);
    if (target && target.owner !== unit.owner) {
      targets.push(target);
    }
  }

  return targets;
}

function collectMysticSpecialTargets(unit, units, grid) {
  const targets = [];
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
  ];

  for (const [dx, dy] of directions) {
    for (let step = 1; step <= 2; step += 1) {
      const x = unit.position.x + dx * step;
      const y = unit.position.y + dy * step;

      if (!isInBounds(x, y, grid)) {
        break;
      }

      const target = units.find((candidate) => candidate.isAlive() && candidate.position && candidate.position.x === x && candidate.position.y === y);
      if (target && target.owner !== unit.owner) {
        targets.push(target);
      }
    }
  }

  return targets;
}

export class CombatSystem {
  static getValidTargets(unit, actionType, units, grid) {
    if (actionType === 'basic') {
      if (unit.key === 'VANGUARD') {
        return collectAdjacentTargets(unit, units, grid);
      }

      if (unit.key === 'SNIPER') {
        return collectLineTargets(unit, 3, units, grid);
      }

      if (unit.key === 'MYSTIC') {
        return collectAdjacentTargets(unit, units, grid);
      }
    }

    if (actionType === 'special') {
      if (unit.key === 'VANGUARD') {
        return collectAdjacentTargets(unit, units, grid);
      }

      if (unit.key === 'SNIPER') {
        return collectLineTargets(unit, 4, units, grid);
      }

      if (unit.key === 'MYSTIC') {
        return collectMysticSpecialTargets(unit, units, grid);
      }
    }

    return [];
  }

  static resolveAttack(attacker, target, actionType, units, grid) {
    // TODO[FASE-3]: sincronizar este resultado con red o replay determinista.
    const attack = actionType === 'special' ? attacker.specialAttack : attacker.basicAttack;
    if (actionType === 'special' && attacker.key === 'SNIPER' && attacker.movedThisTurn) {
      return { success: false, message: 'SNIPER MOVIO EN ESTE TURNO' };
    }

    if (attacker.ap < attack.cost) {
      return { success: false, message: 'PA INSUFICIENTES' };
    }

    const validTargets = this.getValidTargets(attacker, actionType, units, grid);
    if (!validTargets.includes(target)) {
      return { success: false, message: 'OBJETIVO INVALIDO' };
    }

    attacker.spendAp(attack.cost);

    const result = {
      success: true,
      damage: attack.damage,
      defeated: false,
      extra: ''
    };

    if (actionType === 'special' && attacker.key === 'SNIPER') {
      attacker.specialLockedMove = true;
    }

    if (actionType === 'special' && attacker.key === 'MYSTIC') {
      target.addNextTurnApPenalty(attack.apDrain);
      result.extra = 'Y -2 PA EN SU PROXIMO TURNO';
    }

    if (attack.damage > 0) {
      const defeated = target.takeDamage(attack.damage);
      result.defeated = defeated;

      if (actionType === 'special' && attacker.key === 'VANGUARD') {
        this.tryPushTarget(attacker, target, units, grid);
      }
    }

    return result;
  }

  static tryPushTarget(attacker, target, units, grid) {
    const dx = sign(target.position.x - attacker.position.x);
    const dy = sign(target.position.y - attacker.position.y);
    const pushX = target.position.x + dx;
    const pushY = target.position.y + dy;

    if (!isInBounds(pushX, pushY, grid)) {
      return false;
    }

    const occupied = MovementSystem.getOccupiedMap(units, target.id);
    if (occupied.has(cellKey(pushX, pushY))) {
      return false;
    }

    target.position = { x: pushX, y: pushY };
    return true;
  }
}
