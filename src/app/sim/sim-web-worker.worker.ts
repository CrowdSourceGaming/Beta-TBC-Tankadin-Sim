/// <reference lib="webworker" />

import { deserialize } from "typescript-json-serializer";
import { Attack } from "../character/abilities/attack";
import { Consecration } from "../character/abilities/consecration";
import { HolyShield } from "../character/abilities/holy-shield";
import { Judgement } from "../character/abilities/judgement";
import { SealOfVengeance } from "../character/abilities/seal-of-vengeance";
import { Character } from "../character/character";
import { AbilityInterface, BossAbilityInterface, damageTakenInterface } from "../shared/abilityInterface";
import { AttackTableEnum, AttackTable } from "../shared/attack-table";
import { DamageType } from "../shared/magic-school";
import { BossAttack } from "./boss-abilities/boss-attack";
import { Creature } from "./creature";

let lastAutoAttack: any;
let abilities: any;
let registeredAbilities: any;
let onGCD: any;
let character: any;
let creature: any;

addEventListener('message', ({ data }) => {
  const multipleCombatSessions: SimulationResults[] = new Array();
  for (let k = 0; k < 250; k++) {
    creature = new Creature();
    character = deserialize(data.character, Character);
    lastAutoAttack = {  // start the fight with an attack and then track the last hit.
      player: 0,
      creature: 0
    }
    abilities = {
      attack: new Attack(),
      SoV: new SealOfVengeance(),
      holyShield: new HolyShield(),
      bossAttack: new BossAttack(),
      consecration: new Consecration(),
      judgement: new Judgement()
    }
    registeredAbilities = {
      playerAbiliities: [abilities.attack, abilities.judgement, abilities.SoV, abilities.holyShield, abilities.consecration],
      bossAbilities: [abilities.bossAttack],
      reactiveAbilities: [abilities.holyShield]
    }
    onGCD = { value: false, timeUpdated: 0 }
    const results: any[] = [];
    for (let i = 0; i < data.timeToRun; i += 10) {
      const result: any = {
        damageTaken: [],
        damageDone: []
      }
      if (onGCD.value === true && onGCD.timeUpdated + 1500 <= i) {
        onGCD.value = false;
        onGCD.timeUpdated = i;
      }
      const rollResult: AttackTableEnum | false = playerAutoAttackCreature(character, creature, i)
      castAllAvailableAbilities(character, creature, i, data);
      registeredAbilities.playerAbiliities.forEach((ability: AbilityInterface) => {
        triggerPlayerAbility(rollResult, ability, character, creature, result, i)
      });
      const enemyRollResult: AttackTableEnum | false = creatureAutoAttackPlayer(creature, character, i)
      registeredAbilities.bossAbilities.forEach((ability: BossAbilityInterface) => {
        triggerBossAbility(enemyRollResult, ability, creature, character, result, i)
      });
      registeredAbilities.reactiveAbilities.forEach((ability: AbilityInterface) => {
        triggerReactivePlayerAbility(enemyRollResult, ability, creature, character, result, i)
      });
      results.push(result);
    }
    multipleCombatSessions.push({
      simResults: results,
      runNumber: k
    });
  }
  postMessage(multipleCombatSessions);
});



function castAllAvailableAbilities(character: Character, creature: Creature, i: number, data: any) {
  for (let spellName of data.spellPriority) {
    const ability = registeredAbilities.playerAbiliities.find((ability: any) => ability.name === spellName)!;
    if (ability.onGCD && onGCD.value) {
      // DO NOTHING
    } else {
      const triggerGCD = ability.onCast(character, creature, i);
      if (triggerGCD) {
        onGCD = { value: true, timeUpdated: i };
      }
    }
  }
}

function triggerReactivePlayerAbility(rollResult: AttackTableEnum | false, ability: AbilityInterface, attacker: Creature, defender: Character, result: any, timeElapsed: number) {
  if (rollResult) {
    const onHitEffect = ability.onReactive!(rollResult, attacker, defender, timeElapsed);
    if (onHitEffect) {
      modifyDamage(defender, onHitEffect)
      determineThreat(defender, onHitEffect);
      result.damageDone.push(onHitEffect);
    }
  }
}

function triggerPlayerAbility(rollResult: AttackTableEnum | false, ability: AbilityInterface, attacker: Character, defender: Creature, result: any, timeElapsed: number) {
  if (rollResult) {
    const onHitEffect = ability.onHit(rollResult, attacker, defender, timeElapsed);
    if (onHitEffect) {
      modifyDamage(attacker, onHitEffect)
      determineThreat(attacker, onHitEffect);
      result.damageDone.push(onHitEffect);
    }
  }
  const onCheckEffect = ability.onCheck(attacker, defender, timeElapsed)
  if (onCheckEffect) {
    modifyDamage(attacker, onCheckEffect)
    determineThreat(attacker, onCheckEffect);
    result.damageDone.push(onCheckEffect);
  }
}

