import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { AlertaService } from './alerta.service';
import { mensagemDeErro } from './mensagens-erro';

/**
 * Envia Authorization: Bearer so para a API do sea-zs. Em 401 tenta UM refresh (rotativo) e repete a
 * requisicao; se o refresh ou a repeticao falharem, encerra a sessao. Mostra 403 e 429 (Retry-After).
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private alerta: AlertaService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.ehApi(req.url) || this.ehAuth(req.url)) {
      return next.handle(req);
    }
    const token = this.authService.getAccessToken();
    return next.handle(this.comToken(req, token)).pipe(
      catchError(erro => {
        if (!(erro instanceof HttpErrorResponse)) {
          return throwError(erro);
        }
        if (erro.status === 401) {
          return this.aoNaoAutorizado(req, next, token, erro);
        }
        if (erro.status === 403 || erro.status === 429) {
          this.alerta.mostrar(mensagemDeErro(erro));
        }
        return throwError(erro);
      })
    );
  }

  private aoNaoAutorizado(req: HttpRequest<any>, next: HttpHandler, tokenUsado: string, erro: HttpErrorResponse): Observable<HttpEvent<any>> {
    const atual = this.authService.getAccessToken();
    if (atual && atual !== tokenUsado) {
      // outra requisicao ja renovou o token: repete uma vez com o novo, sem novo refresh
      return this.repetir(req, next, atual);
    }
    if (!this.authService.getRefreshToken()) {
      return this.encerrar(erro);
    }
    return this.authService.renovar().pipe(
      catchError(() => this.encerrar(erro)),
      switchMap(novoToken => this.repetir(req, next, novoToken))
    );
  }

  private repetir(req: HttpRequest<any>, next: HttpHandler, token: string): Observable<HttpEvent<any>> {
    return next.handle(this.comToken(req, token)).pipe(
      catchError(erro => erro instanceof HttpErrorResponse && erro.status === 401 ? this.encerrar(erro) : throwError(erro))
    );
  }

  private encerrar(erro: HttpErrorResponse): Observable<never> {
    this.authService.encerrarSessao();
    this.alerta.mostrar(mensagemDeErro(erro));
    return throwError(erro);
  }

  private comToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return token ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req;
  }

  private ehApi(url: string): boolean {
    // com apiUrl='' so caminho relativo ao host; '//host' (protocol-relative) iria para outro host
    if (environment.apiUrl === '') {
      return url.charAt(0) === '/' && url.charAt(1) !== '/';
    }
    return url.indexOf(environment.apiUrl + '/') === 0;
  }

  private ehAuth(url: string): boolean {
    return url.indexOf('/api/v1/auth/') >= 0;
  }
}
