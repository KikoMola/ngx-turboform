import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  getUsers(): Observable<User[]> {
    return of([
      {
        "id": "1",
        "name": "Usuario BCB Travel",
        "email": "usuario@bcbtravel.com",
        "password": "password123"
      },
      {
        "id": "2",
        "name": "Usuario OpTeam",
        "email": "usuario@opteam.com",
        "password": "password123"
      },
      {
        "id": "3",
        "name": "Usuario Genérico",
        "email": "usuario@ejemplo.com",
        "password": "password123"
      }
    ]
  )} 
}
