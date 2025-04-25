import { Routes } from '@angular/router';
import { CustomizeComponent } from './layout/customize/customize.component';
import { LandingComponent } from './layout/landing/landing.component';
export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'form', component: CustomizeComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' },
];
