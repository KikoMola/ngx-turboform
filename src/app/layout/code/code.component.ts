import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { interfaceTurboFormConfig, interfaceTurboFormControlConfig } from '../../components/ngx-turbo-form/constants/constants';
import { Highlight } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-code',
    imports: [
        CommonModule,
        Highlight,
        HighlightLineNumbers,
        ClipboardModule
    ],
    templateUrl: './code.component.html',
    styles: `
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      padding: 1rem;
      box-sizing: border-box;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeComponent implements OnInit {
  INTERFACE_TURBO_FORM_CONTROL_CONFIG = interfaceTurboFormControlConfig;
  
  INTERFACE_TURBO_FORM_CONFIG = interfaceTurboFormConfig;

  ngOnInit(): void { }

  onCopy(result: boolean): void {
      if (result) {
          console.log('Interfaz copiada al portapapeles!');
      }
  }

}
