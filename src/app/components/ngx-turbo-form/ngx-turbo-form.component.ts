import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  input,
  Input,
  output,
  Output,
  type OnInit,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { User } from '../../services/user.service';
import { SearchResult } from '../../services/search.service';

export interface TurboFormControlConfig {
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

export interface TurboFormConfig {
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

export interface ValidatorConfig {
  type:
    | 'required'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'email'
    | 'min'
    | 'max';
  value?: any;
  message: string;
}

@Component({
  selector: 'ngx-turbo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './ngx-turbo-form.component.html',
  styleUrl: './ngx-turbo-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxTurboFormComponent implements OnInit, AfterViewInit {
  config = input.required<TurboFormConfig>();
  formSubmit = output<any>();

  // Evento para solicitar búsqueda
  searchRequest = output<{
    controlName: string;
    term: string;
    searchKey: string;
  }>();

  // Evento para solicitar la carga de valores por defecto
  loadDefaultValue = output<{
    controlName: string;
    id: string;
    searchKey: string;
  }>();

  formGroup!: FormGroup;
  formControls: Array<TurboFormControlConfig> = [];
  user: User | null = null;

  loading = true;
  formSubmitted = false;

  // Almacena los resultados de búsqueda para cada control
  searchResults: { [key: string]: SearchResult[] } = {};
  
  // Almacena los resultados de búsqueda para controles dentro de formArrays
  arraySearchResults: { [key: string]: SearchResult[] } = {};

  // Mapeo de tipos de error a nombres de parámetros
  private readonly ERROR_PARAM_MAP: Record<string, string> = {
    minlength: 'minLength',
    maxlength: 'maxLength',
    min: 'min',
    max: 'max',
    pattern: 'pattern',
  };

  // Mapeo de tipos de validadores a funciones de validación de Angular
  private readonly VALIDATOR_MAP: Record<string, (value?: any) => any> = {
    required: () => Validators.required,
    minLength: (value) => Validators.minLength(value),
    maxLength: (value) => Validators.maxLength(value),
    pattern: (value) => Validators.pattern(value),
    email: () => Validators.email,
    min: (value) => Validators.min(value),
    max: (value) => Validators.max(value),
  };

  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.initializeForm();

    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  ngAfterViewInit(): void {
    // Inicializar los campos de búsqueda predictiva con valores por defecto
    this.initializePredictiveSearchDefaults();
  }

  private initializeForm() {
    const group: any = {};

    // Primero creamos todos los controles
    this.config().controls.forEach((control) => {
      if (control.type === 'array') {
        group[control.name] = new FormArray([]);
      } else if (
        control.type === 'space' ||
        control.type === 'titleSeparator'
      ) {
        // Para los espacios en blanco y separadores de título, no necesitamos crear un control en el formulario
        // pero sí mantenerlos en formControls para renderizarlos
      } else {
        const validators = this.getValidators(control);
        // Usar el valor por defecto si está definido, de lo contrario usar cadena vacía
        const defaultValue =
          control.defaultValue !== undefined ? control.defaultValue : '';

        // Crear el control con el estado disabled si corresponde
        if (control.disabled) {
          group[control.name] = new FormControl(
            { value: defaultValue, disabled: true },
            validators
          );
        } else {
          group[control.name] = new FormControl(defaultValue, validators);
        }
      }
    });

    // Inicializamos el FormGroup
    this.formGroup = new FormGroup(group);
    this.formControls = this.config().controls;

    // Después de tener el FormGroup inicializado, añadimos las filas por defecto
    this.config().controls.forEach((control) => {
      if (control.type === 'array') {
        this.addArrayRow(control.name);
      }
    });
  }

  private getValidators(control: TurboFormControlConfig) {
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

  onSubmit() {
    console.log(this.formGroup.getRawValue());
    this.formSubmitted = true;
    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value);
    } else {
      // Marcar todos los controles como touched y dirty para mostrar todos los errores
      this.markFormGroupTouched(this.formGroup);
    }
  }

  getControlError(controlName: string): string | null {
    const control = this.formGroup.get(controlName);

    if (control?.errors) {
      // Mostrar errores si el campo ha sido tocado, modificado o si el formulario ha sido enviado
      if (control.touched || control.dirty || this.formSubmitted) {
        // Obtener todos los errores
        const errorKeys = Object.keys(control.errors);
        const controlConfig = this.config().controls.find(
          (c) => c.name === controlName
        );

        // Priorizar el error 'required' si existe
        if (errorKeys.includes('required')) {
          const requiredValidator = controlConfig?.validators?.find(
            (v) => v.type.toLowerCase() === 'required'
          );
          if (requiredValidator) {
            return requiredValidator.message;
          }
        }

        // Si no hay error 'required' o no se encontró el validador, mostrar el primer error
        const errorKey = errorKeys[0];
        const validator = controlConfig?.validators?.find(
          (v) => v.type.toLowerCase() === errorKey.toLowerCase()
        );

        if (validator) {
          // Preparar los parámetros para la traducción
          const params: any = {};

          // Añadir el valor del validador como parámetro según el tipo de error
          const paramName = this.ERROR_PARAM_MAP[errorKey.toLowerCase()];
          if (paramName) {
            params[paramName] = validator.value;
          }

          // Devolver el mensaje sin traducir, la traducción se hará en el template con el pipe
          // y los parámetros se pasarán como un objeto
          return JSON.stringify({ key: validator.message, params: params });
        }
      }
    }
    return null;
  }

  getInputClasses(control: TurboFormControlConfig): any {
    if (control.type === 'checkbox' || control.type === 'radio') {
      return {
        'w-4': true,
        'h-4': true,
        'border-gray-300': true,
        rounded: control.type === 'checkbox',
        'rounded-full': control.type === 'radio',
        'focus:ring-2': true,
        'focus:ring-offset-2': true,
        'focus:ring-teal-500': this.getThemeColor() === 'teal',
        'focus:ring-indigo-500': this.getThemeColor() === 'indigo',
        'focus:ring-rose-500': this.getThemeColor() === 'rose',
        'mx-auto': true,
        block: true,
      };
    } else {
      return [
        'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors',
        this.getFocusRingClass(),
      ];
    }
  }

  getThemeColor(): string {
    return this.config().color;
  }

  getButtonClass(): string {
    const color = this.getThemeColor();
    return `bg-${color}-600 hover:bg-${color}-700`;
  }

  getFocusRingClass(): string {
    const color = this.getThemeColor();
    return `focus:ring-${color}-500 focus:border-${color}-500`;
  }

  getFormArray(controlName: string): FormArray<any> {
    return this.formGroup.get(controlName) as FormArray<any>;
  }

  addArrayRow(controlName: string) {
    const control = this.formControls.find((c) => c.name === controlName);
    if (!control || !control.arrayConfig) return;

    const formArray = this.getFormArray(controlName);
    const rowGroup: Record<string, FormControl> = {};

    // Crear los controles para la fila
    control.arrayConfig.controls.forEach((rowControl) => {
      if (rowControl.type === 'space' || rowControl.type === 'titleSeparator') {
        return;
      }

      const validators = this.getValidators(rowControl);
      const defaultValue =
        rowControl.defaultValue !== undefined ? rowControl.defaultValue : '';

      // Crear el control con el estado disabled si corresponde
      if (rowControl.disabled) {
        rowGroup[rowControl.name] = new FormControl(
          { value: defaultValue, disabled: true },
          validators
        );
      } else {
        rowGroup[rowControl.name] = new FormControl(defaultValue, validators);
      }
    });

    // Añadir la fila al FormArray
    formArray.push(new FormGroup(rowGroup));
  }

  removeArrayRow(controlName: string, index: number) {
    const formArray = this.getFormArray(controlName);
    formArray.removeAt(index);
  }

  getArrayRowControls(
    arrayConfig: TurboFormControlConfig['arrayConfig']
  ): TurboFormControlConfig[] {
    return arrayConfig?.controls || [];
  }

  getArrayControlError(
    arrayName: string,
    index: number,
    controlName: string
  ): string | null {
    const formArray = this.getFormArray(arrayName);
    const group = formArray.at(index) as FormGroup;
    const control = group?.get(controlName);

    if (control?.errors) {
      // Mostrar errores si el campo ha sido tocado, modificado o si el formulario ha sido enviado
      if (control.touched || control.dirty || this.formSubmitted) {
        // Obtener todos los errores
        const errorKeys = Object.keys(control.errors);
        const arrayConfig = this.config().controls.find(
          (c) => c.name === arrayName
        )?.arrayConfig;
        const controlConfig = arrayConfig?.controls.find(
          (c) => c.name === controlName
        );

        // Priorizar el error 'required' si existe
        if (errorKeys.includes('required')) {
          const requiredValidator = controlConfig?.validators?.find(
            (v) => v.type.toLowerCase() === 'required'
          );
          if (requiredValidator) {
            return requiredValidator.message;
          }
        }

        // Si no hay error 'required' o no se encontró el validador, mostrar el primer error
        const errorKey = errorKeys[0];
        const validator = controlConfig?.validators?.find(
          (v) => v.type.toLowerCase() === errorKey.toLowerCase()
        );

        if (validator) {
          // Preparar los parámetros para la traducción
          const params: any = {};

          // Añadir el valor del validador como parámetro según el tipo de error
          const paramName = this.ERROR_PARAM_MAP[errorKey.toLowerCase()];
          if (paramName) {
            params[paramName] = validator.value;
          }

          // Devolver el mensaje sin traducir, la traducción se hará en el template con el pipe
          // y los parámetros se pasarán como un objeto
          return JSON.stringify({ key: validator.message, params: params });
        }
      }
    }
    return null;
  }

  isRequired(control: TurboFormControlConfig): boolean {
    return control.validators?.some((v) => v.type === 'required') || false;
  }

  // Método recursivo para marcar todos los controles como touched y dirty
  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormControl) {
        control.markAsTouched();
        control.markAsDirty();
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Método para traducir mensajes con parámetros
  translateWithParams(message: string): string {
    try {
      const errorObj = JSON.parse(message);
      return this.translateService.instant(errorObj.key, errorObj.params);
    } catch (e) {
      return this.translateService.instant(message);
    }
  }

  // Método para manejar el evento input en la búsqueda predictiva
  onSearchInput(event: Event, controlName: string): void {
    const inputElement = event.target as HTMLInputElement;
    const term = inputElement.value;

    // Cuando el usuario escribe, el valor del control debe ser null
    const formControl = this.formGroup.get(controlName);
    if (formControl) {
      formControl.setValue(null);
    }

    // Obtener la configuración del control
    const control = this.formControls.find((c) => c.name === controlName);
    if (!control) return;

    // Obtener la clave de búsqueda (si no existe, usar el nombre del control)
    const searchKey = control.searchConfig?.searchKey || controlName;

    // Verificar longitud mínima
    const minLength = control.searchConfig?.minLength || 2;
    if (!term || term.length < minLength) {
      this.searchResults[controlName] = [];
      return;
    }

    // Emitir evento de búsqueda
    this.searchRequest.emit({ controlName, term, searchKey });
  }

  // Método para seleccionar un resultado
  selectResult(controlName: string, result: SearchResult): void {
    const control = this.formControls.find((c) => c.name === controlName);
    if (!control) return;

    const valueField = control.searchConfig?.valueField || 'id';

    // Obtener el valor real (ID)
    const realValue = result[valueField as keyof SearchResult];

    // Establecer el valor en el formulario (guardamos el ID)
    const formControl = this.formGroup.get(controlName);
    if (formControl) {
      // Guardar el ID en el control
      formControl.setValue(realValue);
      formControl.markAsTouched();
      formControl.markAsDirty();
    }

    // Actualizar el texto mostrado en el input
    const inputElement = document.getElementById(
      controlName
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = result.text;
    }

    // Limpiar los resultados
    this.searchResults[controlName] = [];
  }

  // Método para establecer los resultados de búsqueda (llamado desde el componente padre)
  setSearchResults(controlName: string, results: SearchResult[]): void {
    this.searchResults[controlName] = results;
    this.cdr.detectChanges();
  }

  /**
   * Inicializa los campos de búsqueda predictiva con valores por defecto
   */
  private initializePredictiveSearchDefaults(): void {
    // Recorrer los controles y buscar campos de búsqueda predictiva con valores por defecto
    this.formControls.forEach((control) => {
      // Inicializar campos de búsqueda predictiva normales
      if (control.type === 'predictiveSearch' && control.defaultValue) {
        const searchKey = control.searchConfig?.searchKey || control.name;

        console.log(`Inicializando valor por defecto para campo normal ${control.name}: ${control.defaultValue}`);
        
        // Emitir evento para cargar el valor por defecto
        this.loadDefaultValue.emit({
          controlName: control.name,
          id: control.defaultValue.toString(),
          searchKey,
        });
      }
      
      // Inicializar campos de búsqueda predictiva dentro de formArrays
      if (control.type === 'array' && control.arrayConfig) {
        const formArray = this.getFormArray(control.name);
        
        // Para cada fila del formArray
        for (let rowIndex = 0; rowIndex < formArray.length; rowIndex++) {
          // Recorrer los controles de la fila
          control.arrayConfig.controls.forEach(rowControl => {
            if (rowControl.type === 'predictiveSearch' && rowControl.defaultValue) {
              const searchKey = rowControl.searchConfig?.searchKey || rowControl.name;
              const uniqueKey = `${control.name}_${rowIndex}_${rowControl.name}`;
              
              console.log(`Inicializando valor por defecto para campo en formArray ${uniqueKey}: ${rowControl.defaultValue}`);
              
              // Emitir evento para cargar el valor por defecto
              this.loadDefaultValue.emit({
                controlName: uniqueKey,
                id: rowControl.defaultValue.toString(),
                searchKey,
              });
            }
          });
        }
      }
    });
  }

  /**
   * Establece el valor por defecto para un campo de búsqueda predictiva
   * @param controlName Nombre del control
   * @param result Resultado a establecer como valor por defecto
   */
  setDefaultSearchValue(controlName: string, result: SearchResult): void {
    console.log(`Estableciendo valor por defecto para ${controlName}:`, result);
    
    // Verificar si es un control dentro de un formArray
    if (controlName.includes('_')) {
      // Es un control dentro de un formArray
      const parts = controlName.split('_');
      if (parts.length >= 3) {
        const arrayName = parts[0];
        const rowIndex = parseInt(parts[1]);
        const rowControlName = parts[2];
        
        console.log(`Control en formArray: array=${arrayName}, row=${rowIndex}, control=${rowControlName}`);
        
        // Obtener la configuración del control
        const arrayConfig = this.formControls.find(c => c.name === arrayName)?.arrayConfig;
        if (!arrayConfig) {
          console.error(`FormArray ${arrayName} no encontrado`);
          return;
        }
        
        const rowControl = arrayConfig.controls.find(c => c.name === rowControlName);
        if (!rowControl) {
          console.error(`Control ${rowControlName} no encontrado en formArray ${arrayName}`);
          return;
        }
        
        const valueField = rowControl.searchConfig?.valueField || 'id';
        
        // Establecer el valor en el formulario
        const formArray = this.getFormArray(arrayName);
        if (rowIndex >= formArray.length) {
          console.error(`Índice ${rowIndex} fuera de rango para formArray ${arrayName}`);
          return;
        }
        
        const formGroup = formArray.at(rowIndex) as FormGroup;
        const formControl = formGroup.get(rowControlName);
        
        if (!formControl) {
          console.error(`FormControl ${rowControlName} no encontrado en formGroup`);
          return;
        }
        
        // Establecer el ID como valor del control
        const realValue = result[valueField as keyof SearchResult];
        console.log(`Estableciendo valor ${realValue} para ${controlName}`);
        formControl.setValue(realValue);
        
        // Actualizar el texto mostrado en el input
        setTimeout(() => {
          const inputElement = document.getElementById(`${rowControlName}_${rowIndex}`) as HTMLInputElement;
          if (inputElement) {
            console.log(`Estableciendo texto "${result.text}" en input ${rowControlName}_${rowIndex}`);
            inputElement.value = result.text;
          } else {
            console.error(`Elemento input con id ${rowControlName}_${rowIndex} no encontrado`);
          }
          
          // Forzar la detección de cambios
          this.cdr.detectChanges();
        }, 0);
      }
    } else {
      // Es un control normal
      // Obtener el control
      const control = this.formControls.find(c => c.name === controlName);
      if (!control) {
        console.error(`Control ${controlName} no encontrado`);
        return;
      }
      
      // Obtener el campo de valor
      const valueField = control.searchConfig?.valueField || 'id';
      
      // Establecer el valor en el formulario
      const formControl = this.formGroup.get(controlName);
      if (!formControl) {
        console.error(`FormControl ${controlName} no encontrado`);
        return;
      }
      
      // Establecer el ID como valor del control
      const realValue = result[valueField as keyof SearchResult];
      console.log(`Estableciendo valor ${realValue} para ${controlName}`);
      formControl.setValue(realValue);
      
      // Actualizar el texto mostrado en el input
      setTimeout(() => {
        const inputElement = document.getElementById(controlName) as HTMLInputElement;
        if (inputElement) {
          console.log(`Estableciendo texto "${result.text}" en input ${controlName}`);
          inputElement.value = result.text;
        } else {
          console.error(`Elemento input con id ${controlName} no encontrado`);
        }
        
        // Forzar la detección de cambios
        this.cdr.detectChanges();
      }, 0);
    }
  }

  /**
   * Maneja el evento input en la búsqueda predictiva dentro de un formArray
   */
  onArraySearchInput(event: Event, arrayName: string, rowIndex: number, controlName: string): void {
    const inputElement = event.target as HTMLInputElement;
    const term = inputElement.value;
    
    // Generar una clave única para este control en este formArray
    const uniqueKey = `${arrayName}_${rowIndex}_${controlName}`;
    
    // Cuando el usuario escribe, el valor del control debe ser null
    const formArray = this.getFormArray(arrayName);
    const formGroup = formArray.at(rowIndex) as FormGroup;
    const formControl = formGroup.get(controlName);
    
    if (formControl) {
      formControl.setValue(null);
    }
    
    // Obtener la configuración del control
    const arrayConfig = this.formControls.find(c => c.name === arrayName)?.arrayConfig;
    if (!arrayConfig) return;
    
    const rowControl = arrayConfig.controls.find(c => c.name === controlName);
    if (!rowControl) return;
    
    // Obtener la clave de búsqueda (si no existe, usar el nombre del control)
    const searchKey = rowControl.searchConfig?.searchKey || controlName;
    
    // Verificar longitud mínima
    const minLength = rowControl.searchConfig?.minLength || 2;
    if (!term || term.length < minLength) {
      this.arraySearchResults[uniqueKey] = [];
      return;
    }
    
    // Emitir evento de búsqueda con información adicional del formArray
    this.searchRequest.emit({
      controlName: uniqueKey,
      term,
      searchKey
    });
  }
  
  /**
   * Obtiene los resultados de búsqueda para un control dentro de un formArray
   */
  getArraySearchResults(arrayName: string, rowIndex: number, controlName: string): SearchResult[] {
    const uniqueKey = `${arrayName}_${rowIndex}_${controlName}`;
    return this.arraySearchResults[uniqueKey] || [];
  }
  
  /**
   * Selecciona un resultado para un control dentro de un formArray
   */
  selectArrayResult(arrayName: string, rowIndex: number, controlName: string, result: SearchResult): void {
    const uniqueKey = `${arrayName}_${rowIndex}_${controlName}`;
    
    // Obtener la configuración del control
    const arrayConfig = this.formControls.find(c => c.name === arrayName)?.arrayConfig;
    if (!arrayConfig) return;
    
    const rowControl = arrayConfig.controls.find(c => c.name === controlName);
    if (!rowControl) return;
    
    const valueField = rowControl.searchConfig?.valueField || 'id';
    
    // Obtener el valor real (ID)
    const realValue = result[valueField as keyof SearchResult];
    
    // Establecer el valor en el formulario
    const formArray = this.getFormArray(arrayName);
    const formGroup = formArray.at(rowIndex) as FormGroup;
    const formControl = formGroup.get(controlName);
    
    if (formControl) {
      // Guardar el ID en el control
      formControl.setValue(realValue);
      formControl.markAsTouched();
      formControl.markAsDirty();
    }
    
    // Actualizar el texto mostrado en el input
    const inputElement = document.getElementById(`${controlName}_${rowIndex}`) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = result.text;
    }
    
    // Limpiar los resultados
    this.arraySearchResults[uniqueKey] = [];
  }
  
  /**
   * Establece los resultados de búsqueda para un control dentro de un formArray
   */
  setArraySearchResults(uniqueKey: string, results: SearchResult[]): void {
    this.arraySearchResults[uniqueKey] = results;
    this.cdr.detectChanges();
  }
}
