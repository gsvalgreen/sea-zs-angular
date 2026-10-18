import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let controller: HttpTestingController;
  const jwt = (roles: string[]) => 'x.' + btoa(JSON.stringify({ sub: '7', roles: roles })) + '.y';

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule] });
    service = TestBed.get(AuthService);
    controller = TestBed.get(HttpTestingController);
  });

  afterEach(() => sessionStorage.clear());

  it('login guarda somente os tokens no sessionStorage', () => {
    service.login('a@a.com', 'segredo').subscribe();
    const req = controller.expectOne(environment.apiUrl + '/api/v1/auth/login');
    expect(req.request.body).toEqual({ email: 'a@a.com', senha: 'segredo' });
    req.flush({ tokenType: 'Bearer', accessToken: jwt(['ROLE_PROFESSOR']), expiresIn: 900, refreshToken: 'r1',
      usuario: { id: 7, nome: 'Ana', tipoUsuario: 'PROFESSOR', authorities: ['ROLE_PROFESSOR'] } });

    expect(sessionStorage.length).toBe(2);
    expect(JSON.stringify(sessionStorage)).not.toContain('segredo');
    expect(JSON.stringify(sessionStorage)).not.toContain('Ana');
    expect(service.getUsuario().nome).toBe('Ana');
  });

  it('perfis do JWT definem o que a UI mostra', () => {
    sessionStorage.setItem('auth.accessToken', jwt(['ROLE_PROFESSOR']));
    expect(service.podeCriarEvento()).toBe(true);
    expect(service.podeGerenciarEstruturas()).toBe(false);
    sessionStorage.setItem('auth.accessToken', jwt(['ROLE_FUNCIONARIO']));
    expect(service.podeGerenciarEstruturas()).toBe(true);
    sessionStorage.setItem('auth.accessToken', jwt(['ROLE_ALUNO']));
    expect(service.podeCriarEvento()).toBe(false);
  });

  it('token malformado nao quebra', () => {
    sessionStorage.setItem('auth.accessToken', 'lixo');
    expect(service.getPerfis()).toEqual([]);
    expect(service.getUsuario().id).toBeUndefined();
  });

  it('cancelar o assinante nao aborta o refresh: o novo par e guardado', () => {
    sessionStorage.setItem('auth.refreshToken', 'r1');
    service.renovar().subscribe().unsubscribe();
    const req = controller.expectOne(environment.apiUrl + '/api/v1/auth/refresh');
    req.flush({ tokenType: 'Bearer', accessToken: 'a2', expiresIn: 900, refreshToken: 'r2',
      usuario: { id: 7, nome: 'Ana', tipoUsuario: 'PROFESSOR', authorities: [] } });
    expect(sessionStorage.getItem('auth.refreshToken')).toBe('r2');
    expect(sessionStorage.getItem('auth.accessToken')).toBe('a2');
    // liberado: nova chamada gera nova requisicao
    service.renovar().subscribe(() => {}, () => {});
    controller.expectOne(environment.apiUrl + '/api/v1/auth/refresh').flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('le o nome (UTF-8) do claim name do JWT apos recarregar', () => {
    const json = JSON.stringify({ sub: '7', name: 'José Conceição', roles: [] });
    const payload = btoa(unescape(encodeURIComponent(json)));
    sessionStorage.setItem('auth.accessToken', 'x.' + payload + '.y');
    expect(service.getUsuario().nome).toBe('José Conceição');
  });

  it('logout limpa tudo e revoga o refresh token no backend', () => {
    sessionStorage.setItem('auth.accessToken', 'a');
    sessionStorage.setItem('auth.refreshToken', 'r1');
    service.logout().subscribe();
    expect(sessionStorage.length).toBe(0);
    const req = controller.expectOne(environment.apiUrl + '/api/v1/auth/logout');
    expect(req.request.body).toEqual({ refreshToken: 'r1' });
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
