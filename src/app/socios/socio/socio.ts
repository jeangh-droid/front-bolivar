import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute } from '@angular/router';
import { PuestoLibreDTO, SocioRequestDTO, SocioResponseDTO, SocioService } from '../../services/socio';

declare var bootstrap: any;

@Component({
  selector: 'app-socio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './socio.html',
  styleUrls: ['./socio.css']
})
export class SocioComponent implements OnInit, AfterViewInit {
  
  @ViewChild('socioModal') socioModalElement!: ElementRef;
  private socioModal: any; 
  
  @ViewChild('deleteConfirmModal') deleteModalElement!: ElementRef;
  private deleteModal: any;

  allSocios: SocioResponseDTO[] = []; 
  socios: SocioResponseDTO[] = [];    
  
  puestosLibres: PuestoLibreDTO[] = [];
  puestosFiltrados: PuestoLibreDTO[] = []; 
  listaPasajes: string[] = ['PASAJE 1', 'PASAJE 2', 'PASAJE 3', 'PASAJE 4', 'PASAJE 5', 'PASAJE 6', 'PASAJE 7'];
  pasajeSeleccionado: string = '';

  currentSocio: SocioRequestDTO = this.getEmptySocioRequest();
  originalSocio: SocioRequestDTO = this.getEmptySocioRequest();
  currentSocioId: number | null = null; 
  
  usernameExiste: boolean = false;
  tiposDocumento: string[] = ['DNI', 'CARNET_EXTRANJERIA', 'PASAPORTE', 'OTROS'];
  docMinLength: number = 8;
  docMaxLength: number = 8;
  docPattern: string = "^[0-9]*$"; 

  modalTitle: string = 'Agregar Socio';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  socioAEliminar: SocioResponseDTO | null = null;
  
  filtroActual: string = 'TODOS'; 

  terminoBusqueda: string = '';
  enBusqueda: boolean = false;

  constructor(
    private socioService: SocioService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Escuchar cambios en la URL (Filtros del Sidebar)
    this.route.queryParams.subscribe(params => {
      if (!this.enBusqueda) {
        const estado = params['estado'];
        this.filtroActual = estado ? estado : 'TODOS';
        this.loadSocios(); // Recargar y aplicar filtro
      }
    });

    this.loadPuestosLibres();
  }

  ngAfterViewInit(): void {
    if (this.socioModalElement) this.socioModal = new bootstrap.Modal(this.socioModalElement.nativeElement);
    if (this.deleteModalElement) this.deleteModal = new bootstrap.Modal(this.deleteModalElement.nativeElement);
  }

  loadSocios(): void {
    this.socioService.getSocios().subscribe({
      next: (data) => {
        this.allSocios = data;
        this.aplicarFiltro();
      },
      error: () => this.errorMessage = 'No se pudo cargar la lista de socios.'
    });
  }

  aplicarFiltro(): void {
    if (this.filtroActual === 'TODOS') {
      this.socios = this.allSocios;
    } else {
      this.socios = this.allSocios.filter(s => s.estadoUsuario === this.filtroActual);
    }
  }

  // --- LÓGICA DEL BUSCADOR ---
  buscar(): void {
    if (this.terminoBusqueda && this.terminoBusqueda.trim().length > 0) {
      this.enBusqueda = true;
      this.socioService.buscarSocios(this.terminoBusqueda).subscribe({
        next: (data) => {
          this.socios = data; // Mostramos resultados directos de la búsqueda
        },
        error: () => {
          this.errorMessage = 'Error en la búsqueda.';
          this.loadSocios(); 
        }
      });
    } else {
      this.limpiarBusqueda();
    }
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.enBusqueda = false;
    this.loadSocios(); // Recarga normal respetando el filtro de estado actual
  }

  // --- RESTO DE MÉTODOS (Puestos, Validaciones, Modales) ---

  loadPuestosLibres(): void {
    this.socioService.getPuestosLibres().subscribe(data => {
      this.puestosLibres = data;
      if (this.pasajeSeleccionado) this.filtrarPuestos();
    });
  }

  onPasajeChange(): void { this.currentSocio.idPuesto = undefined; this.filtrarPuestos(); }
  
  filtrarPuestos(): void {
    if (this.pasajeSeleccionado) {
      this.puestosFiltrados = this.puestosLibres.filter(p => p.ubicacion.toUpperCase().includes(this.pasajeSeleccionado));
    } else { this.puestosFiltrados = []; }
  }

