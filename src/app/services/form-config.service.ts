import { Injectable, signal, WritableSignal, effect, computed } from '@angular/core';
import { TurboFormConfig } from '../components/ngx-turbo-form/ngx-turbo-form.component';

@Injectable({
  providedIn: 'root'
})
export class FormConfigService {
  // Signal para almacenar la configuración del formulario
  private formConfigSignal: WritableSignal<TurboFormConfig | null> = signal(null);

  // Configuración por defecto (opcional)
  private defaultConfig: TurboFormConfig = {
    color: 'orange',
    submitText: 'Enviar',
    controls: [] // Podemos dejarlo vacío o poner algunos controles por defecto
  };

  constructor() {
    // Logging para desarrollo
    effect(() => {
      console.log('FormConfig actualizado:', this.formConfigSignal());
    });
  }

  // Método para actualizar la configuración
  updateFormConfig(config: TurboFormConfig): void {
    this.formConfigSignal.set(config);
  }

  // Método para obtener la configuración actual o la por defecto
  getFormConfig(): WritableSignal<TurboFormConfig | null> {
    return this.formConfigSignal;
  }

  // Método para obtener la configuración actual o la por defecto (computed signal)
  // Este puede ser útil para evitar null checks
  getCurrentConfig() {
    return computed(() => this.formConfigSignal() || this.defaultConfig);
  }

  // Método para resetear la configuración
  resetFormConfig(): void {
    this.formConfigSignal.set(null);
  }
} 