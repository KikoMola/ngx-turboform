export const interfaceTurboFormConfig = `
interface TurboFormConfig {
  controls: Array<TurboFormControlConfig>;
  submitText?: string;
  color:
    | 'teal'
    | 'indigo'
    | 'rose'
    | 'purple'
    | 'fuchsia'
    | 'pink'
    | 'orange'
    | 'yellow'
    | 'lime'
    | 'emerald'
    | 'teal'
    | 'indigo'
    | 'rose';
}
`

export const interfaceTurboFormControlConfig = `
interface TurboFormControlConfig {
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'array'
    | 'space'
    | 'titleSeparator'
    | 'predictiveSearch';
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  colspanDesktop?: number;
  colspanMobile?: number;
  validators?: Array<ValidatorConfig>;
  options?: { value: any; label: string }[]; // Para select y radio
  defaultValue?: any; // Valor por defecto para el control
  arrayConfig?: {
    controls: Array<TurboFormControlConfig>;
    addButtonText?: string;
    removeButtonText?: string;
  }; // Para formArrays
  searchConfig?: {
    displayField?: string; // Campo a mostrar en los resultados
    valueField?: string; // Campo a usar como valor
    minLength?: number; // Longitud mínima para iniciar la búsqueda
    searchKey?: string; // Clave para identificar el tipo de búsqueda
  }; // Para predictiveSearch
}
`

