import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class AppComponent {
  showTeacherAttendanceNav = false;

  constructor() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.showTeacherAttendanceNav = ['teacher', 'admin'].includes(user.role);
  }
}
