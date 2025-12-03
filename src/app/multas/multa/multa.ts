import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultaRequestDTO, MultaResponseDTO, MultaService } from '../../services/multa';
import { SocioResponseDTO, SocioService } from '../../services/socio';
import { ActivatedRoute } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-multa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multa.html'
})
export class MultaComponent implements OnInit, AfterViewInit {
  
  @ViewChild('multaModal') multaModalElement!: ElementRef;
  @ViewChild('deleteConfirmModal') deleteModalElement!: ElementRef;
  private multaModal: any;
  private deleteModal: any;

  socios: SocioResponseDTO[] = [];
  
  allMultas: MultaResponseDTO[] = [];
  multas: MultaResponseDTO[] = []; 
  filtroActual: string = 'TODAS';

  motivos: string[] = ['TARDANZA_ASAMBLEA', 'FALTA_ASAMBLEA', 'INCUMPLIMIENTO_DEBERES', 'ALTERACION_ORDEN', 'OTRO'];
  
  currentMulta: MultaRequestDTO = this.getEmptyMultaRequest();
  // Copia para verificar cambios
  originalMulta: MultaRequestDTO = this.getEmptyMultaRequest();

  currentMultaId: number | null = null;
  modalTitle = 'Generar Multa';
  
  errorMessage: string | null = null;
  successMessage: string | null = null; // Mensaje de éxito

  multaAEliminar: MultaResponseDTO | null = null;

  constructor(
    private multaService: MultaService,
    private socioService: SocioService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const estado = params['estado'];
      this.filtroActual = estado ? estado : 'TODAS';
      this.aplicarFiltro();
    });

    this.loadMultas();
    this.loadSocios();
  }

  ngAfterViewInit(): void {
    if (this.multaModalElement) this.multaModal = new bootstrap.Modal(this.multaModalElement.nativeElement);
    if (this.deleteModalElement) this.deleteModal = new bootstrap.Modal(this.deleteModalElement.nativeElement);
  }

  loadMultas(): void {
    this.multaService.getMultas().subscribe({
      next: (data) => {
        this.allMultas = data;
        this.aplicarFiltro();
      },
      error: () => this.errorMessage = 'Error cargando multas.'
    });
  }

  aplicarFiltro(): void {
    if (this.filtroActual === 'TODAS') {
      this.multas = this.allMultas;
    } else {
      this.multas = this.allMultas.filter(m => m.estado === this.filtroActual);
    }
  }

  loadSocios(): void {
    this.socioService.getSocios().subscribe(data => this.socios = data);
  }

  openModal(multa?: MultaResponseDTO): void {
    this.errorMessage = null;
    this.successMessage = null;
    
    if (multa) {
      this.modalTitle = 'Editar Multa';
      this.currentMultaId = multa.id;
      this.currentMulta = {
        idSocio: multa.socioId,
        motivo: multa.motivo,
        monto: multa.monto,
        estado: multa.estado
      };
      // Clonar para comparar
      this.originalMulta = JSON.parse(JSON.stringify(this.currentMulta));
    } else {
      this.modalTitle = 'Generar Multa';
      this.currentMultaId = null;
      this.currentMulta = this.getEmptyMultaRequest();
      this.originalMulta = this.getEmptyMultaRequest();
    }
    this.multaModal.show();
  }

  hasChanges(): boolean {
    if (!this.currentMultaId) return true;
    return JSON.stringify(this.currentMulta) !== JSON.stringify(this.originalMulta);
  }

  saveMulta(): void {
    if (this.currentMulta.idSocio === 0) {
        this.errorMessage = "Debe seleccionar un socio.";
        return;
    }

    const req = this.currentMultaId 
      ? this.multaService.updateMulta(this.currentMultaId, this.currentMulta)
      : this.multaService.createMulta(this.currentMulta);

    req.subscribe({
      next: () => { 
        this.loadMultas(); 
        this.multaModal.hide();
        this.showSuccess('Multa guardada correctamente.');
      },
      error: () => this.errorMessage = 'Error al guardar la multa.'
    });
  }

  openDeleteModal(multa: MultaResponseDTO): void {
    this.multaAEliminar = multa;
    this.deleteModal.show();
  }

  confirmDelete(): void {
    if (this.multaAEliminar) {
      this.multaService.deleteMulta(this.multaAEliminar.id).subscribe({
        next: () => {
          this.loadMultas();
          this.deleteModal.hide();
          this.showSuccess('Multa eliminada correctamente.');
        },
        error: () => {
            this.errorMessage = 'Error al eliminar la multa.';
            this.deleteModal.hide();
        }
      });
    }
  }

  private showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = null, 3000);
  }

  closeMultaModal(): void { this.multaModal.hide(); }
  closeDeleteModal(): void { this.deleteModal.hide(); }

  private getEmptyMultaRequest(): MultaRequestDTO {
    return { idSocio: 0, motivo: 'FALTA_ASAMBLEA', monto: 0.00, estado: 'PENDIENTE' };
  }
}