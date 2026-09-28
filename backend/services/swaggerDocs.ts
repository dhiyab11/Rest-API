export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SmartCampus API Hub',
    version: '1.0.0',
    description: 'Centralized REST API ecosystem for SmartCampus operations: Authentication, Student Profiles, Attendance Tracking, Complaints, Events, Bus Fleet GPS, Classroom Bookings, Notifications, Lost & Found, and Multi-Role Analytics.',
    contact: {
      name: 'SmartCampus API Engineering',
      email: 'api-support@smartcampus.edu',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Primary Campus REST API Gateway',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token obtained from /api/auth/login',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Student not found' },
          statusCode: { type: 'integer', example: 404 },
        },
      },
      Student: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          studentId: { type: 'string', example: 'STU202401' },
          name: { type: 'string', example: 'Priya Sharma' },
          email: { type: 'string', example: 'student@smartcampus.edu' },
          department: { type: 'string', example: 'Computer Science & Engineering' },
          year: { type: 'integer', example: 3 },
          semester: { type: 'integer', example: 6 },
          cgpa: { type: 'number', example: 8.92 },
          attendanceRate: { type: 'number', example: 88.5 },
        },
      },
      Attendance: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          studentId: { type: 'string', example: 'STU202401' },
          subjectCode: { type: 'string', example: 'CS301' },
          subjectName: { type: 'string', example: 'Data Structures & Algorithms' },
          date: { type: 'string', format: 'date', example: '2026-09-21' },
          status: { type: 'string', enum: ['Present', 'Absent', 'Late', 'Excused'], example: 'Present' },
          markedBy: { type: 'string', example: 'Dr. Rajesh Kumar' },
        },
      },
      Complaint: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Hostel Wi-Fi intermittent disconnect' },
          description: { type: 'string' },
          category: { type: 'string', enum: ['Hostel', 'Academic', 'Transport', 'Infrastructure', 'Cafeteria', 'Library', 'Other'] },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
          status: { type: 'string', enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'] },
          submittedBy: { type: 'string', example: 'STU202401' },
        },
      },
      CampusBus: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          busNumber: { type: 'string', example: 'BUS-01' },
          route: { type: 'string', example: 'Central Railway Station -> Anna Nagar -> Campus Main Gate' },
          driverName: { type: 'string', example: 'Senthil Nathan' },
          status: { type: 'string', enum: ['On Route', 'At Stop', 'Delayed', 'Maintenance'] },
          currentLocation: {
            type: 'object',
            properties: {
              lat: { type: 'number', example: 13.0827 },
              lng: { type: 'number', example: 80.2707 },
              landmark: { type: 'string', example: 'Anna Nagar Roundabout' },
              speedKmH: { type: 'number', example: 38 },
            },
          },
        },
      },
      Classroom: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          roomNumber: { type: 'string', example: 'LH-101' },
          block: { type: 'string', example: 'Newton Engineering Block' },
          type: { type: 'string', example: 'Lecture Hall' },
          capacity: { type: 'integer', example: 120 },
          isAvailable: { type: 'boolean', example: true },
        },
      },
      Event: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'SmartHack 2026' },
          category: { type: 'string', example: 'Hackathon' },
          venue: { type: 'string', example: 'APJ Kalam Auditorium' },
          date: { type: 'string', example: '2026-10-05' },
          capacity: { type: 'integer', example: 250 },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Exam Schedule Released' },
          message: { type: 'string' },
          type: { type: 'string', example: 'Academic' },
          targetRole: { type: 'string', example: 'All' },
        },
      },
      LostFound: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          type: { type: 'string', enum: ['Lost', 'Found'] },
          title: { type: 'string', example: 'Graphing Calculator' },
          locationFoundLost: { type: 'string', example: 'LH-101 2nd row' },
          status: { type: 'string', enum: ['Open', 'Claimed', 'Closed'] },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register new user account (Student, Faculty, Admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', example: 'newstudent@smartcampus.edu' },
                  password: { type: 'string', example: 'securePass123' },
                  name: { type: 'string', example: 'Divya Krishnan' },
                  role: { type: 'string', enum: ['Student', 'Faculty', 'Admin'], default: 'Student' },
                  department: { type: 'string', example: 'Computer Science & Engineering' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User successfully registered with JWT token' },
          400: { description: 'Validation error or duplicate email' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate credentials and obtain JWT Bearer token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'student@smartcampus.edu' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authentication successful with JWT token' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Invalidate client session token',
        responses: {
          200: { description: 'Session terminated' },
        },
      },
    },
    '/students': {
      get: {
        tags: ['Students'],
        summary: 'List all enrolled students with search and department filtering',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'department', in: 'query', schema: { type: 'string' } },
          { name: 'year', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Paginated list of students' },
        },
      },
      post: {
        tags: ['Students'],
        security: [{ BearerAuth: [] }],
        summary: 'Enroll a new student (Faculty or Admin only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'department'],
                properties: {
                  name: { type: 'string', example: 'Aditya Raj' },
                  email: { type: 'string', example: 'aditya.raj@smartcampus.edu' },
                  department: { type: 'string', example: 'Mechanical Engineering' },
                  year: { type: 'integer', example: 1 },
                  cgpa: { type: 'number', example: 8.4 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Student created successfully' },
        },
      },
    },
    '/students/{id}': {
      get: {
        tags: ['Students'],
        summary: 'Get student profile, attendance summary, and registered complaints',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Student profile document' },
          404: { description: 'Student not found' },
        },
      },
      put: {
        tags: ['Students'],
        security: [{ BearerAuth: [] }],
        summary: 'Update student details (Faculty or Admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Student updated' },
        },
      },
      delete: {
        tags: ['Students'],
        security: [{ BearerAuth: [] }],
        summary: 'Delete student record (Admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Student deleted' },
        },
      },
    },
    '/attendance': {
      get: {
        tags: ['Attendance'],
        summary: 'Query attendance records by date, subject, or student',
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string' } },
          { name: 'subjectCode', in: 'query', schema: { type: 'string' } },
          { name: 'studentId', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'List of attendance entries' } },
      },
      post: {
        tags: ['Attendance'],
        security: [{ BearerAuth: [] }],
        summary: 'Mark class attendance for student (Faculty or Admin only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['studentId', 'subjectCode', 'status'],
                properties: {
                  studentId: { type: 'string', example: 'STU202401' },
                  subjectCode: { type: 'string', example: 'CS301' },
                  subjectName: { type: 'string', example: 'Data Structures & Algorithms' },
                  status: { type: 'string', enum: ['Present', 'Absent', 'Late', 'Excused'], example: 'Present' },
                  date: { type: 'string', example: '2026-09-21' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Attendance recorded' } },
      },
    },
    '/attendance/student/{studentId}': {
      get: {
        tags: ['Attendance'],
        summary: 'Get full attendance history and calculate percentage for student',
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Student attendance analytics' } },
      },
    },
    '/attendance/{id}': {
      put: {
        tags: ['Attendance'],
        security: [{ BearerAuth: [] }],
        summary: 'Update attendance record status (Faculty or Admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Attendance updated' } },
      },
    },
    '/complaints': {
      get: {
        tags: ['Complaints'],
        summary: 'Retrieve student grievances with status, category, and priority filter',
        responses: { 200: { description: 'List of complaints' } },
      },
      post: {
        tags: ['Complaints'],
        security: [{ BearerAuth: [] }],
        summary: 'Submit a new complaint / grievance',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'category'],
                properties: {
                  title: { type: 'string', example: 'Hostel Wi-Fi low bandwidth' },
                  description: { type: 'string', example: 'Intermittent signal on 3rd floor Kaveri Hostel' },
                  category: { type: 'string', enum: ['Hostel', 'Academic', 'Transport', 'Infrastructure', 'Cafeteria', 'Library', 'Other'] },
                  priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Complaint filed successfully' } },
      },
    },
    '/complaints/{id}': {
      get: {
        tags: ['Complaints'],
        summary: 'Get details of specific complaint by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Complaint details' } },
      },
      delete: {
        tags: ['Complaints'],
        security: [{ BearerAuth: [] }],
        summary: 'Remove complaint record (Admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Complaint removed' } },
      },
    },
    '/complaints/{id}/status': {
      put: {
        tags: ['Complaints'],
        security: [{ BearerAuth: [] }],
        summary: 'Update complaint resolution status and notes (Faculty/Admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'] },
                  resolutionNotes: { type: 'string', example: 'Technician dispatched; optical switch replaced.' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Status updated' } },
      },
    },
    '/events': {
      get: {
        tags: ['Events'],
        summary: 'List campus events, workshops, hackathons, and cultural fests',
        responses: { 200: { description: 'List of events' } },
      },
      post: {
        tags: ['Events'],
        security: [{ BearerAuth: [] }],
        summary: 'Publish new event (Faculty or Admin only)',
        responses: { 201: { description: 'Event created' } },
      },
    },
    '/events/{id}': {
      put: {
        tags: ['Events'],
        security: [{ BearerAuth: [] }],
        summary: 'Update event details (Faculty/Admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Event updated' } },
      },
      delete: {
        tags: ['Events'],
        security: [{ BearerAuth: [] }],
        summary: 'Cancel/delete event (Admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Event deleted' } },
      },
    },
    '/events/{id}/register': {
      post: {
        tags: ['Events'],
        security: [{ BearerAuth: [] }],
        summary: 'Register logged-in student for event',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Registration confirmed' } },
      },
    },
    '/buses': {
      get: {
        tags: ['Campus Bus'],
        summary: 'Get all campus transit buses with live route and occupancy status',
        responses: { 200: { description: 'List of campus buses' } },
      },
    },
    '/buses/{id}': {
      get: {
        tags: ['Campus Bus'],
        summary: 'Get single bus route, schedule, and driver details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Bus details' } },
      },
    },
    '/buses/location': {
      post: {
        tags: ['Campus Bus'],
        security: [{ BearerAuth: [] }],
        summary: 'Update bus live GPS coordinates and landmark telemetry',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['busId'],
                properties: {
                  busId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c401' },
                  lat: { type: 'number', example: 13.0850 },
                  lng: { type: 'number', example: 80.2730 },
                  landmark: { type: 'string', example: 'Approaching Anna Nagar East Gate' },
                  speedKmH: { type: 'number', example: 42 },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Location updated' } },
      },
    },
    '/buses/{id}/location': {
      get: {
        tags: ['Campus Bus'],
        summary: 'Get real-time GPS telemetry for bus',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Bus location' } },
      },
    },
    '/classrooms': {
      get: {
        tags: ['Classrooms'],
        summary: 'List campus classrooms and labs across blocks',
        responses: { 200: { description: 'Classrooms catalog' } },
      },
    },
    '/classrooms/available': {
      get: {
        tags: ['Classrooms'],
        summary: 'Filter only currently available, unbooked classrooms',
        responses: { 200: { description: 'Available classrooms' } },
      },
    },
    '/classrooms/book': {
      post: {
        tags: ['Classrooms'],
        security: [{ BearerAuth: [] }],
        summary: 'Reserve a classroom or lab slot (Faculty/Admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roomNumber'],
                properties: {
                  roomNumber: { type: 'string', example: 'LH-101' },
                  date: { type: 'string', example: '2026-09-21' },
                  timeSlot: { type: 'string', example: '02:00 PM - 04:00 PM' },
                  purpose: { type: 'string', example: 'Machine Learning Project Presentations' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Classroom reserved' } },
      },
    },
    '/classrooms/booking/{id}': {
      delete: {
        tags: ['Classrooms'],
        security: [{ BearerAuth: [] }],
        summary: 'Cancel classroom reservation',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Booking cancelled' } },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get broadcast campus announcements and role-filtered notices',
        responses: { 200: { description: 'Notifications' } },
      },
      post: {
        tags: ['Notifications'],
        security: [{ BearerAuth: [] }],
        summary: 'Publish campus broadcast notice (Faculty/Admin)',
        responses: { 201: { description: 'Notice published' } },
      },
    },
    '/notifications/{id}/read': {
      put: {
        tags: ['Notifications'],
        security: [{ BearerAuth: [] }],
        summary: 'Mark notification as read for user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Marked read' } },
      },
    },
    '/lost-found': {
      get: {
        tags: ['Lost & Found'],
        summary: 'Query lost & found items catalog',
        responses: { 200: { description: 'Lost & found items' } },
      },
      post: {
        tags: ['Lost & Found'],
        security: [{ BearerAuth: [] }],
        summary: 'Report a lost or found campus item',
        responses: { 201: { description: 'Item reported' } },
      },
    },
    '/lost-found/{id}': {
      get: {
        tags: ['Lost & Found'],
        summary: 'Get item details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Item details' } },
      },
      put: {
        tags: ['Lost & Found'],
        security: [{ BearerAuth: [] }],
        summary: 'Update item status (e.g. Claimed)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Item updated' } },
      },
      delete: {
        tags: ['Lost & Found'],
        security: [{ BearerAuth: [] }],
        summary: 'Remove lost & found record',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Item removed' } },
      },
    },
    '/dashboard/student': {
      get: {
        tags: ['Dashboard'],
        summary: 'Aggregated Student Dashboard metrics (Attendance %, Bus, Events, Complaints)',
        responses: { 200: { description: 'Student dashboard payload' } },
      },
    },
    '/dashboard/faculty': {
      get: {
        tags: ['Dashboard'],
        summary: 'Aggregated Faculty Dashboard metrics (Attendance management, Bookings, Complaints)',
        responses: { 200: { description: 'Faculty dashboard payload' } },
      },
    },
    '/dashboard/admin': {
      get: {
        tags: ['Dashboard'],
        summary: 'Aggregated Admin Dashboard metrics (Campus health, Fleet, API telemetry)',
        responses: { 200: { description: 'Admin dashboard payload' } },
      },
    },
    '/dashboard/statistics': {
      get: {
        tags: ['Dashboard'],
        summary: 'Real-time REST API telemetry, response latency, and system counters',
        responses: { 200: { description: 'API statistics payload' } },
      },
    },
  },
};
