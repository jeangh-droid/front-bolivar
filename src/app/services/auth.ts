import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs'; 
import { Router } from '@angular/router'; 
import { TokenService } from './token'; 
import { jwtDecode } from 'jwt-decode'; 

// --- Interfaces ---
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

interface JwtPayload {
  sub: string;      
  nombre: string;   
  roles: string[];  
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth/login';

  private currentUserSubject = new BehaviorSubject<JwtPayload | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  
  public isAuthenticated$ = this.currentUser$.pipe(map(user => user !== null));
  public currentUserName$ = this.currentUser$.pipe(map(user => user?.nombre));
  public currentUserRole$ = this.currentUser$.pipe(map(user => user?.roles[0] || null)); 
  constructor(
    private http: HttpClient,
    private tokenService: TokenService, 
    private router: Router            
  ) {
    this.checkAuthStatusOnLoad();
  }

  private checkAuthStatusOnLoad(): void {
    const token = this.tokenService.getToken(); 
    if (token) {
      this.handleAuthentication(token);
    }
  }

  private handleAuthentication(token: string): void {
    try {
      const decodedToken: JwtPayload = jwtDecode(token);
      
      if (decodedToken.exp * 1000 < Date.now()) {
        this.tokenService.clearToken(); 
        this.currentUserSubject.next(null); 
      } else {
        this.tokenService.saveToken(token); 
        this.currentUserSubject.next(decodedToken); 
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      this.tokenService.clearToken();
      this.currentUserSubject.next(null);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      tap(response => {
        this.handleAuthentication(response.token);
      })
    );
  }

  logout(): void {
    this.tokenService.clearToken();
    this.currentUserSubject.next(null); 
    this.router.navigate(['/login']);
  }
}