export const fullHtml = `
<form [formGroup]="formGroup" class="w-full mx-auto">
  <div class="grid grid-cols-12 gap-4">
    @for (control of formControls; track control) {
      <div class="mb-4" 
        [class.col-span-12]="control.colspanMobile === 12" 
        [class.col-span-6]="control.colspanMobile === 6" 
        [class.col-span-1]="control.colspanMobile === 1" 
        [class.md:col-span-8]="control.colspanDesktop === 8" 
        [class.md:col-span-4]="control.colspanDesktop === 4" 
        [class.md:col-span-6]="control.colspanDesktop === 6" 
        [class.md:col-span-3]="control.colspanDesktop === 3" 
        [class.md:col-span-2]="control.colspanDesktop === 2" 
        [class.md:col-span-12]="control.colspanDesktop === 12">
        @if (control.type === 'titleSeparator') {
          <!-- Título con separador -->
          <div class="w-full mt-2 mb-2">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">{{ control.label | translate }}</h2>
            <hr class="border-t-2 border-gray-300">
          </div>
        } @else if (control.type === 'checkbox') {
          <!-- Checkbox con label alineado -->
          <div class="flex items-center space-x-3 mt-7">
            <label [for]="control.name" class="text-sm font-medium text-gray-700">
              {{ control.label | translate }}{{ isRequired(control) ? ' *' : '' }}
            </label>
            <input
              type="checkbox"
              [id]="control.name"
              [formControlName]="control.name"
              [ngClass]="getInputClasses(control)">
          </div>
        } @else {
          <label [for]="control.name" class="block text-sm font-medium text-gray-700 mb-1">
            {{ control.label | translate }}{{ isRequired(control) ? ' *' : '' }}
          </label>
          @switch (control.type) {
            @case ('text') {
              <input
                type="text"
                [id]="control.name"
                [placeholder]="control.placeholder || ''"
                [formControlName]="control.name"
                [ngClass]="getInputClasses(control)">
            }
            @case ('email') {
              <input
                type="email"
                [id]="control.name"
                [placeholder]="control.placeholder || ''"
                [formControlName]="control.name"
                [ngClass]="getInputClasses(control)">
            }
            @case ('password') {
              <input
                type="password"
                [id]="control.name"
                [placeholder]="control.placeholder || ''"
                [formControlName]="control.name"
                [ngClass]="getInputClasses(control)">
            }
            @case ('number') {
              <input
                type="number"
                [id]="control.name"
                [placeholder]="control.placeholder || ''"
                [formControlName]="control.name"
                [ngClass]="getInputClasses(control)">
            }
            @case ('date') {
              <input
                type="date"
                [id]="control.name"
                [placeholder]="control.placeholder || ''"
                [formControlName]="control.name"
                [ngClass]="getInputClasses(control)">
            }
            @case ('textarea') {
              <textarea
                [id]="control.name"
                [placeholder]="control.placeholder || ''"
                [formControlName]="control.name"
                [ngClass]="[
                    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none 
                    focus:ring-2 transition-colors min-h-[100px]', getFocusRingClass()
                ]">
              </textarea>
            }
            @case ('select') {
              <div class="relative">
                <select
                  [id]="control.name"
                  [formControlName]="control.name"
                  [ngClass]="[
                    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none 
                    focus:ring-2 transition-colors bg-white appearance-none pr-10', getFocusRingClass()
                  ]">
                  @for (option of control.options; track option) {
                    <option [value]="option.value">{{ option.label | translate }}</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            }
            @case ('radio') {
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-[15px]">
                @for (option of control.options; track option) {
                  <div class="flex items-center space-x-2">
                    <input
                      type="radio"
                      [id]="control.name + '_' + option.value"
                      [name]="control.name"
                      [value]="option.value"
                      [formControlName]="control.name"
                      class="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500">
                    <label [for]="control.name + '_' + option.value" class="text-sm font-medium text-gray-700">{{ option.label }}</label>
                  </div>
                }
              </div>
            }
            @case ('space') {
              <div class="w-full h-full"></div>
            }
            @case ('predictiveSearch') {
              <div class="relative">
                <input
                  type="text"
                  [id]="control.name"
                  [attr.data-control-name]="control.name"
                  [placeholder]="control.placeholder || ''"
                  (input)="onSearchInput($event, control.name)"
                  autocomplete="off"
                  [ngClass]="getInputClasses(control)">
                
                <!-- Input oculto para el valor real -->
                <input type="hidden" [formControlName]="control.name">
                
                
                <!-- Resultados de la búsqueda -->
                @if (searchResults[control.name] && searchResults[control.name].length > 0) {
                  <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    @for (result of searchResults[control.name]; track result.id) {
                      <div 
                        class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        (click)="selectResult(control.name, result)"
                      >
                        <div class="font-medium">{{ result.text }}</div>
                        @if (result.description) {
                          <div class="text-sm text-gray-500">{{ result.description }}</div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
            @case ('array') {
              <div class="w-full">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-medium text-gray-900">{{ control.label | translate }}</h3>
                  <button 
                    type="button"
                    (click)="addArrayRow(control.name)"
                    [ngClass]="[
                        'inline-flex items-center px-3 py-1.5 border border-transparent 
                        text-sm font-medium rounded-md shadow-sm text-white 
                        focus:outline-none focus:ring-2 focus:ring-offset-2', 
                        'bg-' + getThemeColor() + '-600 hover:bg-' + getThemeColor() + '-700 focus:ring-' + getThemeColor() + '-500'
                    ]"
                  >
                    {{ control.arrayConfig?.addButtonText || 'Añadir' | translate }}
                  </button>
                </div>

                <div [formArrayName]="control.name">
                  @for (group of getFormArray(control.name).controls; track group; let i = $index) {
                    <div [formGroupName]="i" class="border rounded-lg p-4 mb-4 relative">
                      <button 
                        type="button"
                        (click)="removeArrayRow(control.name, i)"
                        class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>

                      <div class="grid grid-cols-12 gap-4">
                        @for (rowControl of getArrayRowControls(control.arrayConfig); track rowControl) {
                          <div [class]="'col-span-12 md:col-span-' + (rowControl.colspanDesktop || 6)">
                            @if (rowControl.type === 'titleSeparator') {
                              <!-- Título con separador -->
                              <div class="w-full mt-6 mb-4">
                                <h2 class="text-xl font-semibold text-gray-900 mb-3">{{ rowControl.label | translate }}</h2>
                                <hr class="border-t-2 border-gray-300">
                              </div>
                            } @else {
                              @if (rowControl.type !== 'checkbox') {
                                <label [for]="rowControl.name + '_' + i" class="block text-sm font-medium text-gray-700 mb-1">
                                  {{ rowControl.label | translate }}{{ isRequired(rowControl) ? ' *' : '' }}
                                </label>
                              }
                              
                              @switch (rowControl.type) {
                                @case ('text') {
                                  <input
                                    type="text"
                                    [id]="rowControl.name + '_' + i"
                                    [placeholder]="rowControl.placeholder || ''"
                                    [formControlName]="rowControl.name"
                                    [ngClass]="getInputClasses(rowControl)">
                                }
                                @case ('email') {
                                  <input
                                    type="email"
                                    [id]="rowControl.name + '_' + i"
                                    [placeholder]="rowControl.placeholder || ''"
                                    [formControlName]="rowControl.name"
                                    [ngClass]="getInputClasses(rowControl)">
                                }
                                @case ('password') {
                                  <input
                                    type="password"
                                    [id]="rowControl.name + '_' + i"
                                    [placeholder]="rowControl.placeholder || ''"
                                    [formControlName]="rowControl.name"
                                    [ngClass]="getInputClasses(rowControl)">
                                }
                                @case ('number') {
                                  <input
                                    type="number"
                                    [id]="rowControl.name + '_' + i"
                                    [placeholder]="rowControl.placeholder || ''"
                                    [formControlName]="rowControl.name"
                                    [ngClass]="getInputClasses(rowControl)">
                                }
                                @case ('date') {
                                  <input
                                    type="date"
                                    [id]="rowControl.name + '_' + i"
                                    [placeholder]="rowControl.placeholder || ''"
                                    [formControlName]="rowControl.name"
                                    [ngClass]="getInputClasses(rowControl)">
                                }
                                @case ('textarea') {
                                  <textarea
                                    [id]="rowControl.name + '_' + i"
                                    [placeholder]="rowControl.placeholder || ''"
                                    [formControlName]="rowControl.name"
                                    [ngClass]="[
                                        'w-full px-3 py-2 border border-gray-300 rounded-md 
                                        shadow-sm focus:outline-none focus:ring-2 transition-colors min-h-[100px]', 
                                        getFocusRingClass()
                                    ]">
                                  </textarea>
                                }
                                @case ('select') {
                                  <div class="relative">
                                    <select
                                      [id]="rowControl.name + '_' + i"
                                      [formControlName]="rowControl.name"
                                      [ngClass]="[
                                        'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                        focus:outline-none focus:ring-2 transition-colors 
                                        bg-white appearance-none pr-10', getFocusRingClass()
                                      ]">
                                      @for (option of rowControl.options; track option) {
                                        <option [value]="option.value">{{ option.label | translate }}</option>
                                      }
                                    </select>
                                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                      <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                      </svg>
                                    </div>
                                  </div>
                                }
                                @case ('checkbox') {
                                  <div class="mt-8">
                                    <div class="flex items-center space-x-3">
                                      <label [for]="rowControl.name + '_' + i" class="text-sm font-medium text-gray-700">
                                        {{ rowControl.label | translate }}{{ isRequired(rowControl) ? ' *' : '' }}
                                      </label>
                                      <input
                                        type="checkbox"
                                        [id]="rowControl.name + '_' + i"
                                        [formControlName]="rowControl.name"
                                        [ngClass]="getInputClasses(rowControl)">                                    
                                    </div>
                                  </div>
                                  
                                }
                                @case ('radio') {
                                  <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-[15px]">
                                    @for (option of rowControl.options; track option) {
                                      <div class="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          [id]="rowControl.name + '_' + option.value + '_' + i"
                                          [name]="rowControl.name"
                                          [value]="option.value"
                                          [formControlName]="rowControl.name"
                                          class="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500">
                                        <label [for]="rowControl.name + '_' + option.value + '_' + i" class="text-sm font-medium text-gray-700">{{ option.label }}</label>
                                      </div>
                                    }
                                  </div>
                                }
                                @case ('space') {
                                  <div class="w-full h-full"></div>
                                }
                                @case ('predictiveSearch') {
                                  <div class="relative">
                                    <input
                                      type="text"
                                      [id]="rowControl.name + '_' + i"
                                      [attr.data-control-name]="rowControl.name + '_' + i"
                                      [placeholder]="rowControl.placeholder || ''"
                                      (input)="onArraySearchInput($event, control.name, i, rowControl.name)"
                                      autocomplete="off"
                                      [ngClass]="getInputClasses(rowControl)">
                                    
                                    <!-- Input oculto para el valor real -->
                                    <input type="hidden" [formControlName]="rowControl.name">
                                    
                                    <!-- Resultados de la búsqueda -->
                                    @if (getArraySearchResults(control.name, i, rowControl.name) && getArraySearchResults(control.name, i, rowControl.name).length > 0) {
                                      <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                        @for (result of getArraySearchResults(control.name, i, rowControl.name); track result.id) {
                                          <div 
                                            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            (click)="selectArrayResult(control.name, i, rowControl.name, result)"
                                          >
                                            <div class="font-medium">{{ result.text }}</div>
                                            @if (result.description) {
                                              <div class="text-sm text-gray-500">{{ result.description }}</div>
                                            }
                                          </div>
                                        }
                                      </div>
                                    }
                                  </div>
                                }
                              }
                            }
                            @if (formGroup.get(rowControl.name)?.invalid && ( 
                              (formGroup.get(rowControl.name)?.touched || formGroup.get(rowControl.name)?.dirty) || 
                              formSubmitted
                            )) {
                              <div class="mt-1 text-sm text-red-600">
                                @if (getControlError(rowControl.name)) {
                                  {{ translateWithParams(getControlError(rowControl.name)!) }}
                                }
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          }
        }
        @if (formGroup.get(control.name)?.invalid && ( 
          (formGroup.get(control.name)?.touched || formGroup.get(control.name)?.dirty) || 
          formSubmitted
        )) {
          <div class="mt-1 text-sm text-red-600">
            @if (getControlError(control.name)) {
              {{ translateWithParams(getControlError(control.name)!) }}
            }
          </div>
        }
      </div>
    }
  </div>

  <button type="button" (click)="onSubmit()" 
    [ngClass]="[
        'w-full md:w-auto px-6 py-3 text-white font-medium 
        rounded-md shadow-sm transition-colors focus:outline-none 
        focus:ring-2 focus:ring-offset-2 mt-6', getButtonClass()
    ]">
    {{ config().submitText || 'Submit' | translate }}
  </button>
</form>`

