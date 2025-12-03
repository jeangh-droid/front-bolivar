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
  
  // Objeto para Editar 
  currentPuesto: PuestoRequestDTO = this.getEmptyPuestoRequest();
  currentPuestoId: number | null = null; 
  
  // Objeto específico para Transferir
  transferData = {
    idSocioNuevo: 0
  };

  // Datos de lectura
  detallePuesto: PuestoResponseDTO | null = null;
  currentPuestoReadonly: { numero: string, ubicacion: string, socioActual: string } = { numero: '', ubicacion: '', socioActual: '' };
  
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private puestoService: PuestoService,
    private socioService: SocioService
  ) { }

  ngOnInit(): void {
    this.loadPuestos();
    // No cargamos sociosActivos aquí para no sobrecargar el inicio, 
    // lo haremos solo cuando se quiera transferir.
  }

  ngAfterViewInit(): void {
    if (this.editModalElement) this.editModal = new bootstrap.Modal(this.editModalElement.nativeElement);
    if (this.transferModalElement) this.transferModal = new bootstrap.Modal(this.transferModalElement.nativeElement);
    if (this.verModalElement) this.verModal = new bootstrap.Modal(this.verModalElement.nativeElement);
  }

  loadPuestos(): void {
    this.puestoService.getPuestos().subscribe({
      next: (data) => this.puestos = data,
      error: () => this.errorMessage = 'Error al cargar puestos.'
    });
  }

  loadSociosActivos(): void {
    this.socioService.getSociosActivos().subscribe({
      next: (data) => {
        this.sociosActivos = data;
        console.log('Socios activos cargados:', this.sociosActivos.length); // Debug
      },
      error: () => this.errorMessage = 'No se pudo cargar la lista de socios activos.'
    });
  }

  // --- 1. MODAL VER ---
  openVerModal(puesto: PuestoResponseDTO): void {
    this.detallePuesto = puesto;
    this.verModal.show();
  }

  // --- 2. MODAL EDITAR (Solo datos técnicos) ---
  openEditModal(puesto: PuestoResponseDTO): void {
    this.errorMessage = null;
    this.currentPuestoId = puesto.id;
    
    // Guardamos datos visuales
    this.currentPuestoReadonly = {
      numero: puesto.numeroPuesto,
      ubicacion: puesto.ubicacion,
      socioActual: puesto.socioNombreCompleto || 'Vacante'
    };

    // Al editar, mantenemos el ID del socio actual (no se toca)
    this.currentPuesto = {
      idSocio: puesto.socioId || 0, 
      licenciaFuncionamiento: puesto.licenciaFuncionamiento,
      estado: puesto.estado
    };
    
    this.editModal.show();
  }

  saveEdit(): void {
    if (this.currentPuestoId) {
      this.puestoService.updatePuesto(this.currentPuestoId, this.currentPuesto).subscribe({
        next: () => { 
          this.loadPuestos(); 
          this.editModal.hide(); 
          this.showSuccess('Datos del puesto actualizados.');
        },
        error: () => this.errorMessage = 'Error al actualizar.'
      });
    }
  }

  // --- 3. MODAL TRANSFERIR (Solo cambio de socio) ---
  openTransferModal(puesto: PuestoResponseDTO): void {
    this.errorMessage = null;
    this.currentPuestoId = puesto.id;
    
    // Cargar la lista fresca de socios activos
    this.loadSociosActivos();

    this.currentPuestoReadonly = {
      numero: puesto.numeroPuesto,
      ubicacion: puesto.ubicacion,
      socioActual: puesto.socioNombreCompleto || 'Vacante'
    };

    // Preparamos el objeto base del puesto, pero el foco es idSocio
    this.currentPuesto = {
      idSocio: puesto.socioId || 0, // Valor actual
      licenciaFuncionamiento: puesto.licenciaFuncionamiento,
      estado: puesto.estado
    };
    
    // Variable temporal para el select del modal
    this.transferData.idSocioNuevo = 0; // Resetear select

    this.transferModal.show();
  }

  saveTransfer(): void {
    if (this.currentPuestoId) {
      // Actualizamos solo el ID del socio en el objeto a enviar
      this.currentPuesto.idSocio = this.transferData.idSocioNuevo;
      
      // Si se selecciona un socio, forzamos estado a OPERATIVO (regla de negocio opcional)
      if (this.currentPuesto.idSocio > 0) {
          this.currentPuesto.estado = 'OPERATIVO';
      }

      this.puestoService.updatePuesto(this.currentPuestoId, this.currentPuesto).subscribe({
        next: () => { 
          this.loadPuestos(); 
          this.transferModal.hide(); 
          this.showSuccess('Transferencia realizada con éxito.');
        },
        error: () => this.errorMessage = 'Error al transferir el puesto.'
      });
    }
  }

  // --- UTILIDADES ---
  private showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = null, 3000);
  }

  closeEditModal(): void { this.editModal.hide(); }
  closeTransferModal(): void { this.transferModal.hide(); }
  closeVerModal(): void { this.verModal.hide(); }

  private getEmptyPuestoRequest(): PuestoRequestDTO {
    return { idSocio: 0, licenciaFuncionamiento: 'VIGENTE', estado: 'OPERATIVO' };
  }
}