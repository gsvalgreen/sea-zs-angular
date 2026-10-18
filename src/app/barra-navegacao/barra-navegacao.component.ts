import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { IUsuario } from '../model/IUsuario';

@Component({
  selector: 'app-barra-navegacao',
  templateUrl: './barra-navegacao.component.html',
  styleUrls: ['./barra-navegacao.component.css']
})
export class BarraNavegacaoComponent implements OnInit {

  constructor(private authService: AuthService) { }

  usuario : IUsuario;

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
  }

}
