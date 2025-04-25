import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements OnInit {

  private router = inject(Router);

  ngOnInit(): void { }

  goToDocs(): void {
    this.router.navigate(['/customize']);
  }

}
