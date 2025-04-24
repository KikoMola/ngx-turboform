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
