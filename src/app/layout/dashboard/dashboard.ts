import { Component } from '@angular/core';
import { AuthService } from '../../services/auth'; 
import { Observable } from 'rxjs';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // Importar RouterLinkActive
import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, CommonModule } from '@angular/common'; // Importar CommonModule

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true, 
  imports: [
    CommonModule, 
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault
  ]
})
export class Dashboard { 

  public currentUserName$: Observable<string | undefined | null>;
  public currentUserRole$: Observable<string | null>;
  
  public isMultasMenuOpen: boolean = false; 
  public isSociosMenuOpen: boolean = false;

  constructor(
    private authService: AuthService
  ) { 
    this.currentUserName$ = this.authService.currentUserName$;
    this.currentUserRole$ = this.authService.currentUserRole$;
  }

 

  logout(): void {
    this.authService.logout();
  }

  toggleSociosMenu() { this.isSociosMenuOpen = !this.isSociosMenuOpen; }
  toggleMultasMenu() { this.isMultasMenuOpen = !this.isMultasMenuOpen; }
}