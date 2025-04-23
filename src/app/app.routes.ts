import { Routes } from '@angular/router';
import { FormComponent } from './components/form/form.component';
import { MainComponent } from './layout/main/main.component';
export const routes: Routes = [
  { 
    path: '', 
    component: MainComponent,
    children: [
      { path: 'form', component: FormComponent },
      { path: '', redirectTo: 'form', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' }
];
