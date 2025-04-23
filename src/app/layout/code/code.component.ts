import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';

@Component({
  selector: 'app-code',
  standalone: true,
  imports: [],
  templateUrl: './code.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeComponent implements OnInit {

  ngOnInit(): void { }

}