  onTipoDocumentoChange(): void {
    switch (this.currentSocio.tipoDocumento) {
      case 'DNI': this.docMinLength = 8; this.docMaxLength = 8; this.docPattern = "^[0-9]*$"; break;
      case 'CARNET_EXTRANJERIA': this.docMinLength = 9; this.docMaxLength = 9; this.docPattern = "^[a-zA-Z0-9]*$"; break;
      case 'PASAPORTE': this.docMinLength = 12; this.docMaxLength = 12; this.docPattern = "^[a-zA-Z0-9]*$"; break;
      default: this.docMinLength = 1; this.docMaxLength = 15; this.docPattern = "^[a-zA-Z0-9]*$"; break;
    }
  }

  verificarUsername(): void {
    if (!this.currentSocio.username || this.currentSocio.username.length < 4) return;
    if (this.currentSocioId && this.currentSocio.username === this.originalSocio.username) { this.usernameExiste = false; return; }
    this.socioService.checkUsername(this.currentSocio.username).subscribe(existe => { this.usernameExiste = existe; });
  }

  openModal(socio?: SocioResponseDTO): void {
    this.errorMessage = null; 
    this.successMessage = null;
    this.usernameExiste = false;
    this.loadPuestosLibres();
    this.pasajeSeleccionado = ''; 
    this.puestosFiltrados = [];

    if (socio) {
      this.modalTitle = 'Editar Socio';
      this.currentSocioId = socio.id;
      
      this.currentSocio = {
        username: socio.username, 
        tipoDocumento: socio.tipoDocumento || 'DNI', 
        dni: socio.dni,
        nombre: socio.nombre,
        apellido: socio.apellido,
        numero: socio.numero,
        password: '', 
        direccion: socio.direccion,
        carnetSanidad: socio.carnetSanidad,
        tarjetaSocio: socio.tarjetaSocio,
        idPuesto: socio.idPuesto 
      };
      
      // Truco visual para el select de puestos
      if (socio.idPuesto) {
          // Solo para visualización, ya que el backend maneja la lógica real
          this.puestosLibres.unshift({
            id: socio.idPuesto, 
            numeroPuesto: socio.numeroPuesto || 'Actual', 
            ubicacion: 'Actual'
          });
      }

      this.onTipoDocumentoChange(); 
      this.originalSocio = JSON.parse(JSON.stringify(this.currentSocio));

    } else {
      this.modalTitle = 'Agregar Socio';
      this.currentSocioId = null;
      this.currentSocio = this.getEmptySocioRequest();
      this.onTipoDocumentoChange(); 
      this.originalSocio = this.getEmptySocioRequest(); 
    }
    this.socioModal.show();
  }

  hasChanges(): boolean {
    if (!this.currentSocioId) return true;
    return JSON.stringify(this.currentSocio) !== JSON.stringify(this.originalSocio);
  }

  saveSocio(): void {
    if (this.usernameExiste) { this.errorMessage = "El nombre de usuario ya está en uso."; return; }
    this.errorMessage = null;
    if (!this.currentSocio.password) delete this.currentSocio.password;

    const request = this.currentSocioId 
      ? this.socioService.updateSocio(this.currentSocioId, this.currentSocio)
      : this.socioService.createSocio(this.currentSocio);

    request.subscribe({
      next: () => {
        // Si estábamos buscando, repetimos la búsqueda para ver los datos actualizados
        if(this.enBusqueda) {
            this.buscar();
        } else {
            this.loadSocios();
        }
        this.socioModal.hide();
        this.showSuccess(this.currentSocioId ? 'Socio actualizado.' : 'Socio registrado.');
      },
      error: (err) => this.errorMessage = 'Error al guardar: ' + (err.error?.message || 'Verifique los datos.')
    });
  }

  openEstadoModal(s: SocioResponseDTO): void { this.socioAEliminar = s; this.deleteModal.show(); }
  
  confirmChangeState(): void {
    if (this.socioAEliminar) {
      this.socioService.deleteSocio(this.socioAEliminar.id).subscribe({
        next: () => { 
            if(this.enBusqueda) this.buscar(); else this.loadSocios();
            this.deleteModal.hide(); 
            this.showSuccess('Estado actualizado.'); 
        },
        error: () => { this.errorMessage = 'Error al cambiar estado.'; this.deleteModal.hide(); }
      });
    }
  }

  closeSocioModal(): void { this.socioModal.hide(); }
  closeDeleteModal(): void { this.deleteModal.hide(); }
  private showSuccess(msg: string) { this.successMessage = msg; setTimeout(() => this.successMessage = null, 3000); }
  private getEmptySocioRequest(): SocioRequestDTO {
    return { username: '', tipoDocumento: 'DNI', dni: '', nombre: '', apellido: '', numero: '', password: '', direccion: '', carnetSanidad: 'VIGENTE', tarjetaSocio: '', idPuesto: undefined };
  }
}