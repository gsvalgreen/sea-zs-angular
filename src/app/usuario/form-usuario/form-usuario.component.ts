import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../usuario.service';
import { HttpErrorResponse } from '@angular/common/http';
import { mensagemDeErro } from '../../auth/mensagens-erro';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-usuario',
  templateUrl: './form-usuario.component.html',
  styleUrls: ['./form-usuario.component.css']
})
export class FormUsuarioComponent implements OnInit {

  constructor(private usuarioService : UsuarioService, private formBuilder: FormBuilder, private router: Router) { }

 

  submitted = false;
  erro: string = null;
  inserirUsuario: FormGroup;

  onSubmit() {
    this.submitted = true;
    this.erro = null;
    // o cadastro publico sempre vira VISITANTE no backend: nao enviamos adm nem tipoUsuario
    this.usuarioService.inserirUsuario(this.inserirUsuario.value).subscribe(
      () => this.router.navigate(['/']),
      (falha: HttpErrorResponse) => this.erro = falha.status === 409 ? 'Não foi possível concluir o cadastro com esses dados.' : mensagemDeErro(falha));
  }

  ngOnInit() {
    this.inserirUsuario = this.formBuilder.group({
      nome: ['', Validators.required],
      rg: ['', Validators.required],
      celular: ['', Validators.required],
      email: ['', Validators.required],
      endereco: ['', Validators.required],
      senha: ['', Validators.required],
      genero: ['', Validators.required],
      dataNasc: ['', Validators.required],


  });
  }

}
