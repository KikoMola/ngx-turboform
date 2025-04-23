import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { FormComponent } from '../../components/form/form.component';
import { CreatorComponent } from '../../components/creator/creator.component';
import { CommonModule } from '@angular/common';
import { CodeComponent } from '../code/code.component';
@Component({
  selector: 'app-customize',
  standalone: true,
  imports: [
    CommonModule,
    FormComponent,
    CreatorComponent,
    CodeComponent
  ],
  templateUrl: './customize.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
      padding: 1rem;
      box-sizing: border-box;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomizeComponent implements OnInit {
  
  currentView: 'form' | 'creator' = 'form';

  ngOnInit(): void {}

  setView(view: 'form' | 'creator'): void {
    this.currentView = view;
  }
}
