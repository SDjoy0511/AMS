import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentService, Student } from '../services/student.service';

@Component({
  selector: 'app-teacher-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './teacher-attendance.html',
  styleUrl: './teacher-attendance.scss'
})
export class TeacherAttendance implements OnInit {
  attendanceForm: FormGroup;
  students: Student[] = [];
  loading = false;
  submitted = false;
  classOptions: string[] = ['A', 'B', 'C', 'D']; // Example, replace with real data
  sectionOptions: string[] = ['1', '2', '3', '4']; // Example, replace with real data

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {
    this.attendanceForm = this.fb.group({
      class: [''],
      section: [''],
      date: [new Date().toISOString().split('T')[0]],
      records: this.fb.array([])
    });
  }

  ngOnInit(): void {}

  loadStudents(): void {
    this.loading = true;
    const className = this.attendanceForm.value.class;
    const section = this.attendanceForm.value.section;
    this.studentService.getStudents({ class: className, section }).subscribe({
      next: (res) => {
        this.students = res.students;
        // Initialize attendance records
        this.attendanceForm.setControl('records', this.fb.array(
          this.students.map(s => this.fb.group({
            studentId: [s._id],
            status: ['present'],
            remarks: ['']
          }))
        ));
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load students', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  submitAttendance(): void {
    if (!this.attendanceForm.valid) return;
    this.loading = true;
    const { class: className, section, date, records } = this.attendanceForm.value;
    this.studentService.batchMarkAttendance(className, section, { date, records }).subscribe({
      next: (res) => {
        this.snackBar.open('Attendance submitted successfully!', 'Close', { duration: 3000 });
        this.submitted = true;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to submit attendance', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
