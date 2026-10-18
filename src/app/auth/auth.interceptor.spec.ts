import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { AlertaService } from './alerta.service';
import { environment } from '../../environments/environment';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let alerta: AlertaService;
  let router: Router;
  const api = environment.apiUrl;

  const resposta = (acesso: string, refresh: string) => ({
    tokenType: 'Bearer', accessToken: acesso, expiresIn: 900, refreshToken: refresh,
    usuario: { id: 1, nome: 'Ana', tipoUsuario: 'PROFESSOR', authorities: [] }
  });

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService, AlertaService, { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }]
    });
    http = TestBed.get(HttpClient);
    controller = TestBed.get(HttpTestingController);
    alerta = TestBed.get(AlertaService);
    router = TestBed.get(Router);
    spyOn(router, 'navigate');
    sessionStorage.setItem('auth.accessToken', 'acesso-1');
    sessionStorage.setItem('auth.refreshToken', 'refresh-1');
  });

  afterEach(() => {
    controller.verify();
    sessionStorage.clear();
  });

  it('envia Authorization: Bearer para a API', () => {
    http.post(api + '/evento/listar', null).subscribe();
    const req = controller.expectOne(api + '/evento/listar');
    expect(req.request.headers.get('Authorization')).toBe('Bearer acesso-1');
    req.flush([]);
  });

  it('nao envia o token para outro host nem para /api/v1/auth', () => {
    http.get('https://outro-host.com/x').subscribe();
    expect(controller.expectOne('https://outro-host.com/x').request.headers.has('Authorization')).toBe(false);
    http.post(api + '/api/v1/auth/login', {}).subscribe();
    expect(controller.expectOne(api + '/api/v1/auth/login').request.headers.has('Authorization')).toBe(false);
  });

  it('em 401 faz um refresh e repete a requisicao com o novo token', () => {
    let resultado: any;
    http.post(api + '/evento/listar', null).subscribe(r => resultado = r);
    controller.expectOne(api + '/evento/listar').flush({}, { status: 401, statusText: 'Unauthorized' });

    const refresh = controller.expectOne(api + '/api/v1/auth/refresh');
    expect(refresh.request.body).toEqual({ refreshToken: 'refresh-1' });
    refresh.flush(resposta('acesso-2', 'refresh-2'));

    const nova = controller.expectOne(api + '/evento/listar');
    expect(nova.request.headers.get('Authorization')).toBe('Bearer acesso-2');
    nova.flush(['ok']);
    expect(resultado).toEqual(['ok']);
    expect(sessionStorage.getItem('auth.refreshToken')).toBe('refresh-2');
  });

  it('401 simultaneos compartilham um unico refresh', () => {
    http.post(api + '/evento/listar', null).subscribe();
    http.post(api + '/curso/listar', null).subscribe();
    controller.expectOne(api + '/evento/listar').flush({}, { status: 401, statusText: 'Unauthorized' });
    controller.expectOne(api + '/curso/listar').flush({}, { status: 401, statusText: 'Unauthorized' });

    controller.expectOne(api + '/api/v1/auth/refresh').flush(resposta('acesso-2', 'refresh-2'));
    const repeticoes = controller.match(api + '/evento/listar').concat(controller.match(api + '/curso/listar'));
    expect(repeticoes.length).toBe(2);
    repeticoes.forEach(r => expect(r.request.headers.get('Authorization')).toBe('Bearer acesso-2'));
    repeticoes.forEach(r => r.flush([]));
  });

  it('com apiUrl vazio aceita caminho relativo e recusa URL protocol-relative', () => {
    const original = environment.apiUrl;
    environment.apiUrl = '';
    try {
      http.get('/evento/listar').subscribe();
      expect(controller.expectOne('/evento/listar').request.headers.get('Authorization')).toBe('Bearer acesso-1');
      http.get('//outro-host.com/x').subscribe();
      expect(controller.expectOne('//outro-host.com/x').request.headers.has('Authorization')).toBe(false);
    } finally {
      environment.apiUrl = original;
    }
  });

  it('se o refresh falhar, encerra a sessao sem nova tentativa', () => {
    let erro: HttpErrorResponse;
    http.post(api + '/evento/listar', null).subscribe(() => {}, e => erro = e);
    controller.expectOne(api + '/evento/listar').flush({}, { status: 401, statusText: 'Unauthorized' });
    controller.expectOne(api + '/api/v1/auth/refresh').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(erro.status).toBe(401);
    expect(sessionStorage.getItem('auth.accessToken')).toBeNull();
    expect(sessionStorage.getItem('auth.refreshToken')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('se a repeticao tambem der 401, encerra a sessao e nao tenta outro refresh', () => {
    http.post(api + '/evento/listar', null).subscribe(() => {}, () => {});
    controller.expectOne(api + '/evento/listar').flush({}, { status: 401, statusText: 'Unauthorized' });
    controller.expectOne(api + '/api/v1/auth/refresh').flush(resposta('acesso-2', 'refresh-2'));
    controller.expectOne(api + '/evento/listar').flush({}, { status: 401, statusText: 'Unauthorized' });

    controller.expectNone(api + '/api/v1/auth/refresh');
    expect(sessionStorage.getItem('auth.refreshToken')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('mostra aviso em 403', () => {
    http.post(api + '/curso/inserir', {}).subscribe(() => {}, () => {});
    controller.expectOne(api + '/curso/inserir').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(alerta.mensagem).toContain('permissão');
  });

  it('mostra o tempo de espera do Retry-After em 429', () => {
    http.post(api + '/evento/listar', null).subscribe(() => {}, () => {});
    controller.expectOne(api + '/evento/listar').flush({}, { status: 429, statusText: 'Too Many Requests', headers: { 'Retry-After': '30' } });
    expect(alerta.mensagem).toContain('30 segundo');
  });
});
