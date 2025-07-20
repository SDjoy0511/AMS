import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [CommonModule]
})
export class AppComponent {
  showTeacherAttendanceNav = false;

  constructor() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.showTeacherAttendanceNav = ['teacher', 'admin'].includes(user.role);
  }
}
