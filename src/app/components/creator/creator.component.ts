import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TurboFormControlConfig } from '../ngx-turbo-form/ngx-turbo-form.component';

const SIMPLE_CONTROL_TYPES: TurboFormControlConfig['type'][] = [
  'text', 'email', 'password', 'number', 'textarea', 'select',
  'checkbox', 'radio', 'date', 'space', 'titleSeparator'
];

@Component({
  selector: 'app-creator',
  standalone: true,
  imports: [
    TranslatePipe,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './creator.component.html',
  styles: [
    `:host { display: block; }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorComponent implements OnInit {

  private fb = inject(FormBuilder);

  controlForm!: FormGroup;

  createdControls: TurboFormControlConfig[] = [];

  availableControlTypes = SIMPLE_CONTROL_TYPES;

  ngOnInit(): void {
    this.initializeForm();

    this.controlForm.get('type')?.valueChanges.subscribe(type => {
      this.updateFormBasedOnType(type);
    });
  }

  initializeForm(): void {
    this.controlForm = this.fb.group({
      type: [null, Validators.required],
      label: ['', Validators.required],
      name: ['', Validators.required],
      placeholder: [''],
      defaultValue: [''],
      colspanDesktop: [6],
      colspanMobile: [12],
      disabled: [false],
      required: [false],
      options: this.fb.array([])
    });
    this.updateFormBasedOnType(null);
  }

  updateFormBasedOnType(type: TurboFormControlConfig['type'] | null): void {
    const fieldsToReset = ['placeholder', 'defaultValue', 'required', 'disabled'];
    const commonFields = ['label', 'name', 'colspanDesktop', 'colspanMobile'];

    if (!type || type === 'space' || type === 'titleSeparator') {
      commonFields.forEach(fieldName => this.controlForm.get(fieldName)?.disable());
      fieldsToReset.forEach(fieldName => this.controlForm.get(fieldName)?.disable());
      this.controlForm.get('options')?.disable();
       if(type === 'titleSeparator') {
          this.controlForm.get('label')?.enable();
          this.controlForm.get('label')?.setValidators(Validators.required);
       } else {
          this.controlForm.get('label')?.clearValidators();
          this.controlForm.get('label')?.disable();
       }
       this.controlForm.get('name')?.enable();
       this.controlForm.get('name')?.setValidators(Validators.required);

    } else {
      commonFields.forEach(fieldName => {
         this.controlForm.get(fieldName)?.enable();
         this.controlForm.get(fieldName)?.setValidators(Validators.required);
      });
      fieldsToReset.forEach(fieldName => this.controlForm.get(fieldName)?.enable());
       this.controlForm.get('label')?.updateValueAndValidity();
       this.controlForm.get('name')?.updateValueAndValidity();
    }

    if (type === 'checkbox' || type === 'radio' || type === 'select' || type === 'date' || type === 'space' || type === 'titleSeparator') {
      this.controlForm.get('placeholder')?.disable();
      this.controlForm.get('placeholder')?.reset('');
    } else {
      this.controlForm.get('placeholder')?.enable();
    }

     const defaultValueControl = this.controlForm.get('defaultValue');
     if (type === 'checkbox') {
       defaultValueControl?.enable();
     } else if (type === 'space' || type === 'titleSeparator') {
         defaultValueControl?.disable();
         defaultValueControl?.reset('');
     } else {
       defaultValueControl?.enable();
     }

    if (type === 'space' || type === 'titleSeparator') {
        this.controlForm.get('required')?.disable();
        this.controlForm.get('required')?.reset(false);
    } else {
        this.controlForm.get('required')?.enable();
    }

    const optionsArray = this.controlForm.get('options') as FormArray;
    if (type === 'select' || type === 'radio') {
      optionsArray.enable();
      if (optionsArray.length === 0) {
        this.addOption();
      }
    } else {
      optionsArray.disable();
      optionsArray.clear();
    }

     this.controlForm.updateValueAndValidity();
  }

  get options(): FormArray {
    return this.controlForm.get('options') as FormArray;
  }

  newOption(): FormGroup {
    return this.fb.group({
      value: ['', Validators.required],
      label: ['', Validators.required]
    });
  }

  addOption(): void {
    this.options.push(this.newOption());
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
  }

  addControl(): void {
    if (this.controlForm.valid) {
      const formValue = this.controlForm.getRawValue();

      const newControlConfig: any = {
        type: formValue.type,
        label: formValue.label,
        name: formValue.name,
        ...(formValue.placeholder && { placeholder: formValue.placeholder }),
        ...(formValue.defaultValue !== '' && formValue.defaultValue !== null && { defaultValue: formValue.defaultValue }),
        ...(formValue.colspanDesktop && { colspanDesktop: formValue.colspanDesktop }),
        ...(formValue.colspanMobile && { colspanMobile: formValue.colspanMobile }),
        ...(formValue.disabled && { disabled: formValue.disabled }),
      };

      if (formValue.required && formValue.type !== 'space' && formValue.type !== 'titleSeparator') {
        newControlConfig.validators = [{ type: 'required', message: 'validators.required' }];
      }

      if ((formValue.type === 'select' || formValue.type === 'radio') && formValue.options.length > 0) {
        newControlConfig.options = formValue.options;
      }

      if (formValue.type === 'space' || formValue.type === 'titleSeparator') {
        delete newControlConfig.placeholder;
        delete newControlConfig.defaultValue;
        delete newControlConfig.validators;
        delete newControlConfig.disabled;
        delete newControlConfig.options;
        if (formValue.type === 'space') {
          delete newControlConfig.label;
        }
      }

      this.createdControls.push(newControlConfig as TurboFormControlConfig);
       this.controlForm.reset({
            type: null,
            label: '',
            name: '',
            placeholder: '',
            defaultValue: '',
            colspanDesktop: 6,
            colspanMobile: 12,
            disabled: false,
            required: false,
       });
       this.options.clear();
       this.updateFormBasedOnType(null);

    } else {
      this.controlForm.markAllAsTouched();
      console.error("Formulario inválido", this.controlForm.errors, this.controlForm.value);
    }
  }

   getGeneratedConfigJson(): string {
    const fullConfig = {
        color: 'orange',
        submitText: 'Enviar',
        controls: this.createdControls
    };
    return JSON.stringify(fullConfig, null, 2);
   }

}
