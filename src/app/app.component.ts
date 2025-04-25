import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  private translate = inject(TranslateService);

  constructor() {
    const defaultLang = 'es';
    this.translate.setDefaultLang(defaultLang);

    const supportedLangs = ['es', 'en'];
    const browserLang = this.translate.getBrowserLang()?.split('-')[0];

    const langToUse = browserLang && supportedLangs.includes(browserLang)
                        ? browserLang
                        : defaultLang;

    this.translate.use(langToUse);
  }
}
