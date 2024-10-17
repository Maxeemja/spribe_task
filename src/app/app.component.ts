import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Country } from './shared/enum/country';
import { Subscription, Observable, of } from 'rxjs';
import {
  map,
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  formCards: FormGroup[] = [];
  invalidFormsCount = 0;
  isSubmitting = false;
  timer: number | null = null;
  timerInterval: any;
  private formSubscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.addFormCard();
  }

  ngOnDestroy() {
    this.formSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  addFormCard() {
    if (this.formCards.length < 10) {
      const newForm = this.fb.group({
        country: ['', [Validators.required, this.countryValidator]],
        username: ['', [Validators.required], [this.usernameValidator()]],
        birthday: ['', [Validators.required, this.birthdayValidator]],
      });

      const subscription = newForm.statusChanges.subscribe(() => {
        this.updateInvalidFormsCount();
      });

      this.formSubscriptions.push(subscription);
      this.formCards.push(newForm);
      this.updateInvalidFormsCount();
    }
  }

  removeFormCard(index: number) {
    if (this.formSubscriptions[index]) {
      this.formSubscriptions[index].unsubscribe();
      this.formSubscriptions.splice(index, 1);
    }
    this.formCards.splice(index, 1);
    this.updateInvalidFormsCount();
  }

  updateInvalidFormsCount() {
    this.invalidFormsCount = this.formCards.filter(
      (form) => form.invalid || form.pending
    ).length;
  }

  countryValidator(control: AbstractControl): ValidationErrors | null {
    return Object.values(Country).includes(control.value)
      ? null
      : { invalidCountry: true };
  }

  usernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return of(control.value).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) =>
          this.http
            .post<{ isAvailable: boolean }>('/api/checkUsername', {
              username: value,
            })
            .pipe(
              map((response) =>
                response.isAvailable ? null : { usernameUnavailable: true }
              ),
              catchError(() => of({ serverError: true }))
            )
        )
      );
    };
  }

  birthdayValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    return selectedDate <= new Date() ? null : { futureDate: true };
  }

  submitForms() {
    if (this.formCards.every((form) => form.valid)) {
      this.isSubmitting = true;
      this.formCards.forEach((form) => form.disable());
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
    this.formCards.forEach((form) => form.enable());
  }

  sendForms() {
    clearInterval(this.timerInterval);
    const formValues = this.formCards.map((form) => form.getRawValue());
    this.http.post('/api/submitForm', formValues).subscribe(
      () => {
        this.resetForms();
      },
      (error) => {
        console.error('Error submitting forms:', error);
        this.isSubmitting = false;
        this.timer = null;
        this.formCards.forEach((form) => form.enable());
      }
    );
  }

  resetForms() {
    this.formSubscriptions.forEach((sub) => sub.unsubscribe());
    this.formSubscriptions = [];
    this.formCards = [];
    this.addFormCard();
    this.isSubmitting = false;
    this.timer = null;
  }
}
