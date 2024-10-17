import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Country } from '../shared/enum/country';
import { Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ValidatorsService {
  constructor(private http: HttpClient) {}
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
                response.isAvailable ? null : { usernameUnavailable: true },
              ),
              catchError(() => of({ serverError: true })),
            ),
        ),
      );
    };
  }

  birthdayValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    return selectedDate <= new Date() ? null : { futureDate: true };
  }
}
