import { WeaponType } from "./item";

export interface ItemStats {
  //raw stats
  [ItemStatsEnum.stamina]?: number,
  [ItemStatsEnum.intellect]?: number,
  [ItemStatsEnum.strength]?: number,
  [ItemStatsEnum.agility]?: number,
  [ItemStatsEnum.spirit]?: number,
  //defensive
  [ItemStatsEnum.armor]?: number,
  [ItemStatsEnum.defenseRating]?: number,
  [ItemStatsEnum.defenseValue]?: number,
  [ItemStatsEnum.miss]?: number,
  [ItemStatsEnum.dodgeRating]?: number,
  [ItemStatsEnum.parryRating]?: number,
  [ItemStatsEnum.parryValue]?: number,
  [ItemStatsEnum.blockRating]?: number,
  [ItemStatsEnum.blockValue]?: number,
  [ItemStatsEnum.resilience]?: number,
  //melee
  [ItemStatsEnum.meleeHitRating]?: number,
  [ItemStatsEnum.meleeHitPercent]?: number,
  [ItemStatsEnum.meleeCritRating]?: number,
  [ItemStatsEnum.meleeCritPercent]?: number,
  [ItemStatsEnum.expertiseRating]?: number,
  [ItemStatsEnum.attackRating]?: number,
  [ItemStatsEnum.meleeExpertise]?: number,
  [ItemStatsEnum.attackPower]?: number,
  [ItemStatsEnum.bonusMeleeDamage]?: number,
  [ItemStatsEnum.hasteRating]?: number,
  [ItemStatsEnum.armorPenRating]?: number,
  [ItemStatsEnum.attackSpeed]?: number,
  [ItemStatsEnum.damageMax]?: number,
  [ItemStatsEnum.damageMin]?: number,

  //spell
  [ItemStatsEnum.spellHitRating]?: number,
  [ItemStatsEnum.spellHitPercent]?: number,
  [ItemStatsEnum.spellCritRating]?: number,
  [ItemStatsEnum.spellDamage]?: number,
  [ItemStatsEnum.healing]?: number,
  [ItemStatsEnum.spellPen]?: number,
  [ItemStatsEnum.mp5]?: number,
}

export enum ItemType {
  unkown = 'unknown',
  mainHand = 'mainHand',
  offHand = 'offHand',
  oneHand = 'oneHand',
  shield = 'shield',
  head = 'head'
}

export enum ItemStatsEnum {
  stamina = 'stamina',
  intellect = 'intellect',
  strength = 'strength',
  agility = 'agility',
  spirit = 'spirit',
  //defensive
  armor = 'armor',
  defenseRating = 'defenseRating',
  miss = 'miss',
  dodgeRating = 'dodgeRating',
  parryRating = 'parryRating',
  parryValue = 'parryValue',
  blockRating = 'blockRating',
  blockValue = 'blockValue',
  defenseValue = 'defenseValue',
  resilience = 'resilience',
  //melee
  meleeHitRating = 'meleeHitRating',
  meleeHitPercent = 'meleeHitPercent',
  meleeCritRating = 'meleeCritRating',
  meleeCritPercent = 'meleeCritPercent',
  expertiseRating = 'expertiseRating',
  attackRating = 'attackRating',
  meleeExpertise = 'meleeExpertise',
  attackPower = 'attackPower',
  bonusMeleeDamage = 'bonusMeleeDamage',
  hasteRating = 'hasteRating',
  armorPenRating = 'armorPenRating',
  damageMin='damageMin',
  damageMax='damageMax',
  attackSpeed='attackSpeed',
  //spell
  spellHitRating = 'spellHitRating',
  spellHitPercent = 'spellHitPercent',
  spellCritRating = 'spellCritRating',
  spellDamage = 'spellDamage',
  healing = 'healing',
  spellPen = 'spellPen',
  mp5 = 'mp5',
}
