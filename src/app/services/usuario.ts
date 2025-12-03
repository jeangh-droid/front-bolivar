import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioProfile {
  username: string;
  dni: string;
  nombre: string;
  apellido: string;
  numero: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  
  private apiUrl = 'http://localhost:8080/usuarios';

  constructor(private http: HttpClient) { }

  getPerfil(): Observable<UsuarioProfile> {
    return this.http.get<UsuarioProfile>(`${this.apiUrl}/perfil`);
  }
}