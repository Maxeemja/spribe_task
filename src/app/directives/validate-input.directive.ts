import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  HostListener,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appValidateInput]',
})
export class ValidateInputDirective {
  @Input() appValidateInput: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private control: NgControl,
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    this.validate();
  }

  @HostListener('change', ['$event'])
  onChange(event: Event) {
    this.validate();
  }
  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: Event) {
    this.validate();
  }

  @HostListener('blur') onBlur() {
    this.validate();
  }

  private validate() {
    if (this.control.invalid && (this.control.touched || this.control.dirty)) {
      this.renderer.addClass(this.el.nativeElement, 'border-red');
      this.showErrorMessage();
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'border-red');
      this.removeErrorMessage();
    }
  }

  private showErrorMessage() {
    let errorMessage =
      this.el.nativeElement.parentNode.querySelector('.error-message');
    if (!errorMessage) {
      errorMessage = this.renderer.createElement('div');
      this.renderer.addClass(errorMessage, 'error-message');
      this.renderer.setStyle(errorMessage, 'color', 'red');
      this.renderer.setProperty(
        errorMessage,
        'innerText',
        this.appValidateInput || 'Please provide correct input.',
      );
      this.renderer.appendChild(this.el.nativeElement.parentNode, errorMessage);
    }
  }

  private removeErrorMessage() {
    const errorMessage =
      this.el.nativeElement.parentNode.querySelector('.error-message');
    if (errorMessage) {
      this.renderer.removeChild(this.el.nativeElement.parentNode, errorMessage);
    }
  }
}
