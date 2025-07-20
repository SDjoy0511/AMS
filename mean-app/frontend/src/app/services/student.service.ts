import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Student {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  class: string;
  section: string;
  academicYear: string;
  attendance: AttendanceRecord[];
  attendancePercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
  remarks?: string;
}

export interface StudentsResponse {
  success: boolean;
  students: Student[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface StudentResponse {
  success: boolean;
  student: Student;
}

export interface AttendanceResponse {
  success: boolean;
  attendance: AttendanceRecord[];
  totalRecords: number;
  attendancePercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getStudents(params?: {
    page?: number;
    limit?: number;
    class?: string;
    section?: string;
    search?: string;
  }): Observable<StudentsResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<StudentsResponse>(this.apiUrl, { params: httpParams });
  }

  getStudent(id: string): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/${id}`);
  }

  createStudent(studentData: {
    studentId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    class: string;
    section: string;
    academicYear: string;
    email: string;
    password: string;
  }): Observable<StudentResponse> {
    return this.http.post<StudentResponse>(this.apiUrl, studentData);
  }

  updateStudent(id: string, studentData: Partial<Student>): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.apiUrl}/${id}`, studentData);
  }

  deleteStudent(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  markAttendance(studentId: string, attendanceData: {
    status: 'present' | 'absent' | 'late' | 'excused';
    date?: string;
    remarks?: string;
  }): Observable<{ success: boolean; message: string; attendance: AttendanceRecord }> {
    return this.http.post<{ success: boolean; message: string; attendance: AttendanceRecord }>(
      `${this.apiUrl}/${studentId}/attendance`,
      attendanceData
    );
  }

  getAttendance(studentId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Observable<AttendanceResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value);
        }
      });
    }

    return this.http.get<AttendanceResponse>(`${this.apiUrl}/${studentId}/attendance`, {
      params: httpParams
    });
  }

  batchMarkAttendance(className: string, section: string, data: { date?: string; records: { studentId: string; status: 'present' | 'absent' | 'late' | 'excused'; remarks?: string; }[] }): Observable<{ success: boolean; results: any[] }> {
    return this.http.post<{ success: boolean; results: any[] }>(
      `${this.apiUrl}/class/${className}/section/${section}/attendance`,
      data
    );
  }

  getClassmates(className: string, section: string): Observable<StudentsResponse> {
    return this.http.get<StudentsResponse>(`${this.apiUrl}?class=${className}&section=${section}`);
  }
} 