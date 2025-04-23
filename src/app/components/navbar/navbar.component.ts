import { ChangeDetectionStrategy, Component, input, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  user = input.required<User>();
  // Iconos
  faSignOutAlt = faSignOutAlt;
  faUser = faUser;
  
  userName = 'Usuario Demo';

  constructor(private router: Router) {}

  ngOnInit(): void { }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/auth']);
  }

  getThemeColor(): string {
    try {
      const userValue = this.user();
      if (!userValue || !userValue.email) {
        return 'rose';
      }
      
      const email = userValue.email;
      if (email.includes('@bcbtravel.com')) {
        return 'indigo';
      } else if (email.includes('@opteam.com')) {
        return 'teal';
      } else {
        return 'rose';
      }
    } catch (error) {
      return 'rose';
    }
  }

  getTitleClass(): string {
    const color = this.getThemeColor();
    return `text-${color}-800`;
  }

  getUserBadgeClass(): string {
    const color = this.getThemeColor();
    return `bg-${color}-50`;
  }

  getUserIconClass(): string {
    const color = this.getThemeColor();
    return `text-${color}-600`;
  }

  getButtonHoverClass(): string {
    const color = this.getThemeColor();
    return `hover:bg-${color}-50 hover:text-${color}-600 hover:border-${color}-200`;
  }
}