export const essentialNgxTurboFormTsCode = `
import { CommonModule } from '@angular/common';
import {
  AfterViewInit, // Necesario si se mantiene initializePredictiveSearchDefaults
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnChanges, // Necesario para reaccionar a cambios de config
  output,
  SimpleChanges,
  type OnInit
} from '@angular/core';
import {
  FormArray, // Necesario si se mantiene addArrayRow aunque sea básico
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
// Importar interfaces definidas arriba o en otro fichero
// import { TurboFormConfig, TurboFormControlConfig, ValidatorConfig } from './interfaces';

@Component({
    selector: 'ngx-turbo-form',
    standalone: true, // Asumiendo standalone
    imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
    templateUrl: './ngx-turbo-form.component.html', // Referencia al HTML
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxTurboFormComponent implements OnInit, OnChanges {
  config = input.required<TurboFormConfig>();
  formSubmit = output<any>();

  formGroup!: FormGroup;
  formControls: Array<TurboFormControlConfig> = [];
  formSubmitted = false;

  // --- Mapeos Internos Esenciales ---
  private readonly ERROR_PARAM_MAP: Record<string, string> = {
    minlength: 'minLength',
    maxlength: 'maxLength',
    min: 'min',
    max: 'max',
    pattern: 'pattern',
  };

  private readonly VALIDATOR_MAP: Record<string, (value?: any) => any> = {
    required: () => Validators.required,
    minLength: (value) => Validators.minLength(value),
    maxLength: (value) => Validators.maxLength(value),
    pattern: (value) => Validators.pattern(value),
    email: () => Validators.email,
    min: (value) => Validators.min(value),
    max: (value) => Validators.max(value),
  };

  // --- Inyección de Dependencias Esenciales ---
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  // --- Ciclo de Vida y Cambios ---
  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reinicializar si la configuración cambia dinámicamente
    if (changes['config'] && !changes['config'].firstChange) {
      this.initializeForm();
      // Podrías necesitar re-inicializar valores por defecto aquí
      this.cdr.markForCheck();
    }
  }

  // --- Inicialización del Formulario ---
  private initializeForm() {
    const group: any = {};
    this.formControls = this.config().controls;

    this.formControls.forEach((control) => {
      // Omitir tipos especiales que no crean FormControl
      if (control.type === 'space' || control.type === 'titleSeparator') return;
      // Omitir array para la versión esencial (o manejarlo muy básico)
      if (control.type === 'array') return;

      const validators = this.getValidators(control);
      const defaultValue = control.defaultValue ?? '';

      group[control.name] = new FormControl(
        { value: defaultValue, disabled: !!control.disabled },
        validators
      );
    });

    this.formGroup = new FormGroup(group);
    // Se podría añadir lógica básica para FormArray si se decide incluir
  }

  private getValidators(control: TurboFormControlConfig): any[] {
    const validators = [];
    if (control.validators) {
      for (const validator of control.validators) {
        const validatorFn = this.VALIDATOR_MAP[validator.type];
        if (validatorFn) {
          validators.push(validatorFn(validator.value));
        }
      }
    }
    return validators;
  }

  // --- Envío del Formulario ---
  onSubmit() {
    this.formSubmitted = true;
    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value);
    } else {
      this.markFormGroupTouched(this.formGroup);
    }
  }

  // --- Manejo de Errores ---
  getControlError(controlName: string): string | null {
    const control = this.formGroup.get(controlName);

    if (control?.errors && (control.touched || control.dirty || this.formSubmitted)) {
      const errorKeys = Object.keys(control.errors);
      const controlConfig = this.formControls.find(c => c.name === controlName);
      if (!controlConfig?.validators) return null; // Salir si no hay config de validadores

      // Priorizar 'required'
      const requiredErrorKey = errorKeys.find(key => key === 'required');
      const errorKeyToShow = requiredErrorKey || errorKeys[0];
      
      const validatorConfig = controlConfig.validators.find(
        (v) => v.type.toLowerCase() === errorKeyToShow.toLowerCase()
      );

      if (validatorConfig) {
        const params: any = {};
        const paramName = this.ERROR_PARAM_MAP[errorKeyToShow.toLowerCase()];
        if (paramName && validatorConfig.value !== undefined) {
          params[paramName] = validatorConfig.value;
        }
        // Devolver clave y parámetros para el pipe translate
        return JSON.stringify({ key: validatorConfig.message, params });
      }
    }
    return null;
  }

  // Marca todos los controles como tocados (para mostrar errores al enviar)
  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      control.markAsDirty();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // --- Traducción y Ayudantes Template ---
  translateWithParams(message: string): string {
    try {
      const errorObj = JSON.parse(message);
      return this.translateService.instant(errorObj.key, errorObj.params);
    } catch (e) {
      // Si no es JSON, intentar traducir directamente
      return this.translateService.instant(message);
    }
  }

  isRequired(control: TurboFormControlConfig): boolean {
    return control.validators?.some((v) => v.type === 'required') || false;
  }

  // --- Métodos para Clases Dinámicas (Usados en el HTML) ---
  getThemeColor(): string {
    return this.config().color || 'indigo'; // Color por defecto
  }

  getButtonClass(): string {
    const color = this.getThemeColor();
    return \`bg-\${color}-600 hover:bg-\${color}-700\`;
  }

  getFocusRingClass(): string {
    const color = this.getThemeColor();
    return \`focus:ring-\${color}-500 focus:border-\${color}-500\`;
  }

  getInputClasses(control: TurboFormControlConfig): any {
    // Clases base comunes
    const baseClasses = [
        'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ',
        'focus:outline-none focus:ring-2 transition-colors',
        this.getFocusRingClass()
    ];
    
    // Clases específicas para checkbox/radio (simplificado)
    if (control.type === 'checkbox' || control.type === 'radio') {
      return { 
        'w-4 h-4 border-gray-300 rounded': true, 
        // Añadir clases focus/theme si es necesario para estos tipos
      }; 
    }
    
    // Añadir clase disabled si aplica
    if (this.formGroup.get(control.name)?.disabled) {
      baseClasses.push('bg-gray-100 cursor-not-allowed');
    }

    return baseClasses;
  }
}
`
