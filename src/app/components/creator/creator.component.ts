import { ChangeDetectionStrategy, Component, OnInit, inject, signal, WritableSignal, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TurboFormControlConfig, TurboFormConfig, NgxTurboFormComponent } from '../ngx-turbo-form/ngx-turbo-form.component';
import { FormConfigService } from '../../services/form-config.service';
import { SearchService, SearchResult } from '../../services/search.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Highlight } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

const ALL_CONTROL_TYPES: TurboFormControlConfig['type'][] = [
  'text', 'email', 'password', 'number', 'textarea', 'select',
  'checkbox', 'radio', 'date', 'space', 'titleSeparator',
  'predictiveSearch', 'array'
];

@Component({
  selector: 'app-creator',
  standalone: true,
  imports: [
    TranslatePipe,
    CommonModule,
    ReactiveFormsModule,
    NgxTurboFormComponent,
    Highlight,
    HighlightLineNumbers
  ],
  templateUrl: './creator.component.html',
  styles: [
    `:host { display: block; }`,
    `pre { max-height: 400px; overflow-y: auto; }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('previewForm') previewFormComponent!: NgxTurboFormComponent;

  private fb = inject(FormBuilder);
  private formConfigService = inject(FormConfigService);
  private searchService = inject(SearchService);

  controlForm!: FormGroup;

  createdControls: TurboFormControlConfig[] = [];

  previewFormConfig: WritableSignal<TurboFormConfig> = signal({
    color: 'indigo',
    submitText: 'Vista Previa Enviar',
    controls: []
  });

  private searchTerms = new Subject<{ controlName: string; term: string; searchKey: string; }>();
  private destroy$ = new Subject<void>();
  private pendingDefaultValues: { controlName: string; id: string; searchKey: string; }[] = [];

  availableControlTypes = ALL_CONTROL_TYPES;

  ngOnInit(): void {
    this.initializeForm();

    this.controlForm.get('type')?.valueChanges.subscribe(type => {
      this.updateFormBasedOnType(type);
    });

    this.setupSearchObservable();
  }

  ngAfterViewInit(): void {
    this.processPendingDefaultValues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchTerms.complete();
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
      options: this.fb.array([]),
      searchConfig: this.fb.group({ 
        displayField: ['text'],
        valueField: ['id'],
        minLength: [2, Validators.min(1)],
        searchKey: ['']
      }),
      arrayConfig: this.fb.group({ 
        addButtonText: ['Añadir Fila'],
        removeButtonText: ['Eliminar'],
      })
    });
    this.updateFormBasedOnType(null);
  }

  updateFormBasedOnType(type: TurboFormControlConfig['type'] | null): void {
    const fieldsToReset = ['placeholder', 'defaultValue', 'required', 'disabled'];
    const commonFields = ['label', 'name', 'colspanDesktop', 'colspanMobile'];
    const optionsArray = this.controlForm.get('options') as FormArray;
    const searchConfigGroup = this.controlForm.get('searchConfig') as FormGroup;
    const arrayConfigGroup = this.controlForm.get('arrayConfig') as FormGroup;

    if (!type || type === 'space' || type === 'titleSeparator') {
      commonFields.forEach(fieldName => this.controlForm.get(fieldName)?.disable());
      fieldsToReset.forEach(fieldName => this.controlForm.get(fieldName)?.disable());
      optionsArray.disable();
      searchConfigGroup.disable();
      arrayConfigGroup.disable();
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

    if (type === 'select' || type === 'radio') {
      optionsArray.enable();
      if (optionsArray.length === 0) {
        this.addOption();
      }
    } else {
      optionsArray.disable();
      optionsArray.clear();
    }

    if (type === 'predictiveSearch') {
      searchConfigGroup.enable();
      this.controlForm.get('placeholder')?.enable();
      this.controlForm.get('defaultValue')?.enable();
    } else {
      searchConfigGroup.disable();
    }

    if (type === 'array') {
      arrayConfigGroup.enable();
      fieldsToReset.forEach(fieldName => this.controlForm.get(fieldName)?.disable());
    } else {
      arrayConfigGroup.disable();
    }

    if (type === 'space' || type === 'titleSeparator' || type === 'array' || type === 'predictiveSearch') {
       this.controlForm.get('required')?.disable();
       this.controlForm.get('required')?.reset(false);
    }
     if (type === 'array') {
       this.controlForm.get('disabled')?.disable();
       this.controlForm.get('disabled')?.reset(false);
     }
     if (type === 'predictiveSearch') {
       this.controlForm.get('disabled')?.enable();
       this.controlForm.get('required')?.enable();
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
      };

       if (formValue.label || (formValue.type !== 'space')) {
            newControlConfig.label = formValue.label;
       }
       if (formValue.name) {
            newControlConfig.name = formValue.name;
       }
       if (formValue.placeholder) {
           newControlConfig.placeholder = formValue.placeholder;
       }
       if (formValue.colspanDesktop && +formValue.colspanDesktop !== 6) {
           newControlConfig.colspanDesktop = +formValue.colspanDesktop;
       }
       if (formValue.colspanMobile && +formValue.colspanMobile !== 12) {
           newControlConfig.colspanMobile = +formValue.colspanMobile;
       }
        if (formValue.disabled) {
            newControlConfig.disabled = true;
        }

      if (formValue.required && formValue.type !== 'space' && formValue.type !== 'titleSeparator') {
        newControlConfig.validators = [{ type: 'required', message: 'validators.required' }];
      }

      if ((formValue.type === 'select' || formValue.type === 'radio') && formValue.options.length > 0) {
        newControlConfig.options = formValue.options.map((opt: {value: any, label: string}) => ({
            value: this.parseValue(opt.value),
            label: opt.label
        }));
      }

      if (formValue.defaultValue !== '' && formValue.defaultValue !== null) {
          if (formValue.type === 'checkbox') {
              const boolValue = String(formValue.defaultValue).toLowerCase() === 'true';
              if (boolValue) {
                   newControlConfig.defaultValue = true;
              }
          } else if (formValue.type !== 'space' && formValue.type !== 'titleSeparator') {
             newControlConfig.defaultValue = this.parseValue(formValue.defaultValue);
          }
      }

      if (formValue.type === 'space' || formValue.type === 'titleSeparator') {
        delete newControlConfig.placeholder;
        delete newControlConfig.defaultValue;
        delete newControlConfig.validators;
        delete newControlConfig.disabled;
        delete newControlConfig.options;
        delete newControlConfig.colspanDesktop;
        delete newControlConfig.colspanMobile;
         if (formValue.type === 'space' || !formValue.label) {
          delete newControlConfig.label;
        }
         if (!formValue.name) {
             delete newControlConfig.name;
         }
      }

      if (formValue.type === 'predictiveSearch' && formValue.searchConfig) {
         const searchConf = formValue.searchConfig;
         newControlConfig.searchConfig = {};
         if (searchConf.displayField && searchConf.displayField !== 'text') newControlConfig.searchConfig.displayField = searchConf.displayField;
         if (searchConf.valueField && searchConf.valueField !== 'id') newControlConfig.searchConfig.valueField = searchConf.valueField;
         if (searchConf.minLength && +searchConf.minLength !== 2) newControlConfig.searchConfig.minLength = +searchConf.minLength;
         if (searchConf.searchKey) newControlConfig.searchConfig.searchKey = searchConf.searchKey;
         if (Object.keys(newControlConfig.searchConfig).length === 0) {
           delete newControlConfig.searchConfig;
         }
      }

      if (formValue.type === 'array' && formValue.arrayConfig) {
        const arrayConf = formValue.arrayConfig;
        newControlConfig.arrayConfig = {
          controls: [
            {
              type: 'text',
              label: 'Campo en Array',
              name: 'arrayInput',
              placeholder: 'Valor...',
              colspanDesktop: 12,
              colspanMobile: 12
            }
          ]
        };
        if (arrayConf.addButtonText && arrayConf.addButtonText !== 'Añadir Fila') newControlConfig.arrayConfig.addButtonText = arrayConf.addButtonText;
        if (arrayConf.removeButtonText && arrayConf.removeButtonText !== 'Eliminar') newControlConfig.arrayConfig.removeButtonText = arrayConf.removeButtonText;
      }

      this.createdControls.push(newControlConfig as TurboFormControlConfig);
       this.controlForm.reset({
            type: null, label: '', name: '', placeholder: '', defaultValue: '',
            colspanDesktop: 6, colspanMobile: 12, disabled: false, required: false,
       });
       this.options.clear();
       this.updateFormBasedOnType(null);

       this.previewFormConfig.update(config => ({
         ...config,
         controls: [...this.createdControls]
       }));

    } else {
      this.controlForm.markAllAsTouched();
      console.error("Formulario inválido", this.controlForm.errors, this.controlForm.value);
    }
  }

  getGeneratedConfigObject(): TurboFormConfig {
    return {
        color: 'orange',
        submitText: 'Enviar',
        controls: this.createdControls
    };
  }

  applyConfigToForm(): void {
    const config = this.getGeneratedConfigObject();
    this.formConfigService.updateFormConfig(config);
    console.log('Configuración aplicada al formulario.');
  }

  private parseValue(value: any): any {
      if (typeof value !== 'string') return value;
      const trimmedValue = value.trim();
      if (trimmedValue.toLowerCase() === 'true') return true;
      if (trimmedValue.toLowerCase() === 'false') return false;
      if (trimmedValue !== '' && !isNaN(Number(trimmedValue))) {
          if (trimmedValue === Number(trimmedValue).toString()) {
             return Number(trimmedValue);
          }
      }
      return value;
  }

   getGeneratedConfigTypeScript(): string {
    const fullConfig: TurboFormConfig = {
        color: 'orange',
        submitText: 'Enviar',
        controls: this.createdControls
    };

    let tsString = JSON.stringify(fullConfig, null, 2);

    tsString = tsString.replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)":\s*/g, '$1: ');

    tsString = tsString.replace(/:\s*"((?:\\.|[^"\\])*)"/g, (match, group1) => {
        const singleQuotedValue = group1.replace(/\\"/g, '"').replace(/'/g, "\\'");
        return `: '${singleQuotedValue}'`;
    });

    return `export const formConfig: TurboFormConfig = ${tsString};`;
   }

   handleSearchRequest(event: {controlName: string, term: string, searchKey: string}): void {
    console.log(`[Creator Preview] Búsqueda solicitada:`, event);
    this.searchTerms.next(event);
  }

  handleLoadDefaultValue(event: { controlName: string; id: string; searchKey: string; }): void {
     console.log(`[Creator Preview] Carga valor defecto solicitada:`, event);
    if (this.previewFormComponent) {
      this.loadDefaultValue(event);
    } else {
      this.pendingDefaultValues.push(event);
    }
  }

  onSubmitPreview(formData: any): void {
    console.log('[Creator Preview] Formulario enviado:', formData);
  }

  private setupSearchObservable(): void {
    this.searchTerms.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => 
        prev.controlName === curr.controlName && 
        prev.term === curr.term && 
        prev.searchKey === curr.searchKey
      ),
      switchMap(({ controlName, term, searchKey }) => {
        console.log(`[Creator Preview] Ejecutando búsqueda para ${controlName} con término "${term}"`);
        return this.searchService.search(term).pipe(
          switchMap(results => {
            if (this.previewFormComponent) {
              if (controlName.includes('_')) {
                this.previewFormComponent.setArraySearchResults(controlName, results);
              } else {
                this.previewFormComponent.setSearchResults(controlName, results);
              }
            }
            return [];
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private loadDefaultValue(event: { controlName: string; id: string; searchKey: string; }): void {
    const { controlName, id, searchKey } = event;
    console.log(`[Creator Preview] Cargando valor por defecto para ${controlName} con ID "${id}"`);
    this.searchService.getById(id).subscribe({
      next: (result) => {
        if (result && this.previewFormComponent) {
          this.previewFormComponent.setDefaultSearchValue(controlName, result);
        }
      },
      error: (error) => {
        console.error(`[Creator Preview] Error al cargar valor por defecto para ${controlName}:`, error);
      },
    });
  }

  private processPendingDefaultValues(): void {
    if (this.pendingDefaultValues.length > 0 && this.previewFormComponent) {
      this.pendingDefaultValues.forEach((event) => {
        this.loadDefaultValue(event);
      });
      this.pendingDefaultValues = [];
    }
  }

}
