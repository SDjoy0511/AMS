# Student Attendance Management System

A full-stack web application built with the MEAN stack (MongoDB, Express.js, Angular, Node.js) for managing student attendance in educational institutions.

## Features

### Authentication & Authorization
- User registration and login
- Role-based access control (Admin, Teacher, Student)
- JWT token-based authentication
- Protected routes

### Student Management
- Create, read, update, and delete student records
- Student profile management
- Search and filter students
- Pagination support

### Attendance Management
- Mark student attendance (Present, Absent, Late, Excused)
- View attendance records with date filtering
- Attendance percentage calculation
- Attendance history tracking

### User Interface
- Modern, responsive Material Design UI
- Mobile-friendly interface
- Real-time form validation
- Loading states and error handling

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing

### Frontend
- **Angular 17** - Frontend framework
- **Angular Material** - UI component library
- **TypeScript** - Programming language
- **SCSS** - Styling
- **RxJS** - Reactive programming

## Project Structure

```
mean-app/
├── backend/
│   ├── models/
│   │   ├── Student.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── students.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config.env
│   ├── app.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── student/
│   │   │   ├── services/
│   │   │   └── guards/
│   │   └── environments/
│   └── package.json
└── README.md
```

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB** (v4.4 or higher)
- **Angular CLI** (v17 or higher)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mean-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory (or rename `config.env` to `.env`):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/student_attendance
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

### 5. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
```

### 6. Run the Application

#### Backend (Terminal 1)
```bash
cd backend
npm run dev
```

#### Frontend (Terminal 2)
```bash
cd frontend
ng serve
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Students
- `GET /api/students` - Get all students (Admin/Teacher)
- `POST /api/students` - Create a new student (Admin/Teacher)
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student (Admin/Teacher)
- `DELETE /api/students/:id` - Delete student (Admin)
- `POST /api/students/:id/attendance` - Mark attendance (Admin/Teacher)
- `GET /api/students/:id/attendance` - Get attendance records

## Usage

### 1. Registration
- Navigate to the registration page
- Fill in the required information
- Select your role (Student, Teacher, or Admin)
- Submit the form

### 2. Login
- Use your registered email and password
- You'll be redirected based on your role

### 3. Student Management (Admin/Teacher)
- View all students with search and filter options
- Add new students with complete information
- Update student details
- Mark attendance for students

### 4. Student Dashboard
- View personal information
- Check attendance records
- Filter attendance by date range
- View attendance percentage

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
ng serve --open  # Opens browser automatically
```

### Building for Production
```bash
# Frontend
cd frontend
ng build --configuration production

# Backend
cd backend
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/student_attendance |
| `JWT_SECRET` | JWT secret key | your_jwt_secret_key_here |
| `JWT_EXPIRE` | JWT expiration time | 24h |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository. 