import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO para respuestas (Tabla)
export interface PagoResponseDTO {
  id: number;
  tipoPago: string;
  monto: number;
  fechaPago: string;
  observacion: string;
  socioId: number;
  socioNombreCompleto: string;
  socioDni: string;
}

// DTO para peticiones (Formulario)
export interface PagoRequestDTO {
  idSocio: number;
  idMulta?: number;
  tipoPago: string;
  monto: number;
  fechaPago: string;
  observacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  
  private apiUrl = 'http://localhost:8080/pagos'; 
  private multasUrl = 'http://localhost:8080/multas';

  constructor(private http: HttpClient) { }

  getPagos(): Observable<PagoResponseDTO[]> {
    return this.http.get<PagoResponseDTO[]>(this.apiUrl);
  }

  createPago(pago: PagoRequestDTO): Observable<PagoResponseDTO> {
    return this.http.post<PagoResponseDTO>(this.apiUrl, pago);
  }

  updatePago(id: number, pago: PagoRequestDTO): Observable<PagoResponseDTO> {
    return this.http.put<PagoResponseDTO>(`${this.apiUrl}/${id}`, pago);
  }

  deletePago(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMultasPendientes(idSocio: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.multasUrl}/pendientes/${idSocio}`);
  }

  getMisPagos(): Observable<PagoResponseDTO[]> {
    return this.http.get<PagoResponseDTO[]>(`${this.apiUrl}/mis-pagos`);
  }

  buscarPagos(termino: string): Observable<PagoResponseDTO[]> {
    return this.http.get<PagoResponseDTO[]>(`${this.apiUrl}/buscar?termino=${termino}`);
  }

}