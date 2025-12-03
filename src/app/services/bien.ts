import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  cantidad: number;
  estado: string;
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

  deleteBien(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}