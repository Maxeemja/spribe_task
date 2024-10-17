import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormsService } from './services/forms.service'; // Import the service

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

  constructor(private formService: FormsService) {} // Inject the service

  ngOnInit() {
    this.addFormCard();
  }

  ngOnDestroy() {
    this.formSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  addFormCard() {
    if (this.formCards.length < 10) {
      const newForm = this.formService.createFormCard(); // Use the service to create the form
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
      (form) => form.invalid || form.pending,
    ).length;
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
    this.formService.submitForms(this.formCards).subscribe({
      next: () => {
        this.resetForms();
      },
      error: (error: Error) => {
        console.error('Error submitting forms:', error);
        this.isSubmitting = false;
        this.timer = null;
        this.formCards.forEach((form) => form.enable());
      },
    });
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
