import { Component } from '@angular/core';
import { AuthService } from '../../services/auth'; 
import { Observable } from 'rxjs';

import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true, 
  imports: [
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

  constructor(
    private authService: AuthService
  ) { 
    this.currentUserName$ = this.authService.currentUserName$;
    this.currentUserRole$ = this.authService.currentUserRole$;
  }

  logout(): void {
    this.authService.logout();
  }
}