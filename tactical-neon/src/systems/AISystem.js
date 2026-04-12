import { GAME_CONFIG } from '../config.js';
import { TurnSystem } from './TurnSystem.js';

export class AISystem {
  constructor(gameState, movementSystem, combatSystem, scene) {
    this.gameState = gameState;
    this.movementSystem = movementSystem;
    this.combatSystem = combatSystem;
    this.scene = scene;
    this.turnSystem = new TurnSystem(gameState);
    this.onAction = null;
  }

  async executeTurn() {
    while (this.turnSystem.activePlayerHasActions() && !this.gameState.winner) {
      const units = this.turnSystem.getUnitsForPlayer(2).filter((unit) => unit.ap > 0);
      if (units.length === 0) {
        break;
      }

      let actedThisPass = false;

      for (const unit of units) {
        while (unit.ap > 0 && !this.gameState.winner) {
          const action = this._getBestAction(unit);
          if (!action) {
            break;
          }

          if (action.type === 'move') {
            const moved = this.movementSystem.moveUnit(unit, action.targetCell, this.gameState.units, GAME_CONFIG);
            if (!moved) {
              break;
            }

            actedThisPass = true;
            this.onAction?.({
              type: 'move',
              unit,
              to: action.targetCell
            });
            await this._wait(600);
            continue;
          }

          const result = this.combatSystem.resolveAttack(unit, action.target, action.attackType, this.gameState.units, GAME_CONFIG);
          if (!result.success) {
            break;
          }

          actedThisPass = true;
          this.turnSystem.checkVictory();
          this.onAction?.({
            type: 'attack',
            unit,
            target: action.target,
            attackType: action.attackType,
            result
          });
          await this._wait(600);
        }
      }

      if (!actedThisPass) {
        break;
      }
    }
  }

  _getBestAction(unit) {
    const attack = this._evaluateAttack(unit);
    if (attack) {
      return attack;
    }

    const move = this._evaluateMove(unit);
    if (move) {
      return move;
    }

    return null;
  }

  _evaluateAttack(unit) {
    const options = [];
    const basicTargets = this.combatSystem.getValidTargets(unit, 'basic', this.gameState.units, GAME_CONFIG);
    const specialTargets = this.combatSystem.getValidTargets(unit, 'special', this.gameState.units, GAME_CONFIG);

    if (unit.ap >= unit.basicAttack.cost) {
      for (const target of basicTargets) {
        options.push({
          type: 'attack',
          attackType: 'basic',
          target,
          damage: unit.basicAttack.damage,
          cost: unit.basicAttack.cost
        });
      }
    }

    const canUseSpecial = unit.ap >= unit.specialAttack.cost && !(unit.key === 'SNIPER' && unit.movedThisTurn);
    if (canUseSpecial) {
      for (const target of specialTargets) {
        options.push({
          type: 'attack',
          attackType: 'special',
          target,
          damage: unit.specialAttack.damage,
          cost: unit.specialAttack.cost
        });
      }
    }

    if (options.length === 0) {
      return null;
    }

    const killOptions = options.filter((option) => option.damage >= option.target.hp);
    if (killOptions.length > 0) {
      const basicKills = killOptions.filter((option) => option.attackType === 'basic');
      if (basicKills.length > 0) {
        basicKills.sort((a, b) => a.target.hp - b.target.hp || b.damage - a.damage);
        return basicKills[0];
      }

      killOptions.sort((a, b) => b.damage - a.damage || a.target.hp - b.target.hp);
      return killOptions[0];
    }

    if (unit.key === 'MYSTIC') {
      const debuffTargets = options.filter((option) =>
        option.attackType === 'special'
        && option.target.ap >= 3
      );
      if (debuffTargets.length > 0) {
        debuffTargets.sort((a, b) => a.target.hp - b.target.hp);
        return debuffTargets[0];
      }
    }

    const basicOptions = options.filter((option) => option.attackType === 'basic');
    if (basicOptions.length > 0) {
      basicOptions.sort((a, b) => a.target.hp - b.target.hp || b.damage - a.damage);
      const bestBasic = basicOptions[0];
      const specialSameTarget = options.find((option) =>
        option.attackType === 'special'
        && option.target.id === bestBasic.target.id
      );

      if (!specialSameTarget) {
        return bestBasic;
      }

      const damageDelta = specialSameTarget.damage - bestBasic.damage;
      if (damageDelta >= 2) {
        return specialSameTarget;
      }

      return bestBasic;
    }

    options.sort((a, b) => a.target.hp - b.target.hp || b.damage - a.damage);
    return options[0];
  }

  _evaluateMove(unit) {
    if (unit.ap <= 0 || unit.specialLockedMove || !unit.position) {
      return null;
    }

    const reachable = this.movementSystem.getReachableCells(unit, this.gameState.units, GAME_CONFIG);
    if (reachable.length === 0) {
      return null;
    }

    const enemies = this.gameState.units.filter((candidate) =>
      candidate.isAlive() && candidate.owner !== unit.owner && candidate.position
    );
    if (enemies.length === 0) {
      return null;
    }

    const occupied = this.movementSystem.getOccupiedMap(this.gameState.units);
    let bestCell = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestCost = -1;

    for (const cell of reachable) {
      if (occupied.has(`${cell.x},${cell.y}`)) {
        continue;
      }

      let minDistance = Number.POSITIVE_INFINITY;
      for (const enemy of enemies) {
        const distance = this.movementSystem.getPathCost(cell, enemy.position);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }

      if (minDistance < bestDistance || (minDistance === bestDistance && cell.cost > bestCost)) {
        bestCell = cell;
        bestDistance = minDistance;
        bestCost = cell.cost;
      }
    }

    if (!bestCell) {
      return null;
    }

    return {
      type: 'move',
      targetCell: { x: bestCell.x, y: bestCell.y }
    };
  }

  _wait(ms) {
    return new Promise((resolve) => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }
}
