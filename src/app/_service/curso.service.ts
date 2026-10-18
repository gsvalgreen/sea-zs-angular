import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IEvento } from '../model/IEvento';
import { IAgendamento } from '../model/IAgendamento';
import { paraIsoComOffset } from '../model/DataEnvio';
import { AuthService } from '../auth/auth.service';
import { ICurso } from '../model/ICurso';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  public inserirEvento(evento: IEvento) {
    
    evento.usuarioCriador = this.authService.getUsuario();
    const corpo = Object.assign({}, evento, { inicio: paraIsoComOffset(evento.inicio), fim: paraIsoComOffset(evento.fim) });
    return this.http.post<void>(environment.apiUrl + "/evento/inserir", corpo);
    }

  constructor(private http:HttpClient, private authService: AuthService) { }

  
  public getCursos() {
    
    return this.http.post<ICurso[]>(environment.apiUrl + "/curso/listar", null);

  }

  
}
