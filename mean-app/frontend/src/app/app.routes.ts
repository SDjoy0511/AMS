import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { StudentComponent } from './student/student.component';
import { AuthGuard } from './guards/auth.guard';
import { TeacherAttendance } from './teacher-attendance/teacher-attendance';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'student', component: StudentComponent, canActivate: [AuthGuard] },
  { path: 'teacher-attendance', component: TeacherAttendance, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
