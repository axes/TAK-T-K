let nextUnitId = 1;

export class Unit {
  constructor(template, owner, position = null) {
    this.id = nextUnitId;
    nextUnitId += 1;
    this.key = template.key;
    this.type = template.key;
    this.name = template.name;
    this.symbol = template.symbol;
    this.owner = owner;
    this.maxHp = template.maxHp;
    this.hp = template.maxHp;
    this.maxAp = template.maxAp;
    this.ap = template.maxAp;
    this.position = position;
    this.basicAttack = { ...template.basicAttack };
    this.specialAttack = { ...template.specialAttack };
    this.nextTurnApPenalty = 0;
    this.specialLockedMove = false;
    this.movedThisTurn = false;
  }

  isAlive() {
    return this.hp > 0;
  }

  startTurn() {
    this.specialLockedMove = false;
    this.movedThisTurn = false;
    const reduced = Math.max(0, this.maxAp - this.nextTurnApPenalty);
    this.ap = reduced;
    this.nextTurnApPenalty = 0;
  }

  spendAp(cost) {
    if (this.ap < cost) {
      return false;
    }

    this.ap -= cost;
    return true;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp === 0;
  }

  addNextTurnApPenalty(amount) {
    this.nextTurnApPenalty += amount;
  }
}
