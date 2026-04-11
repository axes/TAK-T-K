function cellKey(x, y) {
  return `${x},${y}`;
}

function isInBounds(x, y, grid) {
  return x >= 0 && y >= 0 && x < grid.cols && y < grid.rows;
}

function stepCost(dx, dy) {
  if (dx === 0 || dy === 0) {
    return 1;
  }

  return 2;
}

export class MovementSystem {
  static getOccupiedMap(units, ignoreUnitId = null) {
    const map = new Map();

    for (const unit of units) {
      if (!unit.isAlive() || unit.id === ignoreUnitId || !unit.position) {
        continue;
      }

      map.set(cellKey(unit.position.x, unit.position.y), unit.id);
    }

    return map;
  }

  static getReachableCells(unit, units, grid) {
    if (!unit.position) {
      return [];
    }
    
    const start = unit.position;
    const gridCols = grid.gridCols || 8;
    const gridRows = grid.gridRows || 8;
    const occupied = this.getOccupiedMap(units, unit.id);
    const queue = [{ x: start.x, y: start.y, cost: 0 }];
    const bestCosts = new Map([[cellKey(start.x, start.y), 0]]);
    const results = [];

    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift();

      if (current.cost > unit.ap) {
        continue;
      }

      if (!(current.x === start.x && current.y === start.y)) {
        results.push({ x: current.x, y: current.y, cost: current.cost });
      }

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
        const nextX = current.x + dx;
        const nextY = current.y + dy;
        const inBounds = isInBounds(nextX, nextY, { cols: gridCols, rows: gridRows });
        
        if (!inBounds) {
          continue;
        }

        if (occupied.has(cellKey(nextX, nextY))) {
          continue;
        }

        const nextCost = current.cost + stepCost(dx, dy);
        if (nextCost > unit.ap) {
          continue;
        }

        const key = cellKey(nextX, nextY);
        const previousBest = bestCosts.get(key);
        if (previousBest !== undefined && previousBest <= nextCost) {
          continue;
        }

        bestCosts.set(key, nextCost);
        queue.push({ x: nextX, y: nextY, cost: nextCost });
      }
    }

    return results;
  }

  static getPathCost(fromCell, toCell) {
    const dx = Math.abs(toCell.x - fromCell.x);
    const dy = Math.abs(toCell.y - fromCell.y);
    const diagonalSteps = Math.min(dx, dy);
    const straightSteps = Math.max(dx, dy) - diagonalSteps;
    return diagonalSteps * 2 + straightSteps;
  }

  static moveUnit(unit, targetCell, units, grid, preCalculatedCost = null) {
    const occupied = this.getOccupiedMap(units, unit.id);
    if (occupied.has(cellKey(targetCell.x, targetCell.y))) {
      return false;
    }

    const cost = preCalculatedCost !== null ? preCalculatedCost : this.getPathCost(unit.position, targetCell);
    if (cost > unit.ap) {
      return false;
    }

    unit.position = { x: targetCell.x, y: targetCell.y };
    unit.spendAp(cost);
    unit.movedThisTurn = true;
    return true;
  }
}
