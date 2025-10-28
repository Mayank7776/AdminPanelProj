import { TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TitleCasePipe, RouterModule],
  templateUrl: './navbar.html'
})
export class Navbar {
@Output() toggleSidebar = new EventEmitter<void>();
profileOpen = false;


ngOnInit(){
const userInfo = localStorage.getItem('user_info');
const userName = localStorage.getItem('user_name');
if(userInfo){
  try{
    const parsed = JSON.parse(userInfo);
    this.userName = parsed.name || userName;
  } catch(err){
     console.log('Error parsing user_info', err);
  }
}
}

// Properties
userName = 'John Doe';

// Methods
logOut(){
  localStorage.clear();
  location.reload();
}




  // @Input() sidebarOpen = false;
  // @Output() toggle = new EventEmitter<void>();
  // userName = 'John Doe'; // replace this with actual user info

  // ngOnInit(){
  //   const userInfo = localStorage.getItem('user_info');
  //   const userName = localStorage.getItem('user_name');
  //   if (userInfo) {
  //     try {
  //       const parsed = JSON.parse(userInfo);
        
  //       // ✅ Handle both API and token-based names
  //       this.userName =
  //         parsed.name ||
  //         userName||
  //         'User';
  //     } catch (err) {
  //       console.error('Error parsing user_info:', err);
  //     }
  //   }
  // }
  
  // toggleSidebar() {
  //   this.toggle.emit();
  // }

  // logout() {
  //   localStorage.clear();
  //   location.reload();
  // }
}
