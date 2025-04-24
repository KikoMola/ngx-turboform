
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-main',
    imports: [RouterModule],
    templateUrl: './main.component.html',
    styleUrl: './main.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent {
  private router = inject(Router);
}
