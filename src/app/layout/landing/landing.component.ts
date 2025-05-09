import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, TranslatePipe],
  templateUrl: './landing.component.html',
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements OnInit {

  private router = inject(Router);

  ngOnInit(): void { }

  goToDocs(): void {
    this.router.navigate(['/form']);
  }

}
