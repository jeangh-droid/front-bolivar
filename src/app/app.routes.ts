import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { Dashboard } from './layout/dashboard/dashboard';
import { AuthGuard } from './guards/auth-guard';
import { DashboardHomeComponent } from './layout/dashboard/dashboard-home/dashboard-home';
import { SocioComponent } from './socios/socio/socio';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  {
    path: 'dashboard',
    component: Dashboard, // El layout (sidebar + navbar)
    canActivate: [AuthGuard],
    // Rutas hijas
    children: [
      // Ruta hija por defecto (lo que se ve al entrar al dashboard)
      { path: '', component: DashboardHomeComponent },
      
      // Ruta hija para el módulo Socios
      { path: 'socios', component: SocioComponent },

      // Aquí añadirás las otras rutas en el futuro
      // { path: 'puestos', component: PuestosComponent },
      // { path: 'pagos', component: PagosComponent },
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // Redirige cualquier ruta desconocida al login
  { path: '**', redirectTo: 'login' } 
];