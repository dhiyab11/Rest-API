import { Request, Response } from 'express';
import { db, generateObjectId } from '../services/databaseService.js';
import { IAttendance } from '../models/types.js';

export const attendanceController = {
  // GET /api/attendance
  getAllAttendance: (req: Request, res: Response) => {
    const { date, subjectCode, status, studentId } = req.query;
    let list = [...db.attendance];

    if (date && typeof date === 'string') {
      list = list.filter(a => a.date === date);
    }
    if (subjectCode && typeof subjectCode === 'string') {
      list = list.filter(a => a.subjectCode.toLowerCase() === subjectCode.toLowerCase());
    }
    if (status && typeof status === 'string') {
      list = list.filter(a => a.status.toLowerCase() === status.toLowerCase());
    }
    if (studentId && typeof studentId === 'string') {
      list = list.filter(a => a.studentId.toLowerCase() === studentId.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      total: list.length,
      data: list,
    });
  },

  // GET /api/attendance/student/:studentId
  getByStudentId: (req: Request, res: Response) => {
    const { studentId } = req.params;
    const records = db.attendance.filter(
      a => a.studentId.toLowerCase() === studentId.toLowerCase()
    );

    const total = records.length;
    const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const attendancePercentage = total > 0 ? Math.round((presentCount / total) * 1000) / 10 : 85.0;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      studentId,
      totalClasses: total,
      presentClasses: presentCount,
      attendancePercentage,
      data: records,
    });
  },

  // POST /api/attendance
  markAttendance: (req: Request, res: Response) => {
    const { studentId, subjectCode, subjectName, date, status, semester } = req.body;

    if (!studentId || !subjectCode || !status) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: studentId, subjectCode, and status (Present/Absent/Late/Excused) are required',
        statusCode: 400,
      });
    }

    const student = db.students.find(s => s.studentId === studentId);
    const studentName = student ? student.name : 'Enrolled Student';

    const newAttendance: IAttendance = {
      _id: generateObjectId(),
      studentId,
      studentName,
      subjectCode,
      subjectName: subjectName || subjectCode,
      date: date || new Date().toISOString().split('T')[0],
      status,
      markedBy: req.user?.name || 'Faculty Member',
      semester: Number(semester) || 6,
      createdAt: new Date().toISOString(),
    };

    db.attendance.unshift(newAttendance);

    // Recalculate student overall attendance rate if student exists
    if (student) {
      const records = db.attendance.filter(a => a.studentId === studentId);
      const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
      student.attendanceRate = Math.round((presentCount / records.length) * 1000) / 10;
    }

    return res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      statusCode: 201,
      data: newAttendance,
    });
  },

  // PUT /api/attendance/:id
  updateAttendance: (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, subjectCode, subjectName, date } = req.body;

    const record = db.attendance.find(a => a._id === id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
        statusCode: 404,
      });
    }

    if (status) record.status = status;
    if (subjectCode) record.subjectCode = subjectCode;
    if (subjectName) record.subjectName = subjectName;
    if (date) record.date = date;

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      statusCode: 200,
      data: record,
    });
  },
};
