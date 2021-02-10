import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldControl } from '@angular/material/form-field';
import { Spec } from '../character/spec';
import { SharedDataService } from '../shared/shared-data.service';

@Component({
  selector: 'app-new-spec',
  templateUrl: './new-spec.component.html',
  styleUrls: ['./new-spec.component.scss']
})
export class NewSpecComponent implements OnInit, AfterViewInit {

  constructor(public dialogRef: MatDialogRef<NewSpecComponent>, private sharedDataService: SharedDataService, private cdr: ChangeDetectorRef) { }

  newSpecFormGroup = new FormGroup({
    newSpecURL: new FormControl('', [Validators.required, this.validateTBCDBLink()])
  })

  talentUrlRegex = new RegExp(/^https:\/\/tbcdb.com\/talents\/index.html\?en\&paladin\&(\d{64})$/);

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  apply(): void {
    if (this.newSpecFormGroup.valid) {
      const specDef = this.newSpecFormGroup.get('newSpecURL')?.value.match(this.talentUrlRegex)[1];
      const character = this.sharedDataService.character.value;
      character.spec = new Spec(specDef);
      this.sharedDataService.character.next(character);
      this.dialogRef.close();
    }
  }

  private validateTBCDBLink(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const matchers = control.value.match(this.talentUrlRegex);
      if (matchers && matchers[1]) {
        return null;
      } else {
        return { invalidLink: { value: control.value } }
      }
    }
  }



}
