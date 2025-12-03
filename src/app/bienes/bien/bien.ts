import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BienRequestDTO, BienResponseDTO, BienService } from '../../services/bien';

declare var bootstrap: any;

@Component({
  selector: 'app-bien',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bien.html'
})
export class BienComponent implements OnInit, AfterViewInit {
  
  @ViewChild('bienModal') bienModalElement!: ElementRef;
  @ViewChild('deleteConfirmModal') deleteModalElement!: ElementRef;
  private bienModal: any;
  private deleteModal: any;

  bienes: BienResponseDTO[] = [];
  estados: string[] = ['BUENO', 'REGULAR', 'MALO'];

  currentBien: BienRequestDTO = this.getEmptyBienRequest();
  currentBienId: number | null = null;
  
  modalTitle = 'Agregar Bien';
  errorMessage: string | null = null;
  bienAEliminar: BienResponseDTO | null = null;

  constructor(private bienService: BienService) {}

  ngOnInit(): void {
    this.loadBienes();
  }

  ngAfterViewInit(): void {
    if (this.bienModalElement) this.bienModal = new bootstrap.Modal(this.bienModalElement.nativeElement);
    if (this.deleteModalElement) this.deleteModal = new bootstrap.Modal(this.deleteModalElement.nativeElement);
  }

  loadBienes(): void {
    this.bienService.getBienes().subscribe({
      next: (data) => this.bienes = data,
      error: () => this.errorMessage = 'No se pudo cargar el inventario.'
    });
  }

  openModal(bien?: BienResponseDTO): void {
    this.errorMessage = null;
    if (bien) {
      this.modalTitle = 'Editar Bien';
      this.currentBienId = bien.id;
      this.currentBien = {
        nombre: bien.nombre,
        descripcion: bien.descripcion,
        cantidad: bien.cantidad,
        estado: bien.estado
      };
    } else {
      this.modalTitle = 'Agregar Bien';
      this.currentBienId = null;
      this.currentBien = this.getEmptyBienRequest();
    }
    this.bienModal.show();
  }

  saveBien(): void {
    if (this.currentBienId) {
      this.bienService.updateBien(this.currentBienId, this.currentBien).subscribe({
        next: () => { this.loadBienes(); this.bienModal.hide(); },
        error: () => { this.errorMessage = 'Error al actualizar el bien.'; }
      });
    } else {
      this.bienService.createBien(this.currentBien).subscribe({
        next: () => { this.loadBienes(); this.bienModal.hide(); },
        error: () => { this.errorMessage = 'Error al crear el bien.'; }
      });
    }
  }

  openDeleteModal(bien: BienResponseDTO): void {
    this.bienAEliminar = bien;
    this.deleteModal.show();
  }

  confirmDelete(): void {
    if (this.bienAEliminar) {
      this.bienService.deleteBien(this.bienAEliminar.id).subscribe({
        next: () => { this.loadBienes(); this.deleteModal.hide(); },
        error: () => { this.errorMessage = 'Error al eliminar el bien.'; }
      });
    }
  }

  closeBienModal(): void { this.bienModal.hide(); }
  closeDeleteModal(): void { this.deleteModal.hide(); }

  private getEmptyBienRequest(): BienRequestDTO {
    return { nombre: '', descripcion: '', cantidad: 1, estado: 'BUENO' };
  }
}