import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SearchResult {
  id: string;
  text: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // Datos mockeados para la búsqueda
  private mockData: SearchResult[] = [
    { id: '1', text: 'Madrid', description: 'Capital de España' },
    { id: '2', text: 'Barcelona', description: 'Ciudad en Cataluña' },
    { id: '3', text: 'Valencia', description: 'Ciudad en la Comunidad Valenciana' },
    { id: '4', text: 'Sevilla', description: 'Capital de Andalucía' },
    { id: '5', text: 'Zaragoza', description: 'Capital de Aragón' },
    { id: '6', text: 'Málaga', description: 'Ciudad en Andalucía' },
    { id: '7', text: 'Murcia', description: 'Capital de la Región de Murcia' },
    { id: '8', text: 'Palma', description: 'Capital de las Islas Baleares' },
    { id: '9', text: 'Las Palmas', description: 'Ciudad en las Islas Canarias' },
    { id: '10', text: 'Bilbao', description: 'Ciudad en el País Vasco' },
    { id: '11', text: 'Alicante', description: 'Ciudad en la Comunidad Valenciana' },
    { id: '12', text: 'Córdoba', description: 'Ciudad en Andalucía' },
    { id: '13', text: 'Valladolid', description: 'Ciudad en Castilla y León' },
    { id: '14', text: 'Vigo', description: 'Ciudad en Galicia' },
    { id: '15', text: 'Gijón', description: 'Ciudad en Asturias' }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Busca resultados que coincidan con el término de búsqueda
   * @param term Término de búsqueda
   * @returns Observable con los resultados de la búsqueda
   */
  search(term: string): Observable<SearchResult[]> {
    // Si el término está vacío, devuelve un array vacío
    if (!term.trim()) {
      return of([]);
    }

    // Filtra los resultados que coincidan con el término (insensible a mayúsculas/minúsculas)
    const results = this.mockData.filter(item => 
      item.text.toLowerCase().includes(term.toLowerCase())
    );

    // Simula una llamada HTTP con un delay
    return of(results);

    // En un entorno real, usaríamos una llamada HTTP como esta:
    // return this.http.get<SearchResult[]>(`/api/search?term=${term}`);
  }

  /**
   * Obtiene un resultado por su ID
   * @param id ID del resultado a buscar
   * @returns Observable con el resultado encontrado o null si no existe
   */
  getById(id: string): Observable<SearchResult | null> {
    const result = this.mockData.find(item => item.id === id);
    return of(result || null);
  }
} 