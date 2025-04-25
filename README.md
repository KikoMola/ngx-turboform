# ngx-turboform

A dynamic and customizable form generation library for Angular applications. `ngx-turboform` allows developers to define form structures using a simple configuration object and renders the corresponding form with various input types, validation, and styling options. It also includes a creator tool to visually build form configurations and preview them.

## Features

*   **Dynamic Form Generation:** Define forms using a TypeScript configuration object (`TurboFormConfig`).
*   **Variety of Input Types:** Supports common inputs like text, email, password, number, textarea, select, checkbox, radio, date, as well as special types like predictive search and form arrays.
*   **Layout Customization:** Control the layout using `colspanDesktop` and `colspanMobile` properties for responsive design.
*   **Built-in Validation:** Easily add standard Angular validators (required, minLength, maxLength, pattern, email, min, max) with custom error messages.
*   **Theming:** Customize the primary color theme of the form and buttons.
*   **Predictive Search:** Integrated support for predictive search inputs, emitting events for backend data fetching.
*   **Form Arrays:** Support for dynamically adding and removing groups of fields (FormArrays).
*   **Creator Component:** A utility component (`CreatorComponent`) to visually build `TurboFormConfig` objects, preview the form, and generate the corresponding TypeScript code.
*   **Code Generation & Preview:** The creator component provides a live preview of the generated form and the TypeScript configuration code.
*   **Internationalization Ready:** Uses `@ngx-translate/core` for labels and error messages.

## Getting Started

### Prerequisites

*   Node.js and npm
*   Angular CLI
*   An Angular project (v16+ recommended due to dependencies like `ngx-highlightjs`)
*   TailwindCSS (this project is made using V3 but V4 will work fine)
*   NGX Translate 

### Usage

1.  **Create `NgxTurboFormComponent`:** or any other name you wish for your component.
2.  **Copy the Typescript code:** in your ngx-turboform.component.ts.
3.  **Copy the HTML code:** in your ngx-turboform.component.html.

```typescript
// your-component.ts
import { Component } from '@angular/core';
import { NgxTurboFormComponent, TurboFormConfig } from 'ngx-turboform'; // Adjust path if local
import { SearchService, SearchResult } from './path/to/search.service'; // Example service
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [NgxTurboFormComponent /*, other necessary modules */],
  template: `
    <ngx-turbo-form
      [config]="myConfig"
      (formSubmit)="handleFormSubmit($event)"
      (searchRequest)="handleSearchRequest($event)"
      (loadDefaultValue)="handleLoadDefaultValue($event)"
    />
  `
})
export class YourComponent implements OnInit, OnDestroy {
  myConfig: TurboFormConfig = {
    color: 'indigo',
    submitText: 'Submit Application',
    controls: [
      // ... your TurboFormControlConfig objects here ...
      { type: 'text', label: 'Name', name: 'userName', required: true, validators: [{ type: 'required', message: 'Name is required' }] },
      { type: 'email', label: 'Email', name: 'userEmail', validators: [{ type: 'email', message: 'Invalid email format' }] },
      // ... more controls
    ]
  };

  // Add handlers for outputs (formSubmit, searchRequest, loadDefaultValue)
  // Similar to the implementation in `form.component.ts` or `creator.component.ts`

  handleFormSubmit(formData: any) {
    console.log('Form Submitted:', formData);
    // Process form data
  }

  // ... implement handleSearchRequest and handleLoadDefaultValue if using predictive search ...
}
```

### Creator Component

The `CreatorComponent` (`src/app/components/creator`) provides a UI to:

*   Select different control types.
*   Configure common properties (label, name, placeholder, default value, layout).
*   Configure specific options for `select`, `radio`, `predictiveSearch`, and `array`.
*   See a live preview of the form being built.
*   Generate the `TurboFormConfig` TypeScript code, ready to copy.

The `CodeComponent` (`src/app/layout/code`) displays the core interfaces and essential code snippets for reference.

## License

This project is licensed under the **MIT License**.

This means you are free to:

*   **Use:** Use the software for any purpose, including commercial applications.
*   **Modify:** Modify the software to suit your needs.
*   **Distribute:** Distribute the original or modified versions of the software.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  **Fork** the repository on GitHub.
2.  **Clone** your forked repository to your local machine.
3.  Create a new **branch** for your feature or bug fix (`git checkout -b feature/your-feature-name` or `bugfix/issue-description`).
4.  Make your changes and **commit** them with clear, descriptive messages.
5.  **Push** your changes to your forked repository (`git push origin feature/your-feature-name`).
6.  Open a **Pull Request** (PR) from your branch to the `main` branch of the original repository.
7.  Clearly describe the changes you've made and why in the PR description.

Please ensure your code adheres to the existing style and that any relevant tests pass (if tests are implemented).

## Proposing Enhancements or Reporting Issues

*   **Found a Bug?** If you encounter a bug, please open an issue on the GitHub repository. Include steps to reproduce the bug, the expected behavior, and the actual behavior.
*   **Have an Idea?** If you have a suggestion for an enhancement or a new feature, feel free to open an issue. Describe your idea clearly and explain the potential benefits.

Thank you for your interest in `ngx-turboform`!

