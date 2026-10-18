import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUsuario } from '../model/IUsuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private http:HttpClient) { }

  
  public inserirUsuario(usuario : IUsuario) {
    
    return this.http.post<void>(environment.apiUrl + "/usuario/inserir", usuario);

  }

 
}
