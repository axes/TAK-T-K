import { GAME_CONFIG } from '../../tactical-neon/src/config.js';
import { MovementSystem } from '../../tactical-neon/src/systems/MovementSystem.js';
import { CombatSystem } from '../../tactical-neon/src/systems/CombatSystem.js';

function playerToOwner(playerId) {
  if (playerId === 'p1') {
    return 1;
  }

  if (playerId === 'p2') {
    return 2;
  }

  return null;
}

function findAliveUnitById(units, unitId) {
  return units.find((unit) => unit.id === unitId && unit.isAlive()) || null;
}

function findAliveUnitByCell(units, x, y) {
  return units.find((unit) => unit.isAlive() && unit.position && unit.position.x === x && unit.position.y === y) || null;
}

function startTurn(gameState, playerOwner) {
  gameState.currentPlayer = playerOwner;
  gameState.turnNumber += 1;
  gameState.selectedUnitId = null;
  gameState.selectedAction = 'preview';

  for (const unit of gameState.units) {
    if (unit.owner === playerOwner && unit.isAlive()) {
      unit.startTurn();
    }
  }
}

export class GameValidator {
  validateAction(gameState, action) {
    if (!gameState) {
      return { valid: false, reason: 'PARTIDA NO INICIALIZADA' };
    }

    if (gameState.winner) {
      return { valid: false, reason: 'PARTIDA FINALIZADA' };
    }

    const actorOwner = playerToOwner(action.playerId);
    if (!actorOwner) {
      return { valid: false, reason: 'JUGADOR INVALIDO' };
    }

    if (gameState.currentPlayer !== actorOwner) {
      return { valid: false, reason: 'NO ES TU TURNO' };
    }

    if (action.type === 'move') {
      const unit = findAliveUnitById(gameState.units, action.unitId);
      if (!unit) {
        return { valid: false, reason: 'UNIDAD INVALIDA' };
      }

      if (unit.owner !== actorOwner) {
        return { valid: false, reason: 'UNIDAD NO TE PERTENECE' };
      }

      if (!action.target || typeof action.target.x !== 'number' || typeof action.target.y !== 'number') {
        return { valid: false, reason: 'OBJETIVO INVALIDO' };
      }

      if (unit.specialLockedMove) {
        return { valid: false, reason: 'UNIDAD BLOQUEADA PARA MOVER' };
      }

      const reachable = MovementSystem.getReachableCells(unit, gameState.units, GAME_CONFIG);
      const match = reachable.find((cell) => cell.x === action.target.x && cell.y === action.target.y);
      if (!match) {
        return { valid: false, reason: 'MOVIMIENTO INVALIDO' };
      }

      return { valid: true };
    }

    if (action.type === 'attack') {
      const attacker = findAliveUnitById(gameState.units, action.unitId);
      if (!attacker) {
        return { valid: false, reason: 'ATACANTE INVALIDO' };
      }

      if (attacker.owner !== actorOwner) {
        return { valid: false, reason: 'UNIDAD NO TE PERTENECE' };
      }

      if (!action.target || typeof action.target.x !== 'number' || typeof action.target.y !== 'number') {
        return { valid: false, reason: 'OBJETIVO INVALIDO' };
      }

      if (action.attackType !== 'basic' && action.attackType !== 'special') {
        return { valid: false, reason: 'TIPO DE ATAQUE INVALIDO' };
      }

      const target = findAliveUnitByCell(gameState.units, action.target.x, action.target.y);
      if (!target || target.owner === attacker.owner) {
        return { valid: false, reason: 'OBJETIVO INVALIDO' };
      }

      const validTargets = CombatSystem.getValidTargets(attacker, action.attackType, gameState.units, GAME_CONFIG);
      if (!validTargets.includes(target)) {
        return { valid: false, reason: 'OBJETIVO FUERA DE RANGO' };
      }

      return { valid: true };
    }

    if (action.type === 'endturn' || action.type === 'surrender') {
      return { valid: true };
    }

    return { valid: false, reason: 'ACCION DESCONOCIDA' };
  }

  applyAction(gameState, action) {
    if (action.type === 'move') {
      const unit = findAliveUnitById(gameState.units, action.unitId);
      const reachable = MovementSystem.getReachableCells(unit, gameState.units, GAME_CONFIG);
      const match = reachable.find((cell) => cell.x === action.target.x && cell.y === action.target.y);
      const moved = MovementSystem.moveUnit(unit, action.target, gameState.units, GAME_CONFIG, match?.cost ?? null);
      if (!moved) {
        return { gameState, error: 'NO SE PUDO EJECUTAR EL MOVIMIENTO' };
      }

      const winner = this.checkVictory(gameState);
      if (winner) {
        gameState.winner = winner;
      }

      return {
        gameState,
        lastAction: {
          type: 'move',
          playerId: action.playerId,
          unitId: unit.id,
          target: { ...action.target },
          cost: match.cost
        }
      };
    }

    if (action.type === 'attack') {
      const attacker = findAliveUnitById(gameState.units, action.unitId);
      const target = findAliveUnitByCell(gameState.units, action.target.x, action.target.y);
      const result = CombatSystem.resolveAttack(attacker, target, action.attackType, gameState.units, GAME_CONFIG);
      if (!result.success) {
        return { gameState, error: result.message || 'ATAQUE INVALIDO' };
      }

      const winner = this.checkVictory(gameState);
      if (winner) {
        gameState.winner = winner;
      }

      return {
        gameState,
        lastAction: {
          type: 'attack',
          playerId: action.playerId,
          unitId: attacker.id,
          attackType: action.attackType,
          target: { ...action.target },
          result
        }
      };
    }

    if (action.type === 'endturn') {
      const nextPlayer = gameState.currentPlayer === 1 ? 2 : 1;
      startTurn(gameState, nextPlayer);
      return { gameState, lastAction: 'endturn' };
    }

    if (action.type === 'surrender') {
      gameState.winner = action.playerId === 'p1' ? 'p2' : 'p1';
      return { gameState, lastAction: { type: 'surrender', playerId: action.playerId } };
    }

    return { gameState, error: 'ACCION NO SOPORTADA' };
  }

  checkVictory(gameState) {
    const p1Alive = gameState.units.some((unit) => unit.owner === 1 && unit.isAlive());
    const p2Alive = gameState.units.some((unit) => unit.owner === 2 && unit.isAlive());

    if (p1Alive && p2Alive) {
      return null;
    }

    if (p1Alive) {
      return 'p1';
    }

    if (p2Alive) {
      return 'p2';
    }

    return null;
  }
}
