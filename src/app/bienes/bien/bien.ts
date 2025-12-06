import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BienRequestDTO, BienResponseDTO, BienService, HistorialResponseDTO, MovimientoStockDTO } from '../../services/bien';

declare var bootstrap: any;

@Component({
  selector: 'app-bien',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bien.html'
})
export class BienComponent implements OnInit, AfterViewInit {
  
  @ViewChild('verModal') verModalElement!: ElementRef;
  @ViewChild('stockModal') stockModalElement!: ElementRef;
  @ViewChild('crearModal') crearModalElement!: ElementRef;
  
  private verModal: any;
  private stockModal: any;
  private crearModal: any;

  bienes: BienResponseDTO[] = [];
  historial: HistorialResponseDTO[] = [];
  
  // VARIABLES DE BÚSQUEDA
  terminoBusqueda: string = '';
  enBusqueda: boolean = false;

  currentBien: BienRequestDTO = this.getEmptyBienRequest();
  originalBien: BienRequestDTO = this.getEmptyBienRequest(); // ¡NUEVO! Para comparar cambios
  currentBienId: number | null = null;
  
  currentMovimiento: MovimientoStockDTO = this.getEmptyMovimientoRequest();
  
  activeTab: 'EDITAR' | 'HISTORIAL' = 'EDITAR';
  modalTitle: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private bienService: BienService) {}

  ngOnInit(): void {
    this.loadBienes();
  }

  ngAfterViewInit(): void {
    if (this.verModalElement) this.verModal = new bootstrap.Modal(this.verModalElement.nativeElement);
    if (this.stockModalElement) this.stockModal = new bootstrap.Modal(this.stockModalElement.nativeElement);
    if (this.crearModalElement) this.crearModal = new bootstrap.Modal(this.crearModalElement.nativeElement);
  }

  loadBienes(): void {
    this.bienService.getBienes().subscribe({
      next: (data) => {
        this.bienes = data;
        this.enBusqueda = false;
      },
      error: () => this.errorMessage = 'No se pudo cargar el inventario.'
    });
  }

  buscarBienes(): void {
    if (this.terminoBusqueda && this.terminoBusqueda.trim().length > 0) {
      this.enBusqueda = true;
      this.bienService.buscarBienes(this.terminoBusqueda).subscribe({
        next: (data) => this.bienes = data,
        error: () => { this.errorMessage = 'Error en la búsqueda.'; this.loadBienes(); }
      });
    } else {
      this.limpiarBusqueda();
    }
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.enBusqueda = false;
    this.loadBienes();
  }

  openCrearModal(): void {
    this.errorMessage = null; 
    this.currentBienId = null;
    this.currentBien = this.getEmptyBienRequest();
    this.crearModal.show();
  }

  saveNuevoBien(): void {
    this.errorMessage = null;
    
    this.bienService.createBien(this.currentBien).subscribe({
      next: () => {
        if(this.enBusqueda) this.buscarBienes(); else this.loadBienes();
        this.crearModal.hide();
        this.showSuccess('Bien registrado correctamente.');
      },
      error: (err) => {
        console.error('Error al crear bien:', err);
        if (err.error && err.error.message) {
             this.errorMessage = err.error.message; 
        } else if (typeof err.error === 'string') {
             this.errorMessage = err.error;
        } else {
             this.errorMessage = 'Error al registrar. Verifique que el nombre no esté duplicado.';
        }
      }
    });
  }

  openVerModal(bien: BienResponseDTO): void {
    this.errorMessage = null;
    this.currentBienId = bien.id;
    this.modalTitle = `Detalle: ${bien.nombre}`;
    
    this.currentBien = {
      nombre: bien.nombre,
      descripcion: bien.descripcion,
      estado: bien.estado,
      cantidad: bien.cantidad 
    };
    
    this.originalBien = JSON.parse(JSON.stringify(this.currentBien));

    this.loadHistorial(bien.id);
    this.activeTab = 'EDITAR';
    this.verModal.show();
  }

  hasChanges(): boolean {
    return JSON.stringify(this.currentBien) !== JSON.stringify(this.originalBien);
  }

  loadHistorial(id: number): void {
    this.bienService.getHistorial(id).subscribe(data => this.historial = data);
  }

  saveEdicionBien(): void {
    if (this.currentBienId) {
      this.bienService.updateBien(this.currentBienId, this.currentBien).subscribe({
        next: () => {
          if(this.enBusqueda) this.buscarBienes(); else this.loadBienes();
          this.showSuccess('Datos actualizados.');
          this.originalBien = JSON.parse(JSON.stringify(this.currentBien));
        },
        error: () => this.errorMessage = 'Error al actualizar.'
      });
    }
  }

  openStockModal(bien: BienResponseDTO): void {
    this.errorMessage = null;
    this.currentBienId = bien.id;
    this.modalTitle = `Ajustar Stock: ${bien.nombre}`;
    this.currentMovimiento = this.getEmptyMovimientoRequest();
    this.stockModal.show();
  }

  saveMovimiento(): void {
    if (this.currentBienId) {
      this.bienService.registrarMovimiento(this.currentBienId, this.currentMovimiento).subscribe({
        next: () => {
          if(this.enBusqueda) this.buscarBienes(); else this.loadBienes();
          this.stockModal.hide();
          this.showSuccess('Movimiento registrado.');
        },
        error: () => this.errorMessage = 'Error al registrar (verifique stock).'
      });
    }
  }

  setActiveTab(tab: 'EDITAR' | 'HISTORIAL'): void { this.activeTab = tab; }
  closeVerModal(): void { this.verModal.hide(); }
  closeStockModal(): void { this.stockModal.hide(); }
  closeCrearModal(): void { this.crearModal.hide(); }
  
  private showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = null, 3000);
  }

  private getEmptyBienRequest(): BienRequestDTO {
    return { nombre: '', descripcion: '', cantidad: 0, estado: 'BUENO' };
  }
  
  private getEmptyMovimientoRequest(): MovimientoStockDTO {
    return { 
      tipo: 'ENTRADA', 
      cantidad: 1, 
      motivo: '', 
      fecha: ''
    };
  }
}