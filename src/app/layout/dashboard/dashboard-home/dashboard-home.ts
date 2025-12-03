import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { AuthService } from '../../../services/auth';
import { DashboardService } from '../../../services/dashboard';
import { UsuarioProfile, UsuarioService } from '../../../services/usuario';
import { SocioResponseDTO, SocioService } from '../../../services/socio';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './dashboard-home.html'
})
export class DashboardHomeComponent implements OnInit {
  
  public currentUserRole$: Observable<string | null>;
  
  
  totalSocios: number = 0;
  multasPendientes: number = 0;
  
  // Variable para el perfil del admin
  adminProfile: UsuarioProfile | null = null;

  // Variable para el perfil del socio
  socioProfile: SocioResponseDTO | null = null;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private userService: UsuarioService, 
    private socioService: SocioService
  ) {
    this.currentUserRole$ = this.authService.currentUserRole$;
  }

  ngOnInit(): void {
    this.currentUserRole$.subscribe(role => {
      if (role === 'ROLE_ADMIN') {
        this.loadStats();
        this.loadAdminProfile();
      } else if (role === 'ROLE_SOCIO') {
        this.loadSocioProfile();
      }
    });
  }

  loadStats() {
    this.dashboardService.getStats().subscribe(stats => {
      this.totalSocios = stats.totalSocios;
      this.multasPendientes = stats.multasPendientes;
    });
  }


  loadAdminProfile() {
    this.userService.getPerfil().subscribe({
      next: (data) => this.adminProfile = data,
      error: (err) => console.error('Error perfil admin', err)
    });
  }

  loadSocioProfile() {
    this.socioService.getMiPerfil().subscribe({
      next: (data) => this.socioProfile = data,
      error: (err) => console.error('Error perfil socio', err)
    });
  }
}