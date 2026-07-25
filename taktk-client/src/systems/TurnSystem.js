export class TurnSystem {
  constructor(gameState) {
    this.gameState = gameState;
  }

  startTurn(playerId) {
    this.gameState.currentPlayer = playerId;
    this.gameState.turnNumber += 1;

    for (const unit of this.getUnitsForPlayer(playerId)) {
      if (unit.isAlive()) {
        unit.startTurn();
      }
    }

    this.clearSelection();
  }

  endTurn() {
    const nextPlayer = this.gameState.currentPlayer === 1 ? 2 : 1;
    this.startTurn(nextPlayer);
  }

  clearSelection() {
    this.gameState.selectedUnitId = null;
    this.gameState.selectedAction = 'preview';
  }

  selectUnit(unitId) {
    this.gameState.selectedUnitId = unitId;
    this.gameState.selectedAction = 'preview';
  }

  getSelectedUnit() {
    return this.gameState.units.find((unit) => unit.id === this.gameState.selectedUnitId) || null;
  }

  getUnitsForPlayer(playerId) {
    return this.gameState.units.filter((unit) => unit.owner === playerId && unit.isAlive());
  }

  hasLivingUnits(playerId) {
    return this.gameState.units.some((unit) => unit.owner === playerId && unit.isAlive());
  }

  checkVictory() {
    const player1Alive = this.hasLivingUnits(1);
    const player2Alive = this.hasLivingUnits(2);

    if (!player1Alive && player2Alive) {
      this.gameState.winner = 2;
    } else if (!player2Alive && player1Alive) {
      this.gameState.winner = 1;
    }

    return this.gameState.winner;
  }

  activePlayerHasActions() {
    return this.getUnitsForPlayer(this.gameState.currentPlayer).some((unit) => unit.ap > 0);
  }
}
