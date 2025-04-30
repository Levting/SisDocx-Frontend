import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() placeholder: string = '';
  @Input() buttonText: string = 'Aceptar';
  @Input() buttonCancelText: string = 'Cancelar';
  @Input() maxLength: number = 50;
  @Input() minLength: number = 1;
  @Input() pattern: string = '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s-]+$';
  @Input() errorMessage: string = 'El nombre no es válido';
  @Input() initialValue: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<string>();

  public value: string = '';
  public isInvalid: boolean = false;

  ngOnChanges(): void {
    if (this.initialValue) {
      this.value = this.initialValue;
    }
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  onSubmit(): void {
    if (this.isValid()) {
      this.submit.emit(this.value);
      this.resetForm();
    } else {
      this.isInvalid = true;
    }
  }

  private isValid(): boolean {
    const regex = new RegExp(this.pattern);
    return (
      this.value.length >= this.minLength &&
      this.value.length <= this.maxLength &&
      regex.test(this.value)
    );
  }

  private resetForm(): void {
    this.value = '';
    this.isInvalid = false;
  }
}
