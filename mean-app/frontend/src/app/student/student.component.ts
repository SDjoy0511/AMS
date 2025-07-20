import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService, User } from '../services/auth.service';
import { StudentService, Student, AttendanceRecord } from '../services/student.service';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressBarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit {
  currentUser: User | null = null;
  student: Student | null = null;
  attendanceRecords: AttendanceRecord[] = [];
  loading = false;
  attendanceLoading = false;
  classmates: Student[] = [];
  sectionAverageAttendance: number | null = null;
  
  // Pagination
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage = 0;
  totalRecords = 0;
  
  // Filter form
  filterForm: FormGroup;
  
  // Table columns
  displayedColumns: string[] = ['date', 'status', 'remarks'];

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private router: Router,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {
    this.filterForm = this.formBuilder.group({
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadStudentData();
  }

  loadStudentData(): void {
    this.loading = true;
    
    // For students, we need to find their student record
    if (this.currentUser?.role === 'student') {
      // In a real app, you might have a way to get the student ID from the user
      // For now, we'll show a message that this feature needs to be implemented
      this.snackBar.open('Student profile view needs to be implemented with proper student ID mapping', 'Close', {
        duration: 5000
      });
      this.loading = false;
      return;
    }

    this.loading = false;
  }

  loadClassmates(): void {
    if (!this.student) return;
    this.studentService.getClassmates(this.student.class, this.student.section).subscribe({
      next: (res) => {
        this.classmates = res.students.filter(s => s._id !== this.student!._id);
        // Calculate section average attendance
        if (this.classmates.length > 0) {
          const total = this.classmates.reduce((sum, s) => sum + (s.attendancePercentage || 0), 0);
          this.sectionAverageAttendance = Math.round(total / this.classmates.length);
        } else {
          this.sectionAverageAttendance = null;
        }
      },
      error: () => {
        this.classmates = [];
        this.sectionAverageAttendance = null;
      }
    });
  }

  loadAttendanceRecords(): void {
    if (!this.student) return;

    this.attendanceLoading = true;
    const params: any = {};
    
    if (this.filterForm.value.startDate) {
      params.startDate = this.filterForm.value.startDate.toISOString().split('T')[0];
    }
    if (this.filterForm.value.endDate) {
      params.endDate = this.filterForm.value.endDate.toISOString().split('T')[0];
    }

    this.studentService.getAttendance(this.student._id, params).subscribe({
      next: (response) => {
        this.attendanceRecords = response.attendance;
        this.totalRecords = response.totalRecords;
        this.attendanceLoading = false;
      },
      error: (error) => {
        this.attendanceLoading = false;
        this.snackBar.open('Failed to load attendance records', 'Close', {
          duration: 3000
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAttendanceRecords();
  }

  onFilterSubmit(): void {
    this.currentPage = 0;
    this.loadAttendanceRecords();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadAttendanceRecords();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'present': return 'primary';
      case 'absent': return 'warn';
      case 'late': return 'accent';
      case 'excused': return 'basic';
      default: return 'basic';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'present': return 'check_circle';
      case 'absent': return 'cancel';
      case 'late': return 'schedule';
      case 'excused': return 'info';
      default: return 'help';
    }
  }

  getPresentOrLateCount(student: any): number {
    if (!student.attendance) return 0;
    return student.attendance.filter(
      (a: any) => a.status === 'present' || a.status === 'late'
    ).length;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}