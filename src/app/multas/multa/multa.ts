import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { SocioResponseDTO, SocioService } from '../../services/socio';
import { MultaRequestDTO, MultaResponseDTO, MultaService } from '../../services/multa';

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
  originalMulta: MultaRequestDTO = this.getEmptyMultaRequest();

  currentMultaId: number | null = null;
  modalTitle: string = 'Generar Multa';
  
  errorMessage: string | null = null;
  successMessage: string | null = null;
  multaAEliminar: MultaResponseDTO | null = null;

  terminoBusqueda: string = '';
  enBusqueda: boolean = false;
  
  // Variables Búsqueda Socio (Modal)
  terminoBusquedaSocio: string = '';
  resultadosBusquedaSocio: SocioResponseDTO[] = [];
  mensajeBusquedaSocio: string | null = null;
  buscandoSocio: boolean = false;
  socioSeleccionado: SocioResponseDTO | null = null; 

  constructor(
    private multaService: MultaService,
    private socioService: SocioService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const nuevoEstado = params['estado'];
      this.filtroActual = nuevoEstado ? nuevoEstado : 'TODAS';
      
      if (!this.enBusqueda) { 
        this.loadMultas(); 
      } else {
        this.aplicarFiltro();
      }
    });
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
        this.enBusqueda = false; 
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

  buscarMultas(): void {
    if (this.terminoBusqueda && this.terminoBusqueda.trim().length > 0) {
      this.enBusqueda = true;
      this.multaService.buscarMultas(this.terminoBusqueda).subscribe({
        next: (data) => {
          this.allMultas = data;
          this.aplicarFiltro();
        },
        error: () => {
          this.errorMessage = 'Error en la búsqueda.';
          this.loadMultas();
        }
      });
    } else {
      this.limpiarBusqueda();
    }
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.enBusqueda = false;
    this.loadMultas();
  }
  
  buscarSocioParaMulta(): void {
    if (!this.terminoBusquedaSocio || this.terminoBusquedaSocio.trim().length < 3) {
      this.mensajeBusquedaSocio = "Ingrese al menos 3 caracteres para buscar.";
      this.resultadosBusquedaSocio = [];
      return;
    }
    this.buscandoSocio = true;
    this.mensajeBusquedaSocio = null;
    this.socioService.buscarSocios(this.terminoBusquedaSocio).subscribe({
      next: (data) => {
        this.resultadosBusquedaSocio = data;
        this.buscandoSocio = false;
        if(data.length === 0) this.mensajeBusquedaSocio = "No se encontraron socios.";
      },
      error: () => { this.buscandoSocio = false; this.mensajeBusquedaSocio = "Error al buscar."; }
    });
  }

  seleccionarSocio(s: SocioResponseDTO): void {
    this.socioSeleccionado = s;
    this.currentMulta.idSocio = s.id;
    this.terminoBusquedaSocio = `${s.nombre} ${s.apellido} (${s.dni})`;
    this.resultadosBusquedaSocio = [];
    this.mensajeBusquedaSocio = null;
  }

  cancelarSeleccionSocio(): void {
    this.socioSeleccionado = null;
    this.currentMulta.idSocio = 0;
    this.terminoBusquedaSocio = '';
    this.mensajeBusquedaSocio = null;
  }

  openModal(multa?: MultaResponseDTO): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.cancelarSeleccionSocio();
    
    if (multa) {
      this.modalTitle = 'Editar Multa';
      this.currentMultaId = multa.id;
      this.socioSeleccionado = { id: multa.socioId, nombre: multa.socioNombreCompleto, dni: multa.socioDni } as any;
      this.terminoBusquedaSocio = `${multa.socioNombreCompleto}`;
      this.currentMulta = { idSocio: multa.socioId, motivo: multa.motivo, monto: multa.monto, estado: multa.estado };
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
    if (this.currentMulta.idSocio === 0) { this.errorMessage = "Debe buscar y seleccionar un socio."; return; }

    const req = this.currentMultaId 
      ? this.multaService.updateMulta(this.currentMultaId, this.currentMulta)
      : this.multaService.createMulta(this.currentMulta);

    req.subscribe({
      next: () => { 
        if(this.enBusqueda) this.buscarMultas(); else this.loadMultas();
        this.multaModal.hide();
        this.showSuccess('Multa guardada correctamente.');
      },
      error: () => this.errorMessage = 'Error al guardar.'
    });
  }

  openDeleteModal(m: MultaResponseDTO): void { this.multaAEliminar = m; this.deleteModal.show(); }
  
  confirmDelete(): void {
    if (this.multaAEliminar) {
      this.multaService.deleteMulta(this.multaAEliminar.id).subscribe({
        next: () => {
          if(this.enBusqueda) this.buscarMultas(); else this.loadMultas();
          this.deleteModal.hide();
          this.showSuccess('Multa eliminada.');
        },
        error: () => { this.errorMessage = 'Error al eliminar la multa.'; this.deleteModal.hide(); }
      });
    }
  }

  private showSuccess(msg: string) { this.successMessage = msg; setTimeout(() => this.successMessage = null, 3000); }
  closeMultaModal(): void { this.multaModal.hide(); }
  closeDeleteModal(): void { this.deleteModal.hide(); }
  private getEmptyMultaRequest(): MultaRequestDTO { return { idSocio: 0, motivo: 'FALTA_ASAMBLEA', monto: 0.00, estado: 'PENDIENTE' }; }
}