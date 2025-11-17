import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PuestoRequestDTO, PuestoResponseDTO, PuestoService } from '../../services/puesto';
import { SocioResponseDTO, SocioService } from '../../services/socio';

declare var bootstrap: any;

@Component({
  selector: 'app-puesto',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule   
  ],
  templateUrl: './puesto.html'
})
export class PuestoComponent implements OnInit, AfterViewInit {
  
  @ViewChild('puestoModal') puestoModalElement!: ElementRef;
  private puestoModal: any; 

  puestos: PuestoResponseDTO[] = [];
  socios: SocioResponseDTO[] = []; // ¡Lista de socios para el dropdown!
  
  // Objeto para el formulario de edición
  currentPuesto: PuestoRequestDTO = this.getEmptyPuestoRequest();
  currentPuestoId: number | null = null; 
  
  // Guardamos los datos de solo lectura para mostrarlos en el modal
  currentPuestoReadonly: { numero: string, ubicacion: string } = { numero: '', ubicacion: '' };
  
  modalTitle: string = 'Editar Puesto';
  errorMessage: string | null = null;

  constructor(
    private puestoService: PuestoService,
    private socioService: SocioService // Inyecta el servicio de socios
  ) { }

  ngOnInit(): void {
    this.loadPuestos();
    this.loadSocios(); // Carga los socios para el dropdown
  }

  ngAfterViewInit(): void {
    if (this.puestoModalElement) {
      this.puestoModal = new bootstrap.Modal(this.puestoModalElement.nativeElement);
    }
  }

  loadPuestos(): void {
    this.puestoService.getPuestos().subscribe({
      next: (data) => {
        this.puestos = data;
      },
      error: (err) => this.errorMessage = 'No se pudo cargar la lista de puestos.'
    });
  }

  loadSocios(): void {
    this.socioService.getSocios().subscribe({
      next: (data) => {
        this.socios = data;
      },
      error: (err) => this.errorMessage = 'No se pudo cargar la lista de socios para el selector.'
    });
  }

  openModal(puesto: PuestoResponseDTO): void {
    this.errorMessage = null; 
    
    // --- Modo Edición ---
    this.modalTitle = `Editar Puesto: ${puesto.numeroPuesto}`;
    this.currentPuestoId = puesto.id;
    
    // Datos para el formulario
    this.currentPuesto = {
      idSocio: puesto.socioId || 0, // 0 o null para 'No Asignado'
      licenciaFuncionamiento: puesto.licenciaFuncionamiento,
      estado: puesto.estado
    };
    
    // Datos de solo lectura
    this.currentPuestoReadonly = {
      numero: puesto.numeroPuesto,
      ubicacion: puesto.ubicacion
    };
    
    this.puestoModal.show();
  }

  savePuesto(): void {
    this.errorMessage = null;
    
    if (this.currentPuestoId) {
      // --- Solo Actualizar (PUT) ---
      this.puestoService.updatePuesto(this.currentPuestoId, this.currentPuesto).subscribe({
        next: () => { 
          this.loadPuestos(); 
          this.puestoModal.hide(); 
        },
        error: (err) => { 
          this.errorMessage = 'Error al actualizar: ' + (err.error?.message || 'Verifique los datos.'); 
        }
      });
    }
  }

  closePuestoModal(): void {
    if (this.puestoModal) {
      this.puestoModal.hide();
    }
  }

  private getEmptyPuestoRequest(): PuestoRequestDTO {
    return {
      idSocio: 0,
      licenciaFuncionamiento: 'VIGENTE',
      estado: 'OPERATIVO'
    };
  }
}