import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ValidatorsService } from './validators.service';

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private validators: ValidatorsService,
  ) {}

  createFormCard(): FormGroup {
    return this.fb.group({
      country: ['', [Validators.required, this.validators.countryValidator]],
      username: [
        '',
        [Validators.required],
        [this.validators.usernameValidator()],
      ],
      birthday: ['', [Validators.required, this.validators.birthdayValidator]],
    });
  }

  submitForms(forms: FormGroup[]): Observable<any> {
    const formValues = forms.map((form) => form.getRawValue());
    return this.http.post('/api/submitForm', formValues);
  }
}
