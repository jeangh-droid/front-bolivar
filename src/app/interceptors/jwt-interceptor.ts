import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token'; 


export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  
  const tokenService = inject(TokenService);
  const token = tokenService.getToken(); 

  if (token) {
    console.log('>>> Interceptor: Token encontrado, añadiendo header...');
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.warn('>>> Interceptor: No hay token para la petición', request.url);
  }

  return next(request);
};