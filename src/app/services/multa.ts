import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MultaResponseDTO {
  id: number;
  motivo: string;
  monto: number;
  estado: string;
  fechaEmision: string;
  socioId: number;
  socioNombreCompleto: string;
  socioDni: string;
  pagoId?: number;
}

export interface MultaRequestDTO {
  idSocio: number;
  motivo: string;
  monto: number;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MultaService {
  private apiUrl = 'http://localhost:8080/multas';

  constructor(private http: HttpClient) { }

  getMultas(): Observable<MultaResponseDTO[]> {
    return this.http.get<MultaResponseDTO[]>(this.apiUrl);
  }

  createMulta(multa: MultaRequestDTO): Observable<MultaResponseDTO> {
    return this.http.post<MultaResponseDTO>(this.apiUrl, multa);
  }

  updateMulta(id: number, multa: MultaRequestDTO): Observable<MultaResponseDTO> {
    return this.http.put<MultaResponseDTO>(`${this.apiUrl}/${id}`, multa);
  }

  deleteMulta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMisMultas(): Observable<MultaResponseDTO[]> {
    return this.http.get<MultaResponseDTO[]>(`${this.apiUrl}/mis-multas`);
  }
}