import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultaResponseDTO, MultaService } from '../../services/multa';

@Component({
  selector: 'app-mis-multas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card shadow-sm">
      <div class="card-header bg-danger text-white">
        <h4 class="mb-0"><i class="bi bi-exclamation-triangle me-2"></i> Mis Multas</h4>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Motivo</th>
                <th>Monto</th>
                <th>Fecha Emisión</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let multa of multas">
                <td>{{ multa.id }}</td>
                <td>{{ multa.motivo }}</td>
                <td class="fw-bold">S/ {{ multa.monto | number:'1.2-2' }}</td>
                <td>{{ multa.fechaEmision }}</td>
                <td>
                  <span class="badge" 
                    [class.bg-warning]="multa.estado === 'PENDIENTE'" 
                    [class.bg-success]="multa.estado === 'PAGADO'">
                    {{ multa.estado }}
                  </span>
                  <small *ngIf="multa.estado === 'PAGADO'" class="d-block text-muted mt-1">
                    Pagado en recibo #{{ multa.pagoId }}
                  </small>
                </td>
              </tr>
              <tr *ngIf="multas.length === 0">
                <td colspan="5" class="text-center text-muted py-4">
                  ¡Excelente! No tienes multas registradas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MisMultasComponent implements OnInit {
  multas: MultaResponseDTO[] = [];

  constructor(private multaService: MultaService) {}

  ngOnInit(): void {
    this.multaService.getMisMultas().subscribe(data => this.multas = data);
  }
}