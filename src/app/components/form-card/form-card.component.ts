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

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return `${
          controlName.charAt(0).toUpperCase() + controlName.slice(1)
        } is required.`;
      }

      
      if (control.errors?.['invalidCountry']) {
        return 'Please select a valid country.';
      }
      if (control.errors?.['usernameUnavailable']) {
        return 'This username is not available.';
      }
      if (control.errors?.['futureDate']) {
        return 'Birthday cannot be in the future.';
      }
    }
    return '';
  }
}
