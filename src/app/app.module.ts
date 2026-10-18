import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { PainelEventosComponent } from './eventos/painel-eventos/painel-eventos.component';
import { BarraNavegacaoComponent } from './barra-navegacao/barra-navegacao.component';
import { ConsultaEventoComponent } from './eventos/consulta-evento/consulta-evento.component';
import { LoginComponent } from './usuario/login/login.component';
import { UsuarioInicioComponent } from './usuario/usuario-inicio/usuario-inicio.component';
import { RodapeComponent } from './rodape/rodape.component';
import { NgForm } from '@angular/forms';
import { FormCursoComponent } from './form-curso/form-curso.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth.interceptor';
import { AuthGuard } from './auth/auth.guard';
import { ConsultaAtividadeComponent } from './atividade/consulta-atividade/consulta-atividade.component';
import { FormUsuarioComponent } from './usuario/form-usuario/form-usuario.component';
import { MinhaAreaComponent } from './usuario/minha-area/minha-area.component';
import { FormUsuarioLogComponent } from './usuario/form-usuario-log/form-usuario-log.component';
import { FormEventoComponent } from './form-evento/form-evento.component'; 

let routes = [
  { path: "consulta-atividade", component: ConsultaAtividadeComponent, canActivate: [AuthGuard] },
  { path : "usuario-inicio", component: UsuarioInicioComponent, canActivate: [AuthGuard]},
  { path : "", component: LoginComponent},
  { path : "consulta-evento/:id/:nome/:descricao", component: ConsultaEventoComponent, canActivate: [AuthGuard]},
  { path : "form-usuario", component: FormUsuarioComponent},
  { path : "minha-area", component: MinhaAreaComponent, canActivate: [AuthGuard]},
  { path : "form-usuario-log", component: FormUsuarioLogComponent, canActivate: [AuthGuard]},
  { path : "form-curso", component: FormCursoComponent, canActivate: [AuthGuard]},
  { path : "form-evento", component: FormEventoComponent, canActivate: [AuthGuard], data: { perfis: ['ROLE_ADMIN', 'ROLE_FUNCIONARIO', 'ROLE_PROFESSOR'] }}
]

@NgModule({
  declarations: [
    AppComponent,
    PainelEventosComponent,
    BarraNavegacaoComponent,
    ConsultaEventoComponent,
    LoginComponent,
    UsuarioInicioComponent,
    RodapeComponent,
    FormCursoComponent,
    ConsultaAtividadeComponent,
    FormUsuarioComponent,
    MinhaAreaComponent,
    FormUsuarioLogComponent,
    FormEventoComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
