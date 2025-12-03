import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagoResponseDTO, PagoService } from '../../services/pago';

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0"><i class="bi bi-credit-card-2-front me-2"></i> Mis Pagos Realizados</h4>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Recibo #</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let pago of pagos">
                <td>{{ pago.id }}</td>
                <td><span class="badge bg-info text-dark">{{ pago.tipoPago }}</span></td>
                <td class="fw-bold">S/ {{ pago.monto | number:'1.2-2' }}</td>
                <td>{{ pago.fechaPago | date:'dd/MM/yyyy h:mm a' }}</td>
                <td>{{ pago.observacion || '-' }}</td>
              </tr>
              <tr *ngIf="pagos.length === 0">
                <td colspan="5" class="text-center text-muted py-4">
                  No tienes pagos registrados aún.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MisPagosComponent implements OnInit {
  pagos: PagoResponseDTO[] = [];

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    this.pagoService.getMisPagos().subscribe(data => this.pagos = data);
  }
}