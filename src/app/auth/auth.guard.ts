import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard de rota (so UX; a autorizacao real e do backend). Sem sessao vai para o login.
 * Rotas com data.perfis (ex.: ['ROLE_ADMIN']) exigem um dos perfis; senao voltam ao inicio.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/']);
      return false;
    }
    const perfis: string[] = route.data ? route.data['perfis'] : null;
    if (perfis && !this.authService.temPerfil(...perfis)) {
      this.router.navigate(['/usuario-inicio']);
      return false;
    }
    return true;
  }
}
