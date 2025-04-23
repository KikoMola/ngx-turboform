import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';

@Component({
  selector: 'app-creator',
  standalone: true,
  imports: [],
  templateUrl: './creator.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorComponent implements OnInit {

  ngOnInit(): void { }

}
