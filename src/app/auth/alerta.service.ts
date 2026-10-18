import { Injectable } from '@angular/core';

/** Mensagem de erro global exibida pelo AppComponent (403, 429 etc.). */
@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  mensagem: string = null;

  mostrar(mensagem: string) {
    this.mensagem = mensagem;
  }

  limpar() {
    this.mensagem = null;
  }
}
