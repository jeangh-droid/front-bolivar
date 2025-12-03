import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagoRequestDTO, PagoResponseDTO, PagoService } from '../../services/pago';
import { SocioResponseDTO, SocioService } from '../../services/socio';

declare var bootstrap: any;

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago.html'
})
export class PagoComponent implements OnInit, AfterViewInit {
  
  @ViewChild('pagoModal') pagoModalElement!: ElementRef;
  private pagoModal: any; 
  @ViewChild('deleteConfirmModal') deleteModalElement!: ElementRef;
  private deleteModal: any;

  pagos: PagoResponseDTO[] = [];
  socios: SocioResponseDTO[] = [];
  multasPendientes: any[] = []; 

  tiposDePago: string[] = ['CUOTA_MENSUAL', 'MULTA', 'CUOTA_EXTRAORDINARIA', 'OTROS'];

  currentPago: PagoRequestDTO = this.getEmptyPagoRequest();
  currentPagoId: number | null = null; 
  
  socioInputSearch: string = ''; 
  
  terminoBusqueda: string = '';
  enBusqueda: boolean = false;

  modalTitle: string = 'Agregar Pago';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  pagoAEliminar: PagoResponseDTO | null = null;
  originalPago: PagoRequestDTO = this.getEmptyPagoRequest();

  terminoBusquedaSocio: string = '';
  resultadosBusquedaSocio: SocioResponseDTO[] = [];
  socioSeleccionado: SocioResponseDTO | null = null; 
  mensajeBusquedaSocio: string | null = null;
  buscandoSocio: boolean = false;

  constructor(
    private pagoService: PagoService,
    private socioService: SocioService
  ) { }

  ngOnInit(): void {
    this.loadPagos();
  }

  ngAfterViewInit(): void {
    if (this.pagoModalElement) this.pagoModal = new bootstrap.Modal(this.pagoModalElement.nativeElement);
    if (this.deleteModalElement) this.deleteModal = new bootstrap.Modal(this.deleteModalElement.nativeElement);
  }

  loadPagos(): void {
    this.pagoService.getPagos().subscribe(data => {
      this.pagos = data;
      this.enBusqueda = false;
    });
  }

  // --- LÓGICA DE BUSCADOR DE PAGOS ---
  buscarPagos(): void {
    if (this.terminoBusqueda && this.terminoBusqueda.trim().length > 0) {
      this.enBusqueda = true;
      this.pagoService.buscarPagos(this.terminoBusqueda).subscribe({
        next: (data) => this.pagos = data,
        error: () => this.loadPagos()
      });
    } else {
      this.limpiarBusqueda();
    }
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.enBusqueda = false;
    this.loadPagos();
  }

  buscarSocioParaPago(): void {
    if (!this.terminoBusquedaSocio || this.terminoBusquedaSocio.length < 3) {
      this.mensajeBusquedaSocio = "Ingrese al menos 3 caracteres.";
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
      error: () => this.buscandoSocio = false
    });
  }

  seleccionarSocio(s: SocioResponseDTO): void {
    this.socioSeleccionado = s;
    this.currentPago.idSocio = s.id;
    this.terminoBusquedaSocio = `${s.nombre} ${s.apellido} (${s.dni})`;
    this.resultadosBusquedaSocio = [];
    
    if (this.currentPago.tipoPago === 'MULTA') {
      this.cargarMultasDelSocio(s.id);
    }
  }

  cancelarSeleccionSocio(): void {
    this.socioSeleccionado = null;
    this.currentPago.idSocio = 0;
    this.terminoBusquedaSocio = '';
    this.multasPendientes = [];
  }

  onTipoPagoChange(): void {
    if (this.currentPago.tipoPago === 'MULTA' && this.currentPago.idSocio > 0) {
      this.cargarMultasDelSocio(this.currentPago.idSocio);
    } else {
      this.currentPago.idMulta = undefined;
      this.multasPendientes = [];
    }
  }

  cargarMultasDelSocio(idSocio: number): void {
    this.pagoService.getMultasPendientes(idSocio).subscribe(multas => this.multasPendientes = multas);
  }

  onMultaSelect(): void {
    const m = this.multasPendientes.find(x => x.id == this.currentPago.idMulta);
    if(m) { this.currentPago.monto = m.monto; this.currentPago.observacion = `Pago de multa: ${m.motivo}`; }
  }

  openModal(pago?: PagoResponseDTO): void {
    this.errorMessage = null; 
    this.cancelarSeleccionSocio();

    if (pago) {
      this.modalTitle = 'Editar Pago';
      this.currentPagoId = pago.id;
      
      this.socioSeleccionado = { id: pago.socioId, nombre: pago.socioNombreCompleto, dni: pago.socioDni } as any;
      this.terminoBusquedaSocio = `${pago.socioNombreCompleto}`;

      this.currentPago = {
        idSocio: pago.socioId,
        tipoPago: pago.tipoPago,
        monto: pago.monto,
        fechaPago: pago.fechaPago.substring(0, 16), 
        observacion: pago.observacion,
        idMulta: undefined 
      };
      this.originalPago = JSON.parse(JSON.stringify(this.currentPago));
    } else {
      this.modalTitle = 'Agregar Pago';
      this.currentPagoId = null;
      this.currentPago = this.getEmptyPagoRequest();
      this.originalPago = this.getEmptyPagoRequest();
    }
    this.pagoModal.show();
  }

  hasChanges(): boolean {
    if (!this.currentPagoId) return true;
    return JSON.stringify(this.currentPago) !== JSON.stringify(this.originalPago);
  }

  savePago(): void {
    if (this.currentPago.idSocio === 0) {
      this.errorMessage = "Debe seleccionar un socio.";
      return;
    }

    const req = this.currentPagoId 
      ? this.pagoService.updatePago(this.currentPagoId, this.currentPago)
      : this.pagoService.createPago(this.currentPago);

    req.subscribe({
      next: () => { 
        this.loadPagos(); 
        this.pagoModal.hide(); 
        this.showSuccess('Pago registrado correctamente.');
      },
      error: () => this.errorMessage = 'Error al procesar el pago.'
    });
  }

  openDeleteModal(pago: PagoResponseDTO): void { this.pagoAEliminar = pago; this.deleteModal.show(); }
  confirmDelete(): void { 
      if(this.pagoAEliminar) this.pagoService.deletePago(this.pagoAEliminar.id).subscribe(() => { this.loadPagos(); this.deleteModal.hide(); this.showSuccess('Pago eliminado.'); }); 
  }

  private showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = null, 3000);
  }

  closePagoModal(): void { this.pagoModal.hide(); }
  closeDeleteModal(): void { this.deleteModal.hide(); }

  private getEmptyPagoRequest(): PagoRequestDTO {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return {
      idSocio: 0,
      tipoPago: 'CUOTA_MENSUAL',
      monto: 0.00,
      fechaPago: now.toISOString().substring(0, 16),
      observacion: ''
    };
  }
}