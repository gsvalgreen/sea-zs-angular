import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, share, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IUsuario } from '../model/IUsuario';

export interface ITokenResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  usuario: { id: number, nome: string, tipoUsuario: string, authorities: string[] };
}

const CHAVE_ACESSO = 'auth.accessToken';
const CHAVE_REFRESH = 'auth.refreshToken';

/**
 * Sessao do usuario. Guarda SOMENTE os tokens (sessionStorage); o nome fica so em memoria.
 * Perfis vem do JWT e servem apenas de UX: a autorizacao real e do backend.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static readonly URL_LOGIN = '/api/v1/auth/login';
  static readonly URL_REFRESH = '/api/v1/auth/refresh';
  static readonly URL_LOGOUT = '/api/v1/auth/logout';

  private nome: string = null;
  private renovando: Observable<string> = null;

  constructor(private http: HttpClient, private router: Router) { }

  public login(email: string, senha: string): Observable<void> {
    return this.http.post<ITokenResponse>(environment.apiUrl + AuthService.URL_LOGIN, { email: email, senha: senha }).pipe(
      tap(resposta => this.guardar(resposta)),
      map(() => undefined)
    );
  }

  /** Troca o refresh token (rotativo) por um novo par. Chamadas simultaneas dividem uma unica requisicao. */
  public renovar(): Observable<string> {
    if (!this.renovando) {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return throwError(new Error('sem refresh token'));
      }
      this.renovando = this.http.post<ITokenResponse>(environment.apiUrl + AuthService.URL_REFRESH, { refreshToken: refreshToken }).pipe(
        tap(resposta => this.guardar(resposta)),
        map(resposta => resposta.accessToken),
        finalize(() => this.renovando = null),
        share()
      );
    }
    return this.renovando;
  }

  /** Revoga a sessao no backend (melhor esforco) e limpa o estado local. */
  public logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    this.limpar();
    this.router.navigate(['/']);
    if (!refreshToken) {
      return of(undefined);
    }
    return this.http.post<void>(environment.apiUrl + AuthService.URL_LOGOUT, { refreshToken: refreshToken }).pipe(
      catchError(() => of(undefined))
    );
  }

  /** Encerra a sessao local sem chamar o backend (refresh falhou ou sessao revogada). */
  public encerrarSessao() {
    this.limpar();
    this.router.navigate(['/']);
  }

  public getAccessToken(): string {
    return this.ler(CHAVE_ACESSO);
  }

  public getRefreshToken(): string {
    return this.ler(CHAVE_REFRESH);
  }

  public estaAutenticado(): boolean {
    return !!this.getRefreshToken() || !!this.getAccessToken();
  }

  /** Papeis do JWT (ex.: ROLE_ADMIN, ROLE_PROFESSOR). So para UX. */
  public getPerfis(): string[] {
    const claims = this.claims();
    return claims && Array.isArray(claims.roles) ? claims.roles : [];
  }

  public temPerfil(...perfis: string[]): boolean {
    const meus = this.getPerfis();
    return perfis.some(p => meus.indexOf(p) >= 0);
  }

  /** ADMIN e FUNCIONARIO: tudo nas estruturas (evento, curso, disciplina, papel, agendamento, atividade). */
  public podeGerenciarEstruturas(): boolean {
    return this.temPerfil('ROLE_ADMIN', 'ROLE_FUNCIONARIO');
  }

  /** PROFESSOR so cria evento, agendamento e atividade. */
  public podeCriarEvento(): boolean {
    return this.temPerfil('ROLE_ADMIN', 'ROLE_FUNCIONARIO', 'ROLE_PROFESSOR');
  }

  /** Dados minimos da sessao (id do JWT; nome so em memoria). Nao ha dado pessoal persistido. */
  public getUsuario(): IUsuario {
    const usuario = new IUsuario();
    const claims = this.claims();
    if (claims && claims.sub) {
      usuario.id = Number.parseInt(claims.sub, 10);
    }
    usuario.nome = this.nome;
    return usuario;
  }

  private guardar(resposta: ITokenResponse) {
    try {
      sessionStorage.setItem(CHAVE_ACESSO, resposta.accessToken);
      sessionStorage.setItem(CHAVE_REFRESH, resposta.refreshToken);
    } catch (e) { /* armazenamento indisponivel: a sessao nao sobrevive ao recarregar */ }
    this.nome = resposta.usuario ? resposta.usuario.nome : null;
  }

  private limpar() {
    this.nome = null;
    this.renovando = null;
    try {
      sessionStorage.removeItem(CHAVE_ACESSO);
      sessionStorage.removeItem(CHAVE_REFRESH);
    } catch (e) { }
  }

  private ler(chave: string): string {
    try {
      return sessionStorage.getItem(chave);
    } catch (e) {
      return null;
    }
  }

  private claims(): any {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }
}
