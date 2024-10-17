import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Country } from '../../shared/enum/country';

@Component({
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.scss'],
})
export class FormCardComponent {
  @Input() form!: FormGroup;
  @Output() remove = new EventEmitter<void>();

  countries = Object.values(Country);

  removeCard() {
    this.remove.emit();
  }
}
