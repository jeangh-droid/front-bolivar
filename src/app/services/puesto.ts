import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO para respuestas (Tabla)
export interface PuestoResponseDTO {
  id: number;
  numeroPuesto: string;
  ubicacion: string;
  licenciaFuncionamiento: string;
  estado: string;
  socioId?: number;
  socioNombreCompleto?: string;
  socioDni?: string;
}

// DTO para peticiones (Formulario de Edición)
export interface PuestoRequestDTO {
  idSocio: number;
  licenciaFuncionamiento: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class PuestoService {
  
  private apiUrl = 'http://localhost:8080/puestos'; 

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de todos los puestos
   */
  getPuestos(): Observable<PuestoResponseDTO[]> {
    return this.http.get<PuestoResponseDTO[]>(this.apiUrl);
  }

  /**
   * Actualiza un puesto existente
   */
  updatePuesto(id: number, puesto: PuestoRequestDTO): Observable<PuestoResponseDTO> {
    return this.http.put<PuestoResponseDTO>(`${this.apiUrl}/${id}`, puesto);
  }
}