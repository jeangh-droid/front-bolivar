import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTOs
export interface BienResponseDTO {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  estado: string;
}

export interface BienRequestDTO {
  nombre: string;
  descripcion: string;
  estado: string;
  cantidad: number; 
}

export interface MovimientoStockDTO {
  tipo: string;
  cantidad: number;
  motivo: string;
  fecha: string;
}

export interface HistorialResponseDTO {
  fecha: string;
  motivo: string;
  cantidadEntrada: number;
  cantidadSalida: number;
  stockResultante: number;
}

@Injectable({ providedIn: 'root' })
export class BienService {
  private apiUrl = 'http://localhost:8080/bienes';

  constructor(private http: HttpClient) { }

  getBienes(): Observable<BienResponseDTO[]> {
    return this.http.get<BienResponseDTO[]>(this.apiUrl);
  }

  createBien(bien: BienRequestDTO): Observable<BienResponseDTO> {
    return this.http.post<BienResponseDTO>(this.apiUrl, bien);
  }

  updateBien(id: number, bien: BienRequestDTO): Observable<BienResponseDTO> {
    return this.http.put<BienResponseDTO>(`${this.apiUrl}/${id}`, bien);
  }

  registrarMovimiento(id: number, movimiento: MovimientoStockDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/movimiento`, movimiento);
  }

  getHistorial(id: number): Observable<HistorialResponseDTO[]> {
    return this.http.get<HistorialResponseDTO[]>(`${this.apiUrl}/${id}/historial`);
  }

  buscarBienes(termino: string): Observable<BienResponseDTO[]> {
    return this.http.get<BienResponseDTO[]>(`${this.apiUrl}/buscar?termino=${termino}`);
  }
}