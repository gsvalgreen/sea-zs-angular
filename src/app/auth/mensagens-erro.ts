import { HttpErrorResponse } from '@angular/common/http';

/** Converte o Retry-After (segundos) em texto; sem o header (ou ilegivel por CORS) usa mensagem generica. */
export function mensagemEsperar(segundos: string): string {
  const s = Number.parseInt(segundos, 10);
  if (!s || s < 1) {
    return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.';
  }
  const minutos = Math.ceil(s / 60);
  return s < 60
    ? 'Muitas tentativas. Tente novamente em ' + s + ' segundo(s).'
    : 'Muitas tentativas. Tente novamente em ' + minutos + ' minuto(s).';
}

/** Mensagens genericas por status (ProblemDetail: nao repete detalhes do servidor, que podem ser tecnicos). */
export function mensagemDeErro(erro: HttpErrorResponse): string {
  switch (erro.status) {
    case 0: return 'Não foi possível conectar ao servidor.';
    case 400: return 'Dados inválidos. Confira os campos e tente novamente.';
    case 401: return 'Sessão expirada. Faça login novamente.';
    case 403: return 'Você não tem permissão para realizar esta ação.';
    case 409: return 'Conflito: o registro já existe ou foi alterado.';
    case 429: return mensagemEsperar(erro.headers ? erro.headers.get('Retry-After') : null);
    default: return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
  }
}
