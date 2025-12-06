import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO para respuestas 
export interface SocioResponseDTO {
  id: number; 
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  dni: string;
  username: string; 
  numero: string;   
  direccion: string;
  carnetSanidad: string;
  tarjetaSocio: string;

  estadoUsuario: string; 
  numeroPuesto?: string;
  idPuesto?: number;
}

// DTO para peticiones
export interface SocioRequestDTO {
  username: string;
  tipoDocumento?: string; 
  dni: string;
  nombre: string;
  apellido: string;
  numero: string;
  password?: string; 

  direccion: string;
  carnetSanidad: string;
  tarjetaSocio: string;

    idPuesto?: number; 

}

export interface PuestoLibreDTO {
  id: number;
  numeroPuesto: string;
  ubicacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocioService {
  
  private apiUrl = 'http://localhost:8080/socios'; 
  private puestosUrl = 'http://localhost:8080/puestos'; 


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

  getPuestosLibres(): Observable<PuestoLibreDTO[]> {
    return this.http.get<PuestoLibreDTO[]>(`${this.puestosUrl}/libres`); 
  }

  deleteSocio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMiPerfil(): Observable<SocioResponseDTO> {
    return this.http.get<SocioResponseDTO>(`${this.apiUrl}/mi-perfil`);
  }

  buscarSocios(termino: string): Observable<SocioResponseDTO[]> {
    return this.http.get<SocioResponseDTO[]>(`${this.apiUrl}/buscar?termino=${termino}`);
  }

  checkUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-username/${username}`);
  }

  getSociosActivos(): Observable<SocioResponseDTO[]> {
    return this.http.get<SocioResponseDTO[]>(`${this.apiUrl}/activos`);
  }

  getSociosDisponiblesParaPuesto(): Observable<SocioResponseDTO[]> {
    return this.http.get<SocioResponseDTO[]>(`${this.apiUrl}/disponibles-para-puesto`);
  }
}