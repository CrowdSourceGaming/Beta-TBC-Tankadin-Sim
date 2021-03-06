import { AbilityInterface, damageTakenInterface } from "src/app/shared/abilityInterface";
import { AttackTableEnum } from "src/app/shared/attack-table";
import { DamageType } from "src/app/shared/magic-school";
import { Creature } from "src/app/sim/creature";
import { Character } from "../character";

export class Judgement implements AbilityInterface {
  magicSchool: DamageType = DamageType.holy;
  name: string = 'Judgement';
  onGCD: boolean = false;
  internalCD: number = 10000;
  lastCasted: number = -999999999;
  doDamage = {
    activate: false,
    seal: ''
  }

  constructor() { }

  onHit(rollResult: AttackTableEnum, attacker: Character, defender: Creature, timeElapsed: number): void | damageTakenInterface {

  }
  onCast(attacker: Character, defender: Creature, timeElapsed: number): boolean {
    if (this.lastCasted + this.internalCD <= timeElapsed) {
      this.internalCD = 10000 - (attacker.spec.talents.impJudgement * 1000);
      if (attacker.buffs['Seal of Vengeance']) {
        this.lastCasted = timeElapsed;
        this.doDamage = { activate: true, seal: 'Seal of Vengeance' }
        return false;
      }
      if (attacker.buffs['Seal of Righteousness']) {
        this.lastCasted = timeElapsed;
        this.doDamage = { activate: true, seal: 'Seal of Righteousness' }
        return false;
      }
      return false;
    }
    return false;
  }
  onCheck(attacker: Character, defender: Creature, timeElapsed: number): void | damageTakenInterface {
    if (this.doDamage && this.doDamage.activate) {
      this.doDamage.activate = false;
      const missChance = Math.max(17 - attacker.spellHit, 1);
      const roll = Math.random() * 100
      if (roll <= missChance) {
        return {
          circumstance: this.name,
          damageAmount: 1,
          damageType: DamageType.holy,
          comment: `Judgement: Resist`
        }
      }
      let damage!: damageTakenInterface;
      if (this.doDamage.seal === 'Seal of Vengeance') {
        damage = this.vengeanceDamage(attacker, defender);
      } else if (this.doDamage.seal === 'Seal of Righteousness') {
        damage = this.righteousnessDamage(attacker);
      } else {
        return
      }
      const critRoll = Math.random() * 100
      if (critRoll <= attacker.spellCrit) {
        damage.damageAmount = damage.damageAmount * 1.5
        damage.comment += ' - CRITICAL'
      }
      return damage;
    }
  }

  private righteousnessDamage(attacker: Character): damageTakenInterface {
    let damage = 219 + (0.7143 * attacker.spellDamage)
    damage = damage * (1 + (0.03 * attacker.spec.talents.improvedRighteousFury))
    return {
      circumstance: this.name,
      damageAmount: damage,
      damageType: DamageType.holy,
      comment: 'Judgement of Righteousness'
    }
  }

  private vengeanceDamage(attacker: Character, defender: Creature): damageTakenInterface {
    const debuff = defender.debuffs['Seal of Vengeance']
    const debuffStacks = debuff && debuff.stacks ? debuff.stacks : 0
    const damage = (120 * debuffStacks) + (attacker.spellDamage * 0.4286)
    return {
      circumstance: this.name,
      damageAmount: damage,
      damageType: DamageType.holy,
      comment: `Judgement of Vengeance: ${debuffStacks} stacks`
    }
  }
}
