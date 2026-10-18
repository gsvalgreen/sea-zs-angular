import { Component } from '@angular/core';
import { AlertaService } from './auth/alerta.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sea-zs-angular';

  constructor(public alerta: AlertaService) { }

  
}
