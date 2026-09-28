import { Request, Response } from 'express';
import { db } from '../services/databaseService.js';

export const dashboardController = {
  // GET /api/dashboard/student
  getStudentDashboard: (req: Request, res: Response) => {
    const studentId = (req.query.studentId as string) || req.user?.referenceId || 'STU202401';
    const student = db.students.find(s => s.studentId === studentId) || db.students[0];

    // Attendance breakdown
    const attendanceRecords = db.attendance.filter(a => a.studentId === student.studentId);
    const totalAttendance = attendanceRecords.length;
    const presentAttendance = attendanceRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const attendancePercentage = totalAttendance > 0 
      ? Math.round((presentAttendance / totalAttendance) * 1000) / 10 
      : student.attendanceRate;

    // Subject breakdown
    const subjectsMap = new Map<string, { total: number; present: number; name: string }>();
    attendanceRecords.forEach(a => {
      const current = subjectsMap.get(a.subjectCode) || { total: 0, present: 0, name: a.subjectName };
      current.total += 1;
      if (a.status === 'Present' || a.status === 'Late') current.present += 1;
      subjectsMap.set(a.subjectCode, current);
    });

    const subjectStats = Array.from(subjectsMap.entries()).map(([code, data]) => ({
      subjectCode: code,
      subjectName: data.name,
      percentage: Math.round((data.present / data.total) * 100),
      total: data.total,
      present: data.present,
    }));

    // Assigned bus
    const assignedBus = db.buses.find(b => b._id === student.assignedBusId) || db.buses[0];

    // Upcoming events
    const upcomingEvents = db.events.slice(0, 3).map(e => ({
      ...e,
      isRegistered: e.registeredStudents.includes(student.studentId),
    }));

    // Recent notifications for student
    const notifications = db.notifications
      .filter(n => n.targetRole === 'All' || n.targetRole === 'Student')
      .slice(0, 4);

    // Personal complaints
    const complaints = db.complaints.filter(c => c.submittedBy === student.studentId);

    // Available classrooms
    const classrooms = db.classrooms.slice(0, 4);

    // Recent Lost & Found
    const lostFound = db.lostFound.slice(0, 3);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        student,
        metrics: {
          attendancePercentage,
          totalClassesAttended: presentAttendance,
          totalClassesScheduled: totalAttendance,
          registeredEventsCount: db.events.filter(e => e.registeredStudents.includes(student.studentId)).length,
          activeComplaintsCount: complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected').length,
          unreadNotificationsCount: notifications.filter(n => !n.readBy.includes(student.email)).length,
        },
        subjectStats,
        assignedBus,
        upcomingEvents,
        notifications,
        complaints,
        classrooms,
        lostFound,
      },
    });
  },

  // GET /api/dashboard/faculty
  getFacultyDashboard: (req: Request, res: Response) => {
    const facultyId = (req.query.facultyId as string) || req.user?.referenceId || 'FAC101';
    const faculty = db.faculty.find(f => f.facultyId === facultyId) || db.faculty[0];

    // Recent attendance marked
    const recentAttendance = db.attendance.slice(0, 8);

    // Complaints assigned or requiring faculty review
    const complaints = db.complaints.slice(0, 5);

    // Events managed
    const events = db.events;

    // Classroom availability
    const availableClassrooms = db.classrooms.filter(c => c.isAvailable);
    const facultyBookings = db.bookings.filter(b => b.bookedBy === faculty.facultyId || b.bookedBy === 'FAC101');

    // Notifications
    const notifications = db.notifications
      .filter(n => n.targetRole === 'All' || n.targetRole === 'Faculty')
      .slice(0, 4);

    // Department students
    const departmentStudents = db.students.filter(s => s.department === faculty.department);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        faculty,
        metrics: {
          departmentStudentsCount: departmentStudents.length,
          averageDepartmentAttendance: 87.8,
          pendingComplaintsCount: db.complaints.filter(c => c.status === 'Pending').length,
          activeBookingsCount: facultyBookings.filter(b => b.status === 'Confirmed').length,
          availableClassroomsCount: availableClassrooms.length,
        },
        recentAttendance,
        complaints,
        events,
        availableClassrooms,
        facultyBookings,
        notifications,
        departmentStudents: departmentStudents.slice(0, 6),
      },
    });
  },

  // GET /api/dashboard/admin
  getAdminDashboard: (req: Request, res: Response) => {
    const totalStudents = db.students.length;
    const totalFaculty = db.faculty.length;
    const totalBuses = db.buses.length;
    const totalClassrooms = db.classrooms.length;

    // Overall attendance rate
    const totalAttendanceRecords = db.attendance.length;
    const presentRecords = db.attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const overallAttendanceRate = totalAttendanceRecords > 0 
      ? Math.round((presentRecords / totalAttendanceRecords) * 1000) / 10 
      : 86.4;

    // Complaints breakdown
    const complaints = db.complaints;
    const activeComplaints = complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

    // Classroom usage
    const bookedClassrooms = db.classrooms.filter(c => !c.isAvailable).length;
    const classroomUtilization = Math.round((bookedClassrooms / totalClassrooms) * 100);

    // API Telemetry overview
    const recentLogs = db.apiLogs.slice(0, 15);
    const totalApiRequests = db.apiLogs.length;
    const avgResponseTimeMs = totalApiRequests > 0
      ? Math.round((db.apiLogs.reduce((acc, log) => acc + log.durationMs, 0) / totalApiRequests) * 10) / 10
      : 18.5;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        metrics: {
          totalStudents,
          totalFaculty,
          totalBuses,
          totalClassrooms,
          overallAttendanceRate,
          activeComplaints,
          resolvedComplaints,
          totalEvents: db.events.length,
          classroomUtilization,
          totalApiRequests,
          avgResponseTimeMs,
        },
        buses: db.buses,
        classrooms: db.classrooms,
        complaints: db.complaints.slice(0, 5),
        events: db.events.slice(0, 4),
        recentApiLogs: recentLogs,
        attendanceTrend: [
          { day: 'Mon', attendance: 92.4, target: 85 },
          { day: 'Tue', attendance: 88.6, target: 85 },
          { day: 'Wed', attendance: 89.2, target: 85 },
          { day: 'Thu', attendance: 86.8, target: 85 },
          { day: 'Fri', attendance: 84.5, target: 85 },
        ],
      },
    });
  },

  // GET /api/dashboard/statistics
  getStatistics: (req: Request, res: Response) => {
    const totalRequests = db.apiLogs.length;
    const successRequests = db.apiLogs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length;
    const clientErrors = db.apiLogs.filter(l => l.statusCode >= 400 && l.statusCode < 500).length;
    const serverErrors = db.apiLogs.filter(l => l.statusCode >= 500).length;
    const avgResponseTime = totalRequests > 0
      ? Math.round((db.apiLogs.reduce((acc, l) => acc + l.durationMs, 0) / totalRequests) * 10) / 10
      : 16.4;

    // Endpoint popularity
    const endpointCounts = new Map<string, number>();
    db.apiLogs.forEach(l => {
      endpointCounts.set(l.endpoint, (endpointCounts.get(l.endpoint) || 0) + 1);
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([endpoint, count]) => ({ endpoint, count }));

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        overview: {
          studentsCount: db.students.length,
          facultyCount: db.faculty.length,
          busesCount: db.buses.length,
          classroomsCount: db.classrooms.length,
          eventsCount: db.events.length,
          complaintsCount: db.complaints.length,
          notificationsCount: db.notifications.length,
          lostFoundCount: db.lostFound.length,
        },
        apiTelemetry: {
          totalRequests,
          successRate: totalRequests > 0 ? Math.round((successRequests / totalRequests) * 1000) / 10 : 100,
          avgResponseTimeMs: avgResponseTime,
          statusDistribution: {
            '2xx': successRequests,
            '4xx': clientErrors,
            '5xx': serverErrors,
          },
          topEndpoints,
          recentLogs: db.apiLogs.slice(0, 20),
        },
      },
    });
  },
};
