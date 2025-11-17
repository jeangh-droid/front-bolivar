import { Component } from '@angular/core';
import { Observable } from 'rxjs';

// Importa los pipes y directivas
import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault
  ],
  
  template: `
    <ng-container [ngSwitch]="(currentUserRole$ | async)">

      <div *ngSwitchCase="'ROLE_ADMIN'" class="card shadow-sm">
        <div class="card-body">
          <h2 class="card-title text-dark mb-3">Datos del Administrador</h2>
          <p class="card-text text-secondary">
            Bienvenido Admin. Aquí se mostrará la información y estadísticas.
          </p>
        </div>
      </div>

      <div *ngSwitchCase="'ROLE_SOCIO'" class="card shadow-sm">
        <div class="card-body">
          <h2 class="card-title text-dark mb-3">Datos del Socio</h2>
          <p class="card-text text-secondary">
            Bienvenido Socio. Aquí puedes ver un resumen de tu estado.
          </p>
        </div>
      </div>

      <div *ngSwitchDefault class="alert alert-danger">
        <h4 class="alert-heading">Error de Rol</h4>
        <p>Cargando o rol no reconocido...</p>
      </div>

    </ng-container>
  `
})
export class DashboardHomeComponent {
  
  public currentUserRole$: Observable<string | null>;

  constructor(private authService: AuthService) {
    this.currentUserRole$ = this.authService.currentUserRole$;
  }
}