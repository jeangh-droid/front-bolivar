import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PuestoRequestDTO, PuestoResponseDTO, PuestoService } from '../../services/puesto';
import { SocioResponseDTO, SocioService } from '../../services/socio';

declare var bootstrap: any;

@Component({
  selector: 'app-puesto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './puesto.html'
})
export class PuestoComponent implements OnInit, AfterViewInit {
  
  @ViewChild('editModal') editModalElement!: ElementRef;
  @ViewChild('transferModal') transferModalElement!: ElementRef;
  @ViewChild('verModal') verModalElement!: ElementRef;
  
  private editModal: any;
  private transferModal: any;
  private verModal: any;

  puestos: PuestoResponseDTO[] = [];
  sociosActivos: SocioResponseDTO[] = [];
  sociosDisponibles: SocioResponseDTO[] = [];
  
  currentPuesto: PuestoRequestDTO = this.getEmptyPuestoRequest();
  currentPuestoId: number | null = null; 
  transferData = { idSocioNuevo: 0 };

  // --- VARIABLES DE BUSCADOR ---
  terminoBusqueda: string = '';
  enBusqueda: boolean = false;

  detallePuesto: PuestoResponseDTO | null = null;
  currentPuestoReadonly: { numero: string, ubicacion: string, socioActual: string } = { numero: '', ubicacion: '', socioActual: '' };
  
  modalTitle: string = 'Editar Puesto';
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private puestoService: PuestoService,
    private socioService: SocioService
  ) { }

  ngOnInit(): void {
    this.loadPuestos();
  }

  ngAfterViewInit(): void {
    if (this.editModalElement) this.editModal = new bootstrap.Modal(this.editModalElement.nativeElement);
    if (this.transferModalElement) this.transferModal = new bootstrap.Modal(this.transferModalElement.nativeElement);
    if (this.verModalElement) this.verModal = new bootstrap.Modal(this.verModalElement.nativeElement);
  }

  loadPuestos(): void {
    this.puestoService.getPuestos().subscribe({
      next: (data) => {
        this.puestos = data;
        this.enBusqueda = false;
      },
      error: () => this.errorMessage = 'Error al cargar puestos.'
    });
  }

  buscarPuestos(): void {
    if (this.terminoBusqueda && this.terminoBusqueda.trim().length > 0) {
      this.enBusqueda = true;
      this.puestoService.buscarPuestos(this.terminoBusqueda).subscribe({
        next: (data) => this.puestos = data,
        error: () => this.loadPuestos()
      });
    } else {
      this.limpiarBusqueda();
    }
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.enBusqueda = false;
    this.loadPuestos();
  }

  loadSociosActivos(): void {
    this.socioService.getSociosActivos().subscribe(data => this.sociosActivos = data);
  }

  openVerModal(puesto: PuestoResponseDTO): void {
    this.detallePuesto = puesto;
    this.verModal.show();
  }

  openEditModal(puesto: PuestoResponseDTO): void {
    this.errorMessage = null;
    this.currentPuestoId = puesto.id;
    this.currentPuestoReadonly = {
      numero: puesto.numeroPuesto,
      ubicacion: puesto.ubicacion,
      socioActual: puesto.socioNombreCompleto || 'Vacante'
    };
    this.currentPuesto = {
      idSocio: puesto.socioId || 0, 
      licenciaFuncionamiento: puesto.licenciaFuncionamiento,
      estado: puesto.estado
    };
    this.editModal.show();
  }


  saveTransfer(): void {
    if (this.currentPuestoId) {
      this.currentPuesto.idSocio = this.transferData.idSocioNuevo;
      
      if (this.currentPuesto.idSocio > 0) {
          this.currentPuesto.estado = 'OPERATIVO';
      } else {
          this.currentPuesto.estado = 'INACTIVO';
      }

      this.puestoService.updatePuesto(this.currentPuestoId, this.currentPuesto).subscribe({
        next: () => { 
          if(this.enBusqueda) this.buscarPuestos(); else this.loadPuestos();
          
          this.transferModal.hide(); 
          this.showSuccess(this.currentPuesto.idSocio === 0 ? 'Puesto liberado (INACTIVO).' : 'Transferencia exitosa.');
        },
        error: () => this.errorMessage = 'Error al transferir.'
      });
    }
  }

  saveEdit(): void {
    if (this.currentPuestoId) {
      this.puestoService.updatePuesto(this.currentPuestoId, this.currentPuesto).subscribe({
        next: () => { 
          if(this.enBusqueda) this.buscarPuestos(); else this.loadPuestos();
          this.editModal.hide(); 
          this.showSuccess('Datos actualizados.');
        },
        error: () => this.errorMessage = 'Error al actualizar.'
      });
    }
  }

  private showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = null, 3000);
  }

  closeEditModal(): void { this.editModal.hide(); }
  closeTransferModal(): void { this.transferModal.hide(); }
  closeVerModal(): void { this.verModal.hide(); }

  private getEmptyPuestoRequest(): PuestoRequestDTO {
    return { idSocio: 0, licenciaFuncionamiento: 'VIGENTE', estado: 'INACTIVO' };
  }

  openTransferModal(puesto: PuestoResponseDTO): void {
    this.errorMessage = null;
    this.currentPuestoId = puesto.id;
    
    this.socioService.getSociosDisponiblesParaPuesto().subscribe({
        next: (data) => this.sociosDisponibles = data,
        error: () => this.errorMessage = "Error cargando socios disponibles."
    });

    this.currentPuestoReadonly = {
      numero: puesto.numeroPuesto,
      ubicacion: puesto.ubicacion,
      socioActual: puesto.socioNombreCompleto || 'Vacante'
    };

    this.transferModal.show();
  }
}