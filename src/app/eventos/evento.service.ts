import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IEvento } from '../model/IEvento';
import { IAgendamento } from '../model/IAgendamento';
import { paraIsoComOffset } from '../model/DataEnvio';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  public inserirEvento(evento: IEvento) {
    
    evento.usuarioCriador = this.authService.getUsuario();
    const corpo = Object.assign({}, evento, { inicio: paraIsoComOffset(evento.inicio), fim: paraIsoComOffset(evento.fim) });
    return this.http.post<void>(environment.apiUrl + "/evento/inserir", corpo);
    }

  constructor(private http:HttpClient, private authService: AuthService) { }

  
  public getEventos() {
    
    return this.http.post<IEvento[]>(environment.apiUrl + "/evento/listar", null);

  }

  getEvento(id : number) {
    return this.http.post<IAgendamento[]>(environment.apiUrl + "/agendamento/listarEvento/", {
      "id": id
    });
  }

  public getNumeroInscritos(id : number, nome: string) {
    return this.http.post<IAgendamento[]>(environment.apiUrl + "/atividade/inscricao/listarAtividade/", {
      "id": id,
      "nome": nome
    });
  }
}
