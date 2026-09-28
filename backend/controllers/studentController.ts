import { Request, Response } from 'express';
import { db, generateObjectId } from '../services/databaseService.js';
import { IStudent } from '../models/types.js';

export const studentController = {
  // GET /api/students
  getAllStudents: (req: Request, res: Response) => {
    const { department, year, search, limit = '50', page = '1' } = req.query;
    let results = [...db.students];

    if (department && typeof department === 'string' && department !== 'All') {
      results = results.filter(s => s.department.toLowerCase() === department.toLowerCase());
    }

    if (year && typeof year === 'string' && year !== 'All') {
      results = results.filter(s => s.year === Number(year));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      results = results.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
      );
    }

    const total = results.length;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = results.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      total,
      page: pageNum,
      limit: limitNum,
      data: paginated,
    });
  },

  // GET /api/students/:id
  getStudentById: (req: Request, res: Response) => {
    const { id } = req.params;
    const student = db.students.find(s => s._id === id || s.studentId === id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with identifier '${id}'`,
        statusCode: 404,
      });
    }

    // Attach student attendance records and complaints
    const studentAttendance = db.attendance.filter(a => a.studentId === student.studentId);
    const studentComplaints = db.complaints.filter(c => c.submittedBy === student.studentId);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        ...student,
        attendanceHistory: studentAttendance,
        complaints: studentComplaints,
      },
    });
  },

  // POST /api/students
  createStudent: (req: Request, res: Response) => {
    const { name, email, department, year, semester, cgpa, phone, hostelResident, roomNumber } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: name, email, and department are required',
        statusCode: 400,
      });
    }

    const existing = db.students.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email address already exists',
        statusCode: 400,
      });
    }

    const studentCount = db.students.length + 1;
    const studentId = `STU2024${studentCount.toString().padStart(2, '0')}`;

    const newStudent: IStudent = {
      _id: generateObjectId(),
      studentId,
      name,
      email: email.toLowerCase(),
      phone: phone || '+91 98400 00000',
      department,
      year: Number(year) || 1,
      semester: Number(semester) || 1,
      cgpa: Number(cgpa) || 8.0,
      attendanceRate: 100,
      hostelResident: Boolean(hostelResident),
      roomNumber: roomNumber || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.students.push(newStudent);

    return res.status(201).json({
      success: true,
      message: 'Student record created successfully',
      statusCode: 201,
      data: newStudent,
    });
  },

  // PUT /api/students/:id
  updateStudent: (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.students.findIndex(s => s._id === id || s.studentId === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        statusCode: 404,
      });
    }

    const existing = db.students[index];
    const updated: IStudent = {
      ...existing,
      ...req.body,
      _id: existing._id,
      studentId: existing.studentId, // immutable
      updatedAt: new Date().toISOString(),
    };

    db.students[index] = updated;

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      statusCode: 200,
      data: updated,
    });
  },

  // DELETE /api/students/:id
  deleteStudent: (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.students.findIndex(s => s._id === id || s.studentId === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        statusCode: 404,
      });
    }

    const removed = db.students.splice(index, 1)[0];

    return res.status(200).json({
      success: true,
      message: `Student '${removed.name}' (${removed.studentId}) deleted successfully`,
      statusCode: 200,
    });
  },
};