function triggerBossAbility(rollResult: AttackTableEnum | false, ability: BossAbilityInterface, attacker: Creature, defender: Character, result: any, timeElapsed: number) {
  if (rollResult) {
    const onHitEffect = ability.onHit(rollResult, attacker, defender);
    onHitEffect ? result.damageTaken.push(onHitEffect) : null;
  }
  const onCheckEffect = ability.onCheck(attacker, defender, timeElapsed)
  onCheckEffect ? result.damageTaken.push(onCheckEffect) : null;
}

function playerAutoAttackCreature(character: Character, creature: Creature, timeElapsed: number): AttackTableEnum | false {
  const weaponSpeed = character.attackSpeed;
  if (shouldAttack(weaponSpeed, timeElapsed, lastAutoAttack.player, 'player')) {
    const rollResult = attackRoll(character.attackTable)
    lastAutoAttack.player = timeElapsed;
    return rollResult
  } else {
    return false;
  }
}

function creatureAutoAttackPlayer(creature: Creature, character: Character, timeElapsed: number): AttackTableEnum | false {
  const weaponSpeed = creature.attackSpeed;
  if (shouldAttack(weaponSpeed, timeElapsed, lastAutoAttack.creature, 'creature')) {
    const attackTable: AttackTable = {
      miss: creature.AttackTable[AttackTableEnum.miss] + character.missChance,
      dodge: creature.AttackTable[AttackTableEnum.dodge] + character.dodgeChance,
      parry: creature.AttackTable[AttackTableEnum.parry] + character.parry,
      glancing: 0,
      block: creature.AttackTable[AttackTableEnum.block] + character.blockChance + (
        (character.buffs['Holy Shield'] && character.buffs['Holy Shield'].charges > 0) ? 30 : 0),
      crit: creature.AttackTable[AttackTableEnum.crit] - character.critReduction,
      crushing: creature.AttackTable[AttackTableEnum.crushing],
      hit: 0
    }
    const rollResult = attackRoll(attackTable)
    lastAutoAttack.creature = timeElapsed;
    return rollResult
  } else {
    return false;
  }
}

function attackRoll(attackTable: AttackTable): AttackTableEnum {
  let roll = Math.random() * 100
  for (let attackOutcome of Object.keys(attackTable)) {
    const rollRange = attackTable[attackOutcome as keyof typeof attackTable]
    if (roll <= rollRange) {
      return AttackTableEnum[attackOutcome as keyof typeof AttackTableEnum];
    } else {
      roll -= rollRange
    }
  };
  return AttackTableEnum.hit;
}

function shouldAttack(attackSpeed: number, timeElapsed: number, lastAttackTime: number, attacker: string): boolean {
  const attack = (lastAttackTime + (attackSpeed * 1000) <= timeElapsed)
  if (attack) {
    if (attacker === 'player') {
      lastAutoAttack.player = timeElapsed;
    } else {
      lastAutoAttack.creature = timeElapsed;
    }
  }
  return attack;
}

function modifyDamage(character: Character, damage: damageTakenInterface) {
  if (damage.damageType === DamageType.holy) {
    if (character.buffs['Sanctity Aura'] || character.buffs['Improved Sanctity Aura']) {
      damage.damageAmount = damage.damageAmount * 1.10
    }
  }
  if (character.buffs['Improved Sanctity Aura']) {
    damage.damageAmount = damage.damageAmount * 1.02
  }
  if (character.spec.talents.oneHandedSpec > 0) {
    damage.damageAmount = damage.damageAmount * (1 + (character.spec.talents.oneHandedSpec / 100))
  }
  if (character.spec.talents.crusade > 0) {
    damage.damageAmount = damage.damageAmount * (1 + (character.spec.talents.crusade / 100))
  }
  damage.damageAmount = Math.round(damage.damageAmount);
}

function determineThreat(character: Character, combatResults: damageTakenInterface): void {
  let totalThreat = combatResults.damageAmount;
  let holythreatModifier = 0.6;
  const improvedRighteousFuryTalents = character.spec.talents.improvedRighteousFury;
  if (improvedRighteousFuryTalents && improvedRighteousFuryTalents > 0) {
    improvedRighteousFuryTalents === 1 ? holythreatModifier = holythreatModifier * 1.16 : null;
    improvedRighteousFuryTalents === 2 ? holythreatModifier = holythreatModifier * 1.33 : null;
    improvedRighteousFuryTalents === 3 ? holythreatModifier = holythreatModifier * 1.50 : null;
  }
  if (combatResults.damageType === DamageType.holy) {
    totalThreat = totalThreat * (1 + holythreatModifier);
  }
  if (combatResults.circumstance === 'Holy Shield') {
    totalThreat = totalThreat * 1.35
  }
  combatResults.threat = totalThreat;
}

interface TimeSlotResults {
  damageDone: damageTakenInterface[],
  damageTaken: damageTakenInterface[]
}

interface SimulationResults {
  runNumber: number;
  simResults: TimeSlotResults[]
}
