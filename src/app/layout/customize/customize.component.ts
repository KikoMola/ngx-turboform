import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { FormComponent } from '../../components/form/form.component';
import { CreatorComponent } from '../../components/creator/creator.component';
@Component({
  selector: 'app-customize',
  standalone: true,
  imports: [FormComponent, CreatorComponent],
  templateUrl: './customize.component.html',
  styles: `
    :host {
      display: block;
      height: 100vh;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomizeComponent implements OnInit {
  ngOnInit(): void {}
}
