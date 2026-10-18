import { Component, OnInit } from '@angular/core';
import { ICurso } from '../model/ICurso';
import { CursoService } from '../_service/curso.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-form-curso',
  templateUrl: './form-curso.component.html',
  styleUrls: ['./form-curso.component.css']
})
export class FormCursoComponent implements OnInit {

  constructor(private router : Router, private cursoService : CursoService, private authService : AuthService) { }

  cursos : ICurso[];
  // so UX: ADMIN/FUNCIONARIO escrevem em curso; a autorizacao real e do backend
  podeGerenciar = this.authService.podeGerenciarEstruturas();

  ngOnInit() {
    this.cursoService.getCursos().subscribe
    (data => {
      this.cursos = data;  
      console.log(data[0].id);
   
    });
  }

}
