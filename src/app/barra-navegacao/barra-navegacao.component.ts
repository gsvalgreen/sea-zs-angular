import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-barra-navegacao',
  templateUrl: './barra-navegacao.component.html',
  styleUrls: ['./barra-navegacao.component.css']
})
export class BarraNavegacaoComponent implements OnInit {

  constructor(private authService: AuthService) { }

  get logado() { return this.authService.estaAutenticado(); }

  sair(evento: Event) {
    evento.preventDefault();
    this.authService.logout().subscribe();
  }

  ngOnInit() { }

}
