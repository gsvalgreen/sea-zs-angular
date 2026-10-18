import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private authService: AuthService) { }

  /** Login via POST /api/v1/auth/login (o /usuario/login legado esta deprecated no backend). */
  public login(email: string, senha: string): Observable<void> {
    return this.authService.login(email, senha);
  }

}
