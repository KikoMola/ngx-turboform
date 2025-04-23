import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-creator',
  standalone: true,
  imports: [TranslatePipe],
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
