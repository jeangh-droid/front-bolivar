import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth'; 
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true, 
  imports: [
    FormsModule, 
    CommonModule 
  ] 
})
export class LoginComponent { 

  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  login() {
    this.errorMessage = ''; 
    const credentials = { username: this.username, password: this.password };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error de login:', err);
        this.errorMessage = 'DNI o contraseña incorrectos';
      }
    });
  }
}