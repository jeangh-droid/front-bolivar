import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO para respuestas (Tabla)
export interface SocioResponseDTO {
  id: number; // <-- ¡Cambiado de idSocio a id!
  nombre: string;
  apellido: string;
  dni: string;
  username: string; // <-- ¡Añadido!
  numero: string;   // <-- ¡Añadido!
  direccion: string;
  carnetSanidad: string;
  tarjetaSocio: string;
}

// DTO para peticiones (Formulario)
export interface SocioRequestDTO {
  // Campos de Usuario
  username: string; 
  dni: string;
  nombre: string;
  apellido: string;
  numero: string;
  password?: string; 

  // Campos de Socio
  direccion: string;
  carnetSanidad: string;
  tarjetaSocio: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocioService {
  
  private apiUrl = 'http://localhost:8080/socios'; 

  constructor(private http: HttpClient) { }

  getSocios(): Observable<SocioResponseDTO[]> {
    return this.http.get<SocioResponseDTO[]>(this.apiUrl);
  }

  getSocioById(id: number): Observable<SocioResponseDTO> {
    return this.http.get<SocioResponseDTO>(`${this.apiUrl}/${id}`);
  }

  createSocio(socio: SocioRequestDTO): Observable<SocioResponseDTO> {
    return this.http.post<SocioResponseDTO>(this.apiUrl, socio);
  }

  updateSocio(id: number, socio: SocioRequestDTO): Observable<SocioResponseDTO> {
    return this.http.put<SocioResponseDTO>(`${this.apiUrl}/${id}`, socio);
  }

  deleteSocio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}