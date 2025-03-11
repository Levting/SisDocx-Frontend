import {Component} from '@angular/core';
import {User} from '../../../models/user/user';
import {UserService} from '../../../core/services/user.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.css'
})
export class HomeDashboardComponent {
  errorMessage: string = "";
  user?: User;

  constructor(private userService: UserService) {
    this.userService.getUser(environment.userID).subscribe({
      next: (userData: User) => {
        this.user = userData;
      },
      error: (error: any) => {
        this.errorMessage = error;
      },
      complete: (): void => {
        console.info("User Data OK")
      }
    })
  }
}
