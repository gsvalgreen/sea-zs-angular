import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../login/login.service';
import { AuthService } from '../../auth/auth.service';
import { mensagemDeErro } from '../../auth/mensagens-erro';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private loginService : LoginService, private authService : AuthService, private formBuilder: FormBuilder, private router: Router) { }
  
  loginForm: FormGroup;
  submitted = false;
  erro: string = null;
  enviando = false;

   get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.erro = null;
    if (this.loginForm.invalid || this.enviando) {
      return;
    }
    this.enviando = true;
    const email = this.loginForm.value.email;
    const senha = this.loginForm.value.senha;
    this.loginService.login(email, senha).subscribe(
      () => {
        this.enviando = false;
        this.loginForm.reset();
        this.router.navigate(['/usuario-inicio']);
      },
      (falha: HttpErrorResponse) => {
        this.enviando = false;
        this.loginForm.controls['senha'].reset();
        // 401 e sempre generico: nao diz se o e-mail existe
        this.erro = falha.status === 401 ? 'E-mail ou senha inválidos.' : mensagemDeErro(falha);
      });
  }

  ngOnInit() {
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/usuario-inicio']);
    }
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      senha: ['', Validators.required]
  });
  }

}
