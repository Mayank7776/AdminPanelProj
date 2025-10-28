import { Component, Input } from '@angular/core';
import { RouterModule} from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../../app/core/service/auth/auth';
import { API_CONFIG } from '../../core/service/config/api.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  @Input() isCollapsed = false;

  userRole: string = '';
  userImage: string = '';
  baseUrl = API_CONFIG.BASE_URL;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    const user_role = localStorage.getItem('user_role');
    const user_image = localStorage.getItem('user_image');

    if (user_role) {
      try {
        const parsedRole = JSON.parse(user_role);
        this.userRole = Array.isArray(parsedRole) ? parsedRole[0] : parsedRole;
      } catch (error) {
        console.error('Error parsing user role:', error);
      }
    }

    if (user_image) {
      try {
        this.userImage = this.baseUrl + user_image;
      } catch (err) {
        console.log('Error in sidebar image load:', err);
      }
    }
  }
}


// method




























  // @Input() sideBarOpen = false;
  // @Output() toggle = new EventEmitter<boolean>();
   
  // baseUrl = API_CONFIG.BASE_URL;
  // userName: string = '';
  // userRole: string = '';
  // userImage: string = '';

  // constructor(private authService: AuthService) { }

  // ngOnInit() {
  //   const userData = localStorage.getItem('user_info');
  //   const roleData = localStorage.getItem('user_role');
  //   const userImage = localStorage.getItem('user_image');

  //   if (userData) {
  //     try {
  //       const parsed = JSON.parse(userData);
  //       this.userName = parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User';
  //       this.userImage = parsed.image || this.baseUrl+userImage;
  //     } catch (error) { console.error(error); }
  //   }

  //   if (roleData) {
  //     try {
  //       const parsedRole = JSON.parse(roleData);
  //       this.userRole = Array.isArray(parsedRole) ? parsedRole[0] : parsedRole;
  //     } catch (error) { console.error(error); }
  //   }
  // }

  // toggleSidebar() {
  //   this.sideBarOpen = !this.sideBarOpen;
  //   this.toggle.emit(this.sideBarOpen);
  // }

  // handleImageError(){
  //   this.userImage = 'data:image/jpeg;base64,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'; // fallback
  // };
