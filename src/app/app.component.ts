import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Country } from './shared/enum/country';
import { Observable, map, catchError, of } from 'rxjs';
import { CheckUserResponseData } from './shared/interface/responses';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  formCards: FormGroup[] = [];
  invalidFormsCount = 0;
  isSubmitting = false;
  timer: number | null = null;
  timerInterval: any;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.addFormCard();
  }

  checkUser(username: string): Observable<CheckUserResponseData> {
    return this.http.post<CheckUserResponseData>('/api/checkUsername1', {
      username,
    });
  }

  addFormCard() {
    if (this.formCards.length < 10) {
      const newForm = this.fb.group({
        country: ['', [Validators.required, this.countryValidator]],
        username: [
          '',
          [Validators.required],
          [this.usernameValidator.bind(this)],
        ],
        birthday: ['', [Validators.required, this.birthdayValidator]],
      });
      this.formCards.push(newForm);
      this.updateInvalidFormsCount();
    }
  }

  removeFormCard(index: number) {
    this.formCards.splice(index, 1);
    this.updateInvalidFormsCount();
  }

  countryValidator(control: AbstractControl): ValidationErrors | null {
    return Object.values(Country).includes(control.value)
      ? null
      : { invalidCountry: true };
  }

  usernameValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return this.http
      .post<{ isAvailable: boolean }>('/api/checkUsername', {
        username: control.value,
      })
      .pipe(
        map((response) =>
          response.isAvailable ? null : { usernameUnavailable: true }
        ),
        catchError(() => of({ serverError: true }))
      );
  }

  birthdayValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    return selectedDate <= new Date() ? null : { futureDate: true };
  }

  updateInvalidFormsCount() {
    this.invalidFormsCount = this.formCards.filter(
      (form) => form.invalid
    ).length;
  }

  submitForms() {
    if (this.formCards.every((form) => form.valid)) {
      this.isSubmitting = true;
      this.timer = 5;
      this.timerInterval = setInterval(() => {
        this.timer!--;
        if (this.timer === 0) {
          this.sendForms();
        }
      }, 1000);
    }
  }

  cancelSubmit() {
    this.isSubmitting = false;
    this.timer = null;
    clearInterval(this.timerInterval);
  }

  sendForms() {
    clearInterval(this.timerInterval);
    const formValues = this.formCards.map((form) => form.value);
    this.http.post('/api/submitForm', formValues).subscribe(
      () => {
        this.formCards = [];
        this.addFormCard();
        this.isSubmitting = false;
        this.timer = null;
      },
      (error) => {
        console.error('Error submitting forms:', error);
        this.isSubmitting = false;
        this.timer = null;
      }
    );
  }
}
