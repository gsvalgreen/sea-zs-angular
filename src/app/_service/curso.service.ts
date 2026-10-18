import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IEvento } from '../model/IEvento';
import { IAgendamento } from '../model/IAgendamento';
import { IUsuario } from '../model/IUsuario';
import { ICurso } from '../model/ICurso';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  usuarioLogado = new IUsuario();
  public inserirEvento(evento: IEvento) {
    
    evento.usuarioCriador = this.usuarioLogado; 
    return this.http.post<void>(environment.apiUrl + "/evento/inserir", evento);
    }

  constructor(private http:HttpClient) { }

  
  public getCursos() {
    
    return this.http.post<ICurso[]>(environment.apiUrl + "/curso/listar", null);

  }

  
}
