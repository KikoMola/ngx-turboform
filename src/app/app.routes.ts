import { Routes } from '@angular/router';
import { FormComponent } from './components/form/form.component';
import { MainComponent } from './layout/main/main.component';
import { CodeComponent } from './layout/code/code.component';
import { CustomizeComponent } from './layout/customize/customize.component';
import { LandingComponent } from './layout/landing/landing.component';
export const routes: Routes = [
  { 
    path: '', 
    component: MainComponent,
    children: [
      { path: 'form', component: CustomizeComponent },
      { path: 'code', component: CodeComponent },
      { path: '', redirectTo: 'form', pathMatch: 'full' }
    ]
  },
  { path: 'landing', component: LandingComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' }
];
