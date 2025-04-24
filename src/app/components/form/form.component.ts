import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  NgxTurboFormComponent,
  TurboFormConfig,
} from '../ngx-turbo-form/ngx-turbo-form.component';
import { FormControl } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

@Component({
    selector: 'app-form',
    imports: [NgxTurboFormComponent, TranslatePipe],
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(NgxTurboFormComponent) formComponent!: NgxTurboFormComponent;

  formConfig!: TurboFormConfig;

  // Subject para manejar las solicitudes de búsqueda con debounce
  private searchTerms = new Subject<{
    controlName: string;
    term: string;
    searchKey: string;
  }>();
  // Subject para manejar la destrucción del componente
  private destroy$ = new Subject<void>();

  // Cola de valores por defecto pendientes de cargar
  private pendingDefaultValues: {
    controlName: string;
    id: string;
    searchKey: string;
  }[] = [];

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.formConfig = {
      color: 'orange',
      submitText: 'Enviar',
      controls: [
        {
          type: 'email',
          label: 'Email',
          name: 'email',
          disabled: true,
          placeholder: 'Ingrese su email',
          colspanDesktop: 4,
          colspanMobile: 12,
          validators: [{ type: 'email', message: 'validators.email' }],
        },
        {
          type: 'text',
          label: 'Horas',
          name: 'hours',
          placeholder: 'Ingrese sus horas',
          colspanDesktop: 4,
          colspanMobile: 12,
          validators: [{ type: 'min', value: 10, message: 'validators.min' }],
        },
        {
          type: 'titleSeparator',
          label: 'Información Personal',
          name: 'personalInfoSeparator',
          colspanDesktop: 12,
          colspanMobile: 12,
        },
        {
          type: 'textarea',
          label: 'Dirección',
          name: 'address',
          placeholder: 'Ingrese su dirección completa',
          colspanDesktop: 12,
          colspanMobile: 12,
          validators: [{ type: 'required', message: 'validators.required' }],
        },
        {
          type: 'predictiveSearch',
          label: 'Ciudad',
          name: 'city',
          placeholder: 'Buscar ciudad...',
          colspanDesktop: 6,
          colspanMobile: 12,
          defaultValue: '1',
          validators: [{ type: 'required', message: 'validators.required' }],
          searchConfig: {
            displayField: 'text',
            valueField: 'id',
            minLength: 2,
            searchKey: 'cities',
          },
        },
        {
          type: 'text',
          label: 'Código Postal',
          name: 'postalCode',
          placeholder: 'Ingrese su código postal',
          colspanDesktop: 3,
          colspanMobile: 6,
          validators: [
            { type: 'required', message: 'El código postal es requerido' },
          ],
        },
        {
          type: 'select',
          label: 'País',
          name: 'country',
          colspanDesktop: 3,
          colspanMobile: 6,
          defaultValue: 'es',
          options: [
            { value: 'es', label: 'España' },
            { value: 'fr', label: 'Francia' },
            { value: 'pt', label: 'Portugal' },
          ],
          validators: [{ type: 'required', message: 'El país es requerido' }],
        },
        {
          type: 'checkbox',
          label: 'Acepto términos y condiciones',
          name: 'terms',
          colspanDesktop: 2,
          colspanMobile: 1,
        },
        {
          type: 'checkbox',
          label: 'Acepto términos y condiciones',
          name: 'terms2',
          colspanDesktop: 2,
          colspanMobile: 1,
        },
        {
          type: 'checkbox',
          label: 'Acepto términos y condiciones',
          name: 'terms3',
          colspanDesktop: 2,
          colspanMobile: 1,
        },
        {
          type: 'checkbox',
          label: 'Acepto términos y condiciones',
          name: 'terms4',
          colspanDesktop: 2,
          colspanMobile: 1,
        },
        {
          type: 'date',
          label: 'Fecha de nacimiento',
          name: 'birthDate',
          defaultValue: '2025-01-01',
          colspanDesktop: 4,
          colspanMobile: 6,
        },
        {
          type: 'radio',
          label: 'Género',
          name: 'gender',
          colspanDesktop: 4,
          colspanMobile: 12,
          options: [
            { value: 'male', label: 'Masculino' },
            { value: 'female', label: 'Femenino' },
            { value: 'other', label: 'Otro' },
          ],
          validators: [
            { type: 'required', message: 'Por favor seleccione un género' },
          ],
        },
        {
          type: 'radio',
          label: 'Método de contacto preferido',
          name: 'contactMethod',
          colspanDesktop: 4,
          colspanMobile: 12,
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Teléfono' },
            { value: 'whatsapp', label: 'WhatsApp' },
          ],
          validators: [
            {
              type: 'required',
              message: 'Por favor seleccione un método de contacto',
            },
          ],
        },
        {
          type: 'radio',
          label: 'Rango de edad',
          name: 'ageRange',
          colspanDesktop: 4,
          colspanMobile: 12,
          options: [
            { value: '18-25', label: '18-25 años' },
            { value: '26-35', label: '26-35 años' },
            { value: '36-45', label: '36-45 años' },
            { value: '46+', label: '46+ años' },
          ],
          validators: [
            {
              type: 'required',
              message: 'Por favor seleccione un rango de edad',
            },
          ],
        },
        {
          type: 'array',
          label: 'Experiencia Laboral',
          name: 'workExperience',
          colspanDesktop: 12,
          colspanMobile: 12,
          arrayConfig: {
            addButtonText: 'Añadir Experiencia',
            removeButtonText: 'Eliminar',
            controls: [
              {
                type: 'text',
                label: 'Empresa',
                name: 'company',
                placeholder: 'Nombre de la empresa',
                colspanDesktop: 3,
                validators: [
                  { type: 'required', message: 'La empresa es requerida' },
                ],
              },
              {
                type: 'text',
                label: 'Cargo',
                name: 'position',
                placeholder: 'Tu cargo en la empresa',
                colspanDesktop: 3,
                validators: [
                  { type: 'required', message: 'El cargo es requerido' },
                ],
              },
              {
                type: 'date',
                label: 'Fecha de inicio',
                name: 'startDate',
                colspanDesktop: 6,
                validators: [
                  {
                    type: 'required',
                    message: 'La fecha de inicio es requerida',
                  },
                ],
              },
              {
                type: 'date',
                label: 'Fecha de fin',
                name: 'endDate',
                colspanDesktop: 12,
              },
            ],
          },
        },
        {
          type: 'array',
          label: 'Preferencias',
          name: 'preferences',
          colspanDesktop: 12,
          colspanMobile: 12,
          arrayConfig: {
            addButtonText: 'Añadir Preferencia',
            removeButtonText: 'Eliminar',
            controls: [
                {
                    type: 'predictiveSearch',
                    label: 'Ciudad',
                    name: 'city',
                    placeholder: 'Buscar ciudad...',
                    colspanDesktop: 12,
                    colspanMobile: 12,
                    defaultValue: '1',
                    validators: [{ type: 'required', message: 'validators.required' }],
                    searchConfig: {
                      displayField: 'text',
                      valueField: 'id',
                      minLength: 2,
                      searchKey: 'cities',
                    },
                  }
            ],
          },
        },
        {
          type: 'space',
          label: '',
          name: 'space1',
          colspanDesktop: 8,
          colspanMobile: 6,
        },
        {
          type: 'text',
          label: 'Teléfono',
          name: 'phone',
          placeholder: '+34 123 456 789',
          colspanDesktop: 4,
          colspanMobile: 6,
        },
      ],
    };

    // Configurar el observable para las búsquedas
    this.setupSearchObservable();
  }

  ngAfterViewInit(): void {
    // Procesar los valores por defecto pendientes
    this.processPendingDefaultValues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchTerms.complete();
  }

  /**
   * Maneja la solicitud de búsqueda
   */
  handleSearchRequest(event: {controlName: string, term: string, searchKey: string}): void {
    const { controlName, term, searchKey } = event;
    
    // Enviar la solicitud al subject para aplicar el debounce
    this.searchTerms.next(event);
  }

  onSubmit(formData: any) {
    console.log('Formulario enviado:', formData); // Solo se mostrará si el formulario en el componente hijo es valido
  }

  /**
   * Configura el observable para manejar las solicitudes de búsqueda con debounce
   */
  private setupSearchObservable(): void {
    this.searchTerms.pipe(
      // Esperar 500ms después de cada solicitud
      debounceTime(500),
      // Ignorar si la solicitud no ha cambiado
      distinctUntilChanged((prev, curr) => 
        prev.controlName === curr.controlName && 
        prev.term === curr.term && 
        prev.searchKey === curr.searchKey
      ),
      // Cambiar al observable de búsqueda
      switchMap(({ controlName, term, searchKey }) => {        
        // Segun el searchKey, se usa un servicio u otro
        return this.searchService.search(term).pipe(
          // Mapear los resultados para incluir el nombre del control
          switchMap(results => {
            // Enviar los resultados de vuelta al componente del formulario
            if (this.formComponent) {
              // Verificar si es una búsqueda de un control dentro de un formArray
              if (controlName.includes('_')) {
                // Es un control dentro de un formArray
                this.formComponent.setArraySearchResults(controlName, results);
              } else {
                // Es un control normal
                this.formComponent.setSearchResults(controlName, results);
              }
            }
            return [];
          })
        );
      }),
      // Cancelar la suscripción cuando el componente se destruye
      takeUntil(this.destroy$)
    ).subscribe();
  }

  // Procesa los valores por defecto pendientes
  private processPendingDefaultValues(): void {
    if (this.pendingDefaultValues.length > 0 && this.formComponent) {

      this.pendingDefaultValues.forEach((event) => {
        this.loadDefaultValue(event);
      });

      this.pendingDefaultValues = [];
    }
  }

  // Cargar un valor por defecto
  private loadDefaultValue(event: {
    controlName: string;
    id: string;
    searchKey: string;
  }): void {
    const { controlName, id, searchKey } = event;
    // Obtener el resultado por ID
    this.searchService.getById(id).subscribe({
      next: (result) => {
        if (result && this.formComponent) {
          // Establecer el resultado en el componente hijo
          this.formComponent.setDefaultSearchValue(controlName, result);
        }
      },
      error: (error) => {
        console.error(
          `Error al cargar el valor por defecto para ${controlName}:`,
          error
        );
      },
    });
  }

  // Maneja la solicitud de carga de valores por defecto para campos de búsqueda predictiva
  handleLoadDefaultValue(event: {
    controlName: string;
    id: string;
    searchKey: string;
  }): void {
    if (this.formComponent) {
      // Si el componente hijo ya está disponible, cargar el valor por defecto
      this.loadDefaultValue(event);
    } else {
      // Si el componente hijo aún no está disponible, añadir a la cola de pendientes
      this.pendingDefaultValues.push(event);
    }
  }
}
