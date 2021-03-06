import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { BlizzardApiService } from '../blizzard-api.service';
import { Character } from '../character/character';
import { GearSlots } from '../character/gearslot';
import { Race, Races } from '../character/races/race';
import { Item } from '../item/item';
import { NewSpecComponent } from '../new-spec/new-spec.component';
import { SharedDataService } from '../shared/shared-data.service';

@Component({
  selector: 'app-character-config',
  templateUrl: './character-config.component.html',
  styleUrls: ['./character-config.component.scss']
})
export class CharacterConfigComponent implements OnInit {

  constructor(private sharedDataService: SharedDataService,
    private blizzardApiService: BlizzardApiService,
    private dialog: MatDialog) { }

  itemIconUrls: { [key: number]: string } = {};

  character!: Character
  GearSlots = GearSlots;
  GearSlotKeys = Object.values(GearSlots);

  RaceValues = Object.values(Races);
  currentRaceValue: string = '';

  ngOnInit(): void {
    this.sharedDataService.title.next('Character');
    this.sharedDataService.character.subscribe(character => {
      this.currentRaceValue = character.race.name
      this.character = character;
      Object.keys(this.character.gear).forEach((gearSlot) => {
        const item: Item = this.character.gear[gearSlot as keyof typeof GearSlots];
        if (item.id !== 0 && item.id !== undefined) {
          this.getItemImage(item.id)
        }
      })
    })
  }

  getGearIdForSlot(gear: string) {
    return this.character.gear[gear as keyof typeof GearSlots].id
  }

  raceChange(event: MatSelectChange) {
    const character = this.sharedDataService.character.value
    character.race = new Race(event.value)
    this.sharedDataService.character.next(character);
  }

  getItemIcon(id: number): string {
    if (this.itemIconUrls[id]) {
      return `url('${this.itemIconUrls[id]}')`
    }
    return '';
  }

  createNewSpec(event: any) {
    this.dialog.open(NewSpecComponent, {
      width: '500px'
    });
    event.stopPropagation();
  }


  private getItemImage(id: number) {
    if (!this.itemIconUrls[id]) {
      this.blizzardApiService.getItemMediaURL(id).then(obs => {
        obs.subscribe(link => this.itemIconUrls[id] = link)
      });
    }
  }


}
