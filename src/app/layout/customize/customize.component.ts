import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';

@Component({
  selector: 'app-customize',
  standalone: true,
  imports: [],
  templateUrl: './customize.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomizeComponent implements OnInit {

  ngOnInit(): void { }

}
