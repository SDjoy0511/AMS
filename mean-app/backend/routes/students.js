const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/students
// @desc    Create a new student
// @access  Private (Admin, Teacher)
router.post('/', auth, authorize('admin', 'teacher'), [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('class').notEmpty().withMessage('Class is required'),
  body('section').notEmpty().withMessage('Section is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      studentId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      address,
      class: studentClass,
      section,
      academicYear,
      email,
      password
    } = req.body;

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({
        message: 'Student with this ID already exists'
      });
    }

    // Create user account for student
    const user = new User({
      username: studentId,
      email,
      password,
      role: 'student'
    });

    await user.save();

    // Create student record
    const student = new Student({
      user: user._id,
      studentId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      address,
      class: studentClass,
      section,
      academicYear
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: await Student.findById(student._id).populate('user', 'username email role')
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin, Teacher)
router.get('/', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { page = 1, limit = 10, class: studentClass, section, search } = req.query;
    
    const query = { isActive: true };
    
    if (studentClass) query.class = studentClass;
    if (section) query.section = section;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .populate('user', 'username email role')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'username email role');

    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    // Check if user has permission to view this student
    if (req.user.role === 'student' && student.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin, Teacher)
router.put('/:id', auth, authorize('admin', 'teacher'), [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('class').optional().notEmpty().withMessage('Class cannot be empty'),
  body('section').optional().notEmpty().withMessage('Section cannot be empty'),
  body('academicYear').optional().notEmpty().withMessage('Academic year cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'username email role');

    res.json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student (soft delete)
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    // Soft delete student
    student.isActive = false;
    await student.save();

    // Deactivate user account
    await User.findByIdAndUpdate(student.user, { isActive: false });

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/students/:id/attendance
// @desc    Mark attendance for a student
// @access  Private (Admin, Teacher)
router.post('/:id/attendance', auth, authorize('admin', 'teacher'), [
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Valid status is required'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('remarks').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, date = new Date(), remarks } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    // Check if attendance already marked for this date
    const existingAttendance = student.attendance.find(
      record => record.date.toDateString() === new Date(date).toDateString()
    );

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.remarks = remarks;
      existingAttendance.markedBy = req.user.id;
    } else {
      // Add new attendance record
      student.attendance.push({
        date,
        status,
        markedBy: req.user.id,
        remarks
      });
    }

    await student.save();

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: student.attendance[student.attendance.length - 1]
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/students/:id/attendance
// @desc    Get attendance records for a student
// @access  Private
router.get('/:id/attendance', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    // Check if user has permission to view this student's attendance
    if (req.user.role === 'student' && student.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    let attendance = student.attendance;

    // Filter by date range if provided
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      
      attendance = attendance.filter(record => 
        record.date >= start && record.date <= end
      );
    }

    // Sort by date (newest first)
    attendance.sort((a, b) => b.date - a.date);

    res.json({
      success: true,
      attendance,
      totalRecords: attendance.length,
      attendancePercentage: student.attendancePercentage
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/students/class/:class/section/:section/attendance
// @desc    Batch mark attendance for all students in a class/section
// @access  Private (Admin, Teacher)
router.post('/class/:class/section/:section/attendance', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { class: className, section } = req.params;
    const { records, date } = req.body; // records: [{ studentId, status, remarks }]
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Attendance records are required' });
    }
    const attendanceDate = date ? new Date(date) : new Date();
    const results = [];
    for (const record of records) {
      const { studentId, status, remarks } = record;
      const student = await Student.findById(studentId);
      if (!student) {
        results.push({ studentId, success: false, message: 'Student not found' });
        continue;
      }
      // Check if attendance already marked for this date
      const existingAttendance = student.attendance.find(
        r => r.date.toDateString() === attendanceDate.toDateString()
      );
      if (existingAttendance) {
        existingAttendance.status = status;
        existingAttendance.remarks = remarks;
        existingAttendance.markedBy = req.user.id;
      } else {
        student.attendance.push({
          date: attendanceDate,
          status,
          markedBy: req.user.id,
          remarks
        });
      }
      await student.save();
      results.push({ studentId, success: true });
    }
    res.json({ success: true, results });
  } catch (error) {
    console.error('Batch mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 