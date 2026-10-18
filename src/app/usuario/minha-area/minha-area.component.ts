import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { IUsuario } from '../../model/IUsuario';

@Component({
  selector: 'app-minha-area',
  templateUrl: './minha-area.component.html',
  styleUrls: ['./minha-area.component.css']
})
export class MinhaAreaComponent implements OnInit {

  constructor(private authService: AuthService) { }

  usuario : IUsuario;
  ngOnInit() {
    this.usuario = this.authService.getUsuario();
  }

}
