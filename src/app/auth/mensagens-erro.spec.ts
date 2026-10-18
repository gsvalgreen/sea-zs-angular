import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { mensagemDeErro } from './mensagens-erro';

describe('mensagemDeErro', () => {
  it('429 usa o Retry-After em segundos ou minutos', () => {
    const com = (s: string) => new HttpErrorResponse({ status: 429, headers: new HttpHeaders({ 'Retry-After': s }) });
    expect(mensagemDeErro(com('30'))).toContain('30 segundo');
    expect(mensagemDeErro(com('900'))).toContain('15 minuto');
  });

  it('429 sem Retry-After (ex.: CORS nao expoe o header) usa mensagem generica', () => {
    expect(mensagemDeErro(new HttpErrorResponse({ status: 429 }))).toContain('Aguarde');
  });

  it('403 e demais status', () => {
    expect(mensagemDeErro(new HttpErrorResponse({ status: 403 }))).toContain('permissão');
    expect(mensagemDeErro(new HttpErrorResponse({ status: 0 }))).toContain('conectar');
  });
});
