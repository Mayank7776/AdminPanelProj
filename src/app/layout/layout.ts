import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from './sidebar/sidebar';
import { Navbar } from './navbar/navbar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, Sidebar,Navbar,RouterModule],
  templateUrl: './layout.html',
})
export class Layout {
  Open = false;

  toggleSidebar() {
    this.Open = !this.Open;
  }
}
