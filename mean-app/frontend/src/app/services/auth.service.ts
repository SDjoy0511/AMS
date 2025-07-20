import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// Add this at the top of your file
const isBrowser = typeof window !== 'undefined';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (isBrowser) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        this.currentUserSubject.next(JSON.parse(user));
      }
    }
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'teacher' | 'student';
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response.token, response.user);
          }
        })
      );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response.token, response.user);
          }
        })
      );
  }

  logout(): void {
    if (isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  updateProfile(profileData: { username?: string; email?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData)
      .pipe(
        tap((response: any) => {
          if (response.success) {
            const currentUser = this.getCurrentUser();
            if (currentUser) {
              const updatedUser = { ...currentUser, ...profileData };
              this.currentUserSubject.next(updatedUser);
              if (isBrowser) {
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }
            }
          }
        })
      );
  }

  private setAuthData(token: string, user: User): void {
    if (isBrowser) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }
} 