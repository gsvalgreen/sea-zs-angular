import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

function jwt(roles: string[]): string {
  return 'x.' + btoa(JSON.stringify({ sub: '7', roles: roles })) + '.y';
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;
  const rota = (perfis?: string[]): any => ({ data: perfis ? { perfis: perfis } : {} });

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule] });
    guard = TestBed.get(AuthGuard);
    router = TestBed.get(Router);
    spyOn(router, 'navigate');
  });

  afterEach(() => sessionStorage.clear());

  it('sem sessao bloqueia e manda para o login', () => {
    expect(guard.canActivate(rota())).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('com sessao libera', () => {
    sessionStorage.setItem('auth.refreshToken', 'r');
    sessionStorage.setItem('auth.accessToken', jwt(['ROLE_ALUNO']));
    expect(guard.canActivate(rota())).toBe(true);
  });

  it('exige um dos perfis da rota', () => {
    sessionStorage.setItem('auth.refreshToken', 'r');
    sessionStorage.setItem('auth.accessToken', jwt(['ROLE_ALUNO']));
    expect(guard.canActivate(rota(['ROLE_ADMIN', 'ROLE_PROFESSOR']))).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/usuario-inicio']);

    sessionStorage.setItem('auth.accessToken', jwt(['ROLE_PROFESSOR']));
    expect(guard.canActivate(rota(['ROLE_ADMIN', 'ROLE_PROFESSOR']))).toBe(true);
  });
});
