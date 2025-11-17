import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { SocioService, SocioResponseDTO, SocioRequestDTO } from '../../services/socio';

declare var bootstrap: any;

@Component({
  selector: 'app-socio',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule   
  ],
  templateUrl: './socio.html',
  styleUrls: ['./socio.css']
})
export class SocioComponent implements OnInit, AfterViewInit {
  
  @ViewChild('socioModal') socioModalElement!: ElementRef;
  private socioModal: any; 

  socios: SocioResponseDTO[] = [];
  
  // Objeto para el formulario (completo)
  currentSocio: SocioRequestDTO = this.getEmptySocioRequest();
  currentSocioId: number | null = null; 
  
  modalTitle: string = 'Agregar Socio';
  errorMessage: string | null = null;

  socioAEliminar: SocioResponseDTO | null = null;
  @ViewChild('deleteConfirmModal') deleteModalElement!: ElementRef;
  private deleteModal: any;

  constructor(private socioService: SocioService) { }

  ngOnInit(): void {
    this.loadSocios();
  }

  ngAfterViewInit(): void {
    if (this.socioModalElement) {
      this.socioModal = new bootstrap.Modal(this.socioModalElement.nativeElement);
    }
    if (this.deleteModalElement) {
      this.deleteModal = new bootstrap.Modal(this.deleteModalElement.nativeElement);
    }
  }

  loadSocios(): void {
    this.socioService.getSocios().subscribe({
      next: (data) => {
        this.socios = data;
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar la lista de socios.';
      }
    });
  }

  openModal(socio?: SocioResponseDTO): void {
    this.errorMessage = null; 
    if (socio) {
      // --- Modo Edición ---
      this.modalTitle = 'Editar Socio';
      this.currentSocioId = socio.id; // <-- Usa 'id'
      
      this.currentSocio = {
        // Campos de Usuario
        username: socio.username,
        dni: socio.dni,
        nombre: socio.nombre,
        apellido: socio.apellido,
        numero: socio.numero,
        password: '', // Siempre vacío al editar por seguridad

        // Campos de Socio
        direccion: socio.direccion,
        carnetSanidad: socio.carnetSanidad,
        tarjetaSocio: socio.tarjetaSocio
      };
    } else {
      // --- Modo Agregar ---
      this.modalTitle = 'Agregar Socio';
      this.currentSocioId = null;
      this.currentSocio = this.getEmptySocioRequest();
    }
    this.socioModal.show();
  }

  saveSocio(): void {
    this.errorMessage = null;
    
    // Limpia la contraseña si está vacía
    if (!this.currentSocio.password) {
      delete this.currentSocio.password;
    }

    if (this.currentSocioId) {
      // --- Actualizar (PUT) ---
      this.socioService.updateSocio(this.currentSocioId, this.currentSocio).subscribe({
        next: () => { this.loadSocios(); this.socioModal.hide(); },
        error: (err) => { this.errorMessage = 'Error al actualizar: ' + (err.error?.message || 'Verifique los datos.'); }
      });
    } else {
      // --- Crear (POST) ---
      this.socioService.createSocio(this.currentSocio).subscribe({
        next: () => { this.loadSocios(); this.socioModal.hide(); },
        error: (err) => { this.errorMessage = 'Error al crear: ' + (err.error?.message || 'Verifique los datos.'); }
      });
    }
  }

  openDeleteModal(socio: SocioResponseDTO): void {
    this.socioAEliminar = socio;
    this.deleteModal.show();
  }

  confirmDelete(): void {
    if (this.socioAEliminar) {
      this.socioService.deleteSocio(this.socioAEliminar.id).subscribe({ // <-- Usa 'id'
        next: () => {
          this.loadSocios();
          this.socioAEliminar = null;
          this.deleteModal.hide();
        },
        error: (err) => {
          this.errorMessage = 'No se pudo eliminar el socio.';
          this.deleteModal.hide();
        }
      });
    }
  }

  // --- ¡NUEVOS MÉTODOS PÚBLICOS PARA CERRAR MODALES! ---
  closeSocioModal(): void {
    if (this.socioModal) {
      this.socioModal.hide();
    }
  }

  closeDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.hide();
    }
  }

  // --- ¡MODIFICADO! ---
  // Devuelve el objeto completo para el formulario
  private getEmptySocioRequest(): SocioRequestDTO {
    return {
      username: '',
      dni: '',
      nombre: '',
      apellido: '',
      numero: '',
      password: '',
      direccion: '',
      carnetSanidad: 'VIGENTE',
      tarjetaSocio: ''
    };
  }
}