import {
  IUser,
  IStudent,
  IFaculty,
  IAttendance,
  IComplaint,
  IEvent,
  IBus,
  IClassroom,
  IBooking,
  INotification,
  ILostFound,
  IApiLog,
} from '../models/types.js';

// Helper to generate MongoDB-style 24-char hex ObjectIds
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  const counter = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + counter).toLowerCase();
}

class DatabaseService {
  public users: IUser[] = [];
  public students: IStudent[] = [];
  public faculty: IFaculty[] = [];
  public attendance: IAttendance[] = [];
  public complaints: IComplaint[] = [];
  public events: IEvent[] = [];
  public buses: IBus[] = [];
  public classrooms: IClassroom[] = [];
  public bookings: IBooking[] = [];
  public notifications: INotification[] = [];
  public lostFound: ILostFound[] = [];
  public apiLogs: IApiLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  public logApi(log: IApiLog) {
    this.apiLogs.unshift(log);
    if (this.apiLogs.length > 300) {
      this.apiLogs.pop();
    }
  }

  private seedInitialData() {
    // 1. Initial Users
    this.users = [
      {
        _id: '65f1a2b3c4d5e6f7a8b9c001',
        email: 'admin@smartcampus.edu',
        passwordHash: '$2a$10$w8FmN2Xh8U6r6K4w2T5U0u9L3rK3mY7k8E5iJ1pQ4v7w8x9y0z1a2', // password123
        name: 'Dr. S. K. Narayanan',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        department: 'Central Administration',
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: '2026-01-10T08:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c002',
        email: 'faculty@smartcampus.edu',
        passwordHash: '$2a$10$w8FmN2Xh8U6r6K4w2T5U0u9L3rK3mY7k8E5iJ1pQ4v7w8x9y0z1a2', // password123
        name: 'Dr. Rajesh Kumar',
        role: 'Faculty',
        referenceId: 'FAC101',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        department: 'Computer Science & Engineering',
        createdAt: '2026-01-12T09:30:00.000Z',
        updatedAt: '2026-01-12T09:30:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c003',
        email: 'student@smartcampus.edu',
        passwordHash: '$2a$10$w8FmN2Xh8U6r6K4w2T5U0u9L3rK3mY7k8E5iJ1pQ4v7w8x9y0z1a2', // password123
        name: 'Priya Sharma',
        role: 'Student',
        referenceId: 'STU202401',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        department: 'Computer Science & Engineering',
        createdAt: '2026-01-15T10:15:00.000Z',
        updatedAt: '2026-01-15T10:15:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c004',
        email: 'rahul.verma@smartcampus.edu',
        passwordHash: '$2a$10$w8FmN2Xh8U6r6K4w2T5U0u9L3rK3mY7k8E5iJ1pQ4v7w8x9y0z1a2',
        name: 'Rahul Verma',
        role: 'Student',
        referenceId: 'STU202402',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        department: 'Electronics & Communication',
        createdAt: '2026-01-15T11:00:00.000Z',
        updatedAt: '2026-01-15T11:00:00.000Z',
      }
    ];

    // 2. Students Collection
    this.students = [
      {
        _id: '65f1a2b3c4d5e6f7a8b9c101',
        studentId: 'STU202401',
        name: 'Priya Sharma',
        email: 'student@smartcampus.edu',
        phone: '+91 98401 23456',
        department: 'Computer Science & Engineering',
        year: 3,
        semester: 6,
        cgpa: 8.92,
        attendanceRate: 88.5,
        assignedBusId: '65f1a2b3c4d5e6f7a8b9c401',
        hostelResident: true,
        roomNumber: 'Kaveri Hostel H-304',
        createdAt: '2026-01-15T10:15:00.000Z',
        updatedAt: '2026-09-18T14:20:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c102',
        studentId: 'STU202402',
        name: 'Rahul Verma',
        email: 'rahul.verma@smartcampus.edu',
        phone: '+91 98402 34567',
        department: 'Electronics & Communication',
        year: 3,
        semester: 6,
        cgpa: 8.45,
        attendanceRate: 82.0,
        assignedBusId: '65f1a2b3c4d5e6f7a8b9c402',
        hostelResident: false,
        createdAt: '2026-01-15T11:00:00.000Z',
        updatedAt: '2026-09-19T09:15:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c103',
        studentId: 'STU202403',
        name: 'Sneha Patel',
        email: 'sneha.patel@smartcampus.edu',
        phone: '+91 98403 45678',
        department: 'Information Technology',
        year: 2,
        semester: 4,
        cgpa: 9.15,
        attendanceRate: 94.2,
        assignedBusId: '65f1a2b3c4d5e6f7a8b9c401',
        hostelResident: true,
        roomNumber: 'Vaigai Hostel V-112',
        createdAt: '2026-01-16T10:00:00.000Z',
        updatedAt: '2026-09-20T11:45:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c104',
        studentId: 'STU202404',
        name: 'Karthik Raman',
        email: 'karthik.raman@smartcampus.edu',
        phone: '+91 98404 56789',
        department: 'Mechanical Engineering',
        year: 4,
        semester: 8,
        cgpa: 7.85,
        attendanceRate: 74.5,
        assignedBusId: '65f1a2b3c4d5e6f7a8b9c403',
        hostelResident: false,
        createdAt: '2026-01-16T12:00:00.000Z',
        updatedAt: '2026-09-20T16:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c105',
        studentId: 'STU202405',
        name: 'Ananya Deshmukh',
        email: 'ananya.d@smartcampus.edu',
        phone: '+91 98405 67890',
        department: 'Computer Science & Engineering',
        year: 3,
        semester: 6,
        cgpa: 9.42,
        attendanceRate: 96.0,
        assignedBusId: '65f1a2b3c4d5e6f7a8b9c401',
        hostelResident: true,
        roomNumber: 'Kaveri Hostel H-208',
        createdAt: '2026-01-17T09:30:00.000Z',
        updatedAt: '2026-09-21T08:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c106',
        studentId: 'STU202406',
        name: 'Venkatesh Iyer',
        email: 'venkatesh.i@smartcampus.edu',
        phone: '+91 98406 78901',
        department: 'Electrical & Electronics',
        year: 2,
        semester: 4,
        cgpa: 8.10,
        attendanceRate: 85.0,
        assignedBusId: '65f1a2b3c4d5e6f7a8b9c402',
        hostelResident: false,
        createdAt: '2026-01-17T11:30:00.000Z',
        updatedAt: '2026-09-21T08:30:00.000Z',
      }
    ];

    // 3. Faculty Collection
    this.faculty = [
      {
        _id: '65f1a2b3c4d5e6f7a8b9c201',
        facultyId: 'FAC101',
        name: 'Dr. Rajesh Kumar',
        email: 'faculty@smartcampus.edu',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor & HOD-in-charge',
        cabinNumber: 'Newton Block C-312',
        phone: '+91 94441 12345',
        subjects: ['CS301 Data Structures', 'CS304 AI & ML Systems'],
        createdAt: '2026-01-12T09:30:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c202',
        facultyId: 'FAC102',
        name: 'Prof. Ananya Roy',
        email: 'ananya.roy@smartcampus.edu',
        department: 'Information Technology',
        designation: 'Assistant Professor',
        cabinNumber: 'Turing Block T-205',
        phone: '+91 94442 23456',
        subjects: ['IT204 Database Architecture', 'IT302 Cloud Infrastructure'],
        createdAt: '2026-01-12T11:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c203',
        facultyId: 'FAC103',
        name: 'Dr. Mohanraj S.',
        email: 'mohanraj.s@smartcampus.edu',
        department: 'Electronics & Communication',
        designation: 'Professor',
        cabinNumber: 'Tesla Block E-104',
        phone: '+91 94443 34567',
        subjects: ['EC401 Digital Signal Processing', 'EC405 Embedded IoT'],
        createdAt: '2026-01-13T10:00:00.000Z',
      }
    ];

    // 4. Attendance Collection
    this.attendance = [
      {
        _id: '65f1a2b3c4d5e6f7a8b9c301',
        studentId: 'STU202401',
        studentName: 'Priya Sharma',
        subjectCode: 'CS301',
        subjectName: 'Data Structures & Algorithms',
        date: '2026-09-18',
        status: 'Present',
        markedBy: 'Dr. Rajesh Kumar',
        semester: 6,
        createdAt: '2026-09-18T09:05:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c302',
        studentId: 'STU202401',
        studentName: 'Priya Sharma',
        subjectCode: 'CS302',
        subjectName: 'Distributed Database Systems',
        date: '2026-09-18',
        status: 'Present',
        markedBy: 'Prof. Ananya Roy',
        semester: 6,
        createdAt: '2026-09-18T11:05:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c303',
        studentId: 'STU202401',
        studentName: 'Priya Sharma',
        subjectCode: 'CS304',
        subjectName: 'AI & ML Systems',
        date: '2026-09-19',
        status: 'Present',
        markedBy: 'Dr. Rajesh Kumar',
        semester: 6,
        createdAt: '2026-09-19T10:05:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c304',
        studentId: 'STU202401',
        studentName: 'Priya Sharma',
        subjectCode: 'CS305',
        subjectName: 'Computer Networks Lab',
        date: '2026-09-19',
        status: 'Late',
        markedBy: 'Dr. Rajesh Kumar',
        semester: 6,
        createdAt: '2026-09-19T14:15:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c305',
        studentId: 'STU202401',
        studentName: 'Priya Sharma',
        subjectCode: 'CS301',
        subjectName: 'Data Structures & Algorithms',
        date: '2026-09-20',
        status: 'Present',
        markedBy: 'Dr. Rajesh Kumar',
        semester: 6,
        createdAt: '2026-09-20T09:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c306',
        studentId: 'STU202402',
        studentName: 'Rahul Verma',
        subjectCode: 'EC401',
        subjectName: 'Digital Signal Processing',
        date: '2026-09-20',
        status: 'Absent',
        markedBy: 'Dr. Mohanraj S.',
        semester: 6,
        createdAt: '2026-09-20T09:05:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c307',
        studentId: 'STU202403',
        studentName: 'Sneha Patel',
        subjectCode: 'IT204',
        subjectName: 'Database Architecture',
        date: '2026-09-20',
        status: 'Present',
        markedBy: 'Prof. Ananya Roy',
        semester: 4,
        createdAt: '2026-09-20T10:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c308',
        studentId: 'STU202404',
        studentName: 'Karthik Raman',
        subjectCode: 'ME302',
        subjectName: 'Thermodynamics & Heat Transfer',
        date: '2026-09-20',
        status: 'Present',
        markedBy: 'Dr. P. Sundaram',
        semester: 8,
        createdAt: '2026-09-20T11:00:00.000Z',
      }
    ];

    // 5. Buses Collection
    this.buses = [
      {
        _id: '65f1a2b3c4d5e6f7a8b9c401',
        busNumber: 'BUS-01 (Greenline Express)',
        route: 'Central Railway Station -> Anna Nagar -> Campus Main Gate',
        driverName: 'Senthil Nathan',
        driverPhone: '+91 98840 11223',
        currentLocation: {
          lat: 13.0827,
          lng: 80.2707,
          landmark: 'Anna Nagar Roundabout - 4.2 km to campus',
          lastUpdated: '2 mins ago',
          speedKmH: 38,
        },
        status: 'On Route',
        capacity: 55,
        currentOccupancy: 42,
        stops: ['Central Station', 'Egmore', 'Kilpauk', 'Anna Nagar', 'Campus Main Gate'],
        departureTime: '07:30 AM',
        arrivalTime: '08:25 AM',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c402',
        busNumber: 'BUS-02 (South Corridor)',
        route: 'Tambaram Junction -> Chromepet -> Airport -> Campus',
        driverName: 'Murugan K.',
        driverPhone: '+91 98840 22334',
        currentLocation: {
          lat: 12.9856,
          lng: 80.1982,
          landmark: 'Guindy Overbridge - Approaching Stop 4',
          lastUpdated: 'Just now',
          speedKmH: 26,
        },
        status: 'On Route',
        capacity: 50,
        currentOccupancy: 48,
        stops: ['Tambaram', 'Chromepet', 'Pallavaram', 'Guindy', 'Campus South Gate'],
        departureTime: '07:20 AM',
        arrivalTime: '08:20 AM',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c403',
        busNumber: 'BUS-03 (OMR Tech Line)',
        route: 'Sholinganallur -> Thoraipakkam -> Velachery -> Campus',
        driverName: 'Dharmendra Rao',
        driverPhone: '+91 98840 33445',
        currentLocation: {
          lat: 12.9784,
          lng: 80.2184,
          landmark: 'Velachery MRTS Junction - Boarding passengers',
          lastUpdated: '1 min ago',
          speedKmH: 0,
        },
        status: 'At Stop',
        capacity: 60,
        currentOccupancy: 51,
        stops: ['Sholinganallur', 'Perungudi', 'Velachery', 'IIT Gate', 'Campus East Gate'],
        departureTime: '07:35 AM',
        arrivalTime: '08:35 AM',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c404',
        busNumber: 'BUS-04 (West Campus Shuttle)',
        route: 'Hostel Complex -> Sports Arena -> Academic Quad -> Admin Block',
        driverName: 'K. Palanisamy',
        driverPhone: '+91 98840 44556',
        currentLocation: {
          lat: 13.0112,
          lng: 80.2341,
          landmark: 'Sports Arena Pavilion',
          lastUpdated: '3 mins ago',
          speedKmH: 15,
        },
        status: 'On Route',
        capacity: 35,
        currentOccupancy: 18,
        stops: ['Hostel Block A', 'Hostel Block C', 'Sports Pavilion', 'Turing Hall', 'Admin Block'],
        departureTime: 'Continuous (Every 15 mins)',
        arrivalTime: 'On loop',
      }
    ];

    // 6. Complaints Collection
    this.complaints = [
      {
        _id: '65f1a2b3c4d5e6f7a8b9c501',
        title: 'High latency and intermittent disconnects in Kaveri Hostel Wi-Fi',
        description: 'Wi-Fi AP on 3rd floor Kaveri Hostel experiences 70% packet drops during peak study hours (8pm-11pm). Unable to access remote academic repositories.',
        category: 'Hostel',
        priority: 'High',
        status: 'In Progress',
        submittedBy: 'STU202401',
        studentName: 'Priya Sharma',
        assignedTo: 'Campus IT Infrastructure Team (Eng. V. Raman)',
        resolutionNotes: 'Network engineers replaced optical transceiver on Floor 3 switchboard. Monitoring link quality for 24 hours.',
        createdAt: '2026-09-17T18:30:00.000Z',
        updatedAt: '2026-09-19T10:15:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c502',
        title: 'Air conditioning malfunction in Turing Computer Lab 302',
        description: 'AC unit #2 is leaking condensate water onto student workstations 14-16. Needs immediate service before electronics get damaged.',
        category: 'Infrastructure',
        priority: 'Urgent',
        status: 'Pending',
        submittedBy: 'STU202402',
        studentName: 'Rahul Verma',
        assignedTo: 'Campus Maintenance Facilities',
        createdAt: '2026-09-20T08:45:00.000Z',
        updatedAt: '2026-09-20T08:45:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c503',
        title: 'Bus #02 consistently skipping Guindy stop on rainy mornings',
        description: 'Over 12 students were stranded at Guindy Stop on Thursday morning because Bus #02 did not pull into the designated service bay.',
        category: 'Transport',
        priority: 'Medium',
        status: 'Resolved',
        submittedBy: 'STU202404',
        studentName: 'Karthik Raman',
        assignedTo: 'Campus Transport Coordinator',
        resolutionNotes: 'Driver briefed and warning issued. Route coordinator deployed at Guindy to verify compliance.',
        createdAt: '2026-09-15T09:10:00.000Z',
        updatedAt: '2026-09-17T14:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c504',
        title: 'Central Library self-checkout barcode scanner error',
        description: 'Scanner kiosk 02 rejects student RFID cards during checkouts of advanced reference books.',
        category: 'Library',
        priority: 'Low',
        status: 'Resolved',
        submittedBy: 'STU202403',
        studentName: 'Sneha Patel',
        assignedTo: 'Library Systems Admin',
        resolutionNotes: 'Firmware updated on optical reader and calibrated with new NFC card readers.',
        createdAt: '2026-09-14T11:20:00.000Z',
        updatedAt: '2026-09-16T16:30:00.000Z',
      }
    ];

    // 7. Events Collection
    this.events = [
      {
        _id: '65f1a2b3c4d5e6f7a8b9c601',
        title: 'SmartHack 2026: 36-Hour National AI & Cloud Hackathon',
        description: 'Flagship inter-college hackathon focusing on autonomous systems, distributed API microservices, and climate-tech solutions. Cash pool INR 1,50,000.',
        category: 'Hackathon',
        venue: 'Dr. APJ Abdul Kalam Auditorium & Innovation Hub',
        date: '2026-10-05',
        time: '09:00 AM - Oct 6, 09:00 PM',
        organizer: 'Dept of CSE & Google Developer Student Club',
        capacity: 250,
        registeredStudents: ['STU202401', 'STU202403', 'STU202405'],
        status: 'Upcoming',
        bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
        createdAt: '2026-09-10T10:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c602',
        title: 'Hands-on Workshop: Building Enterprise Microservices with Node.js & Docker',
        description: 'Intensive session on containerization, gRPC, REST API contracts, and CI/CD pipelines led by Principal Architect from ThoughtWorks.',
        category: 'Workshop',
        venue: 'Turing Computer Lab 301',
        date: '2026-09-28',
        time: '02:00 PM - 05:30 PM',
        organizer: 'IEEE Student Branch',
        capacity: 60,
        registeredStudents: ['STU202401', 'STU202402'],
        status: 'Upcoming',
        bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
        createdAt: '2026-09-12T14:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c603',
        title: 'Annual Campus Cultural Fest: Symphony 2026',
        description: 'Three days of music, dance, theatrical arts, battle of the bands, and celebrity concerts across multiple campus stages.',
        category: 'Cultural',
        venue: 'Open Air Amphitheatre & Main Quad',
        date: '2026-10-18',
        time: '04:00 PM - 10:00 PM',
        organizer: 'Student Affairs Council',
        capacity: 3000,
        registeredStudents: ['STU202401', 'STU202402', 'STU202403', 'STU202404'],
        status: 'Upcoming',
        bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
        createdAt: '2026-09-01T12:00:00.000Z',
      }
    ];

    // 8. Classrooms Collection
    this.classrooms = [
      {
        _id: '65f1a2b3c4d5e6f7a8b9c701',
        roomNumber: 'LH-101',
        block: 'Newton Engineering Block',
        type: 'Lecture Hall',
        capacity: 120,
        facilities: ['Interactive 4K Smart Board', 'Dolby Audio Mic System', 'Tiered Seating', 'Air Conditioned'],
        isAvailable: true,
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c702',
        roomNumber: 'LH-201',
        block: 'Newton Engineering Block',
        type: 'Lecture Hall',
        capacity: 85,
        facilities: ['Dual Projectors', 'Recording Camera', 'High-Speed Wi-Fi'],
        isAvailable: false,
        currentBooking: {
          bookingId: '65f1a2b3c4d5e6f7a8b9c791',
          bookedBy: 'FAC101',
          facultyName: 'Dr. Rajesh Kumar',
          purpose: 'CS304 AI & ML Guest Lecture with Industry Speaker',
          startTime: '10:00 AM',
          endTime: '12:00 PM',
          date: '2026-09-21',
        }
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c703',
        roomNumber: 'LAB-301',
        block: 'Turing IT Block',
        type: 'Computer Lab',
        capacity: 60,
        facilities: ['60x Intel Core i7 Workstations', 'Dual Monitors', 'Gigabit Ethernet', 'Linux & Windows Dual Boot'],
        isAvailable: true,
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c704',
        roomNumber: 'LAB-302',
        block: 'Turing IT Block',
        type: 'Computer Lab',
        capacity: 60,
        facilities: ['GPU Computing Rigs', 'NVIDIA RTX 4080 Servers', 'AC'],
        isAvailable: false,
        currentBooking: {
          bookingId: '65f1a2b3c4d5e6f7a8b9c792',
          bookedBy: 'FAC102',
          facultyName: 'Prof. Ananya Roy',
          purpose: 'Deep Learning Model Training Practical Session',
          startTime: '02:00 PM',
          endTime: '04:30 PM',
          date: '2026-09-21',
        }
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c705',
        roomNumber: 'SEM-401',
        block: 'Raman Research Complex',
        type: 'Seminar Hall',
        capacity: 150,
        facilities: ['Video Conferencing Hub', 'Acoustic Wall Panels', 'Wireless Podiums', 'Catering Prep Area'],
        isAvailable: true,
      }
    ];

    // 9. Bookings Collection
    this.bookings = [
      {
        _id: '65f1a2b3c4d5e6f7a8b9c791',
        classroomId: '65f1a2b3c4d5e6f7a8b9c702',
        roomNumber: 'LH-201',
        bookedBy: 'FAC101',
        facultyName: 'Dr. Rajesh Kumar',
        date: '2026-09-21',
        timeSlot: '10:00 AM - 12:00 PM',
        purpose: 'CS304 AI & ML Guest Lecture with Industry Speaker',
        status: 'Confirmed',
        createdAt: '2026-09-20T09:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c792',
        classroomId: '65f1a2b3c4d5e6f7a8b9c704',
        roomNumber: 'LAB-302',
        bookedBy: 'FAC102',
        facultyName: 'Prof. Ananya Roy',
        date: '2026-09-21',
        timeSlot: '02:00 PM - 04:30 PM',
        purpose: 'Deep Learning Model Training Practical Session',
        status: 'Confirmed',
        createdAt: '2026-09-20T11:30:00.000Z',
      }
    ];

    // 10. Notifications Collection
    this.notifications = [
      {
        _id: '65f1a2b3c4d5e6f7a8b9c801',
        title: 'Mid-Semester Examinations Schedule Released',
        message: 'The official timetable for Autumn 2026 Mid-Semester Examinations has been published on the Academic Portal. Hall tickets available starting Sept 24.',
        type: 'Academic',
        targetRole: 'All',
        sender: 'Office of the Controller of Examinations',
        readBy: ['student@smartcampus.edu'],
        createdAt: '2026-09-21T02:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c802',
        title: 'SmartHack 2026 Team Registrations Close in 48 Hours',
        message: 'Last chance to submit team profiles and abstracts for the SmartHack AI challenge. Mentors will be assigned post-screening.',
        type: 'Alert',
        targetRole: 'Student',
        sender: 'Innovation Hub Coordinator',
        readBy: [],
        createdAt: '2026-09-20T15:30:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c803',
        title: 'Bus Route #02 Traffic Advisory (Airport Junction)',
        message: 'Flyover maintenance near Meenambakkam Airport will cause 10-15 minutes delay on Morning Bus #02 route. Please plan accordingly.',
        type: 'Transport',
        targetRole: 'All',
        sender: 'Campus Transport Operations Desk',
        readBy: ['student@smartcampus.edu'],
        createdAt: '2026-09-20T17:00:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c804',
        title: 'Faculty Senate Meeting on New Curriculum Guidelines',
        message: 'All department Heads and Associate Professors requested to attend the hybrid curriculum review in Senate Hall tomorrow at 3:30 PM.',
        type: 'Info',
        targetRole: 'Faculty',
        sender: 'Dean of Academic Affairs',
        readBy: [],
        createdAt: '2026-09-19T14:00:00.000Z',
      }
    ];

    // 11. Lost & Found Collection
    this.lostFound = [
      {
        _id: '65f1a2b3c4d5e6f7a8b9c901',
        type: 'Lost',
        title: 'Texas Instruments TI-Nspire CX II Graphing Calculator',
        description: 'Black casing with small yellow fluorescent sticker on battery cover. Left behind on the 2nd row bench in LH-101 after CS301 class.',
        category: 'Electronics',
        locationFoundLost: 'Newton Block LH-101 (2nd row)',
        date: '2026-09-20',
        contactName: 'Priya Sharma',
        contactPhone: '+91 98401 23456',
        contactEmail: 'student@smartcampus.edu',
        status: 'Open',
        reportedBy: 'STU202401',
        createdAt: '2026-09-20T13:10:00.000Z',
        updatedAt: '2026-09-20T13:10:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c902',
        type: 'Found',
        title: 'Matte Blue Hydro Flask 32oz Water Bottle',
        description: 'Found under the round table near the coffee vending station in Central Food Court. Has campus trekking club sticker.',
        category: 'Other',
        locationFoundLost: 'Central Food Court (Ground Floor)',
        date: '2026-09-20',
        contactName: 'Security Desk Office (Ground Floor Admin)',
        contactPhone: '+91 98409 99887',
        contactEmail: 'security@smartcampus.edu',
        status: 'Open',
        reportedBy: 'FAC102',
        createdAt: '2026-09-20T15:45:00.000Z',
        updatedAt: '2026-09-20T15:45:00.000Z',
      },
      {
        _id: '65f1a2b3c4d5e6f7a8b9c903',
        type: 'Found',
        title: 'Campus Student ID Card with Green Lanyard (Venkatesh Iyer)',
        description: 'Discovered on the passenger seat of Campus Bus #02 near window seat 14. Handed over to Student Affairs helpdesk.',
        category: 'ID Cards & Keys',
        locationFoundLost: 'Campus Bus #02',
        date: '2026-09-19',
        contactName: 'Transport Operations Helpdesk',
        contactPhone: '+91 98840 22334',
        contactEmail: 'transport@smartcampus.edu',
        status: 'Claimed',
        reportedBy: 'BUS_DRIVER_02',
        createdAt: '2026-09-19T09:30:00.000Z',
        updatedAt: '2026-09-19T16:00:00.000Z',
      }
    ];

    // Seed initial API logs so the API Explorer / Admin Dashboard shows rich live telemetry from boot
    this.apiLogs = [
      {
        id: 'log-001',
        method: 'GET',
        endpoint: '/api/dashboard/statistics',
        statusCode: 200,
        durationMs: 14,
        timestamp: '2026-09-21T09:45:12.000Z',
        userRole: 'Admin',
        ip: '127.0.0.1',
      },
      {
        id: 'log-002',
        method: 'GET',
        endpoint: '/api/students',
        statusCode: 200,
        durationMs: 22,
        timestamp: '2026-09-21T09:48:33.000Z',
        userRole: 'Faculty',
        ip: '127.0.0.1',
      },
      {
        id: 'log-003',
        method: 'GET',
        endpoint: '/api/buses',
        statusCode: 200,
        durationMs: 9,
        timestamp: '2026-09-21T09:50:01.000Z',
        userRole: 'Student',
        ip: '127.0.0.1',
      },
      {
        id: 'log-004',
        method: 'POST',
        endpoint: '/api/attendance',
        statusCode: 201,
        durationMs: 31,
        timestamp: '2026-09-21T10:02:15.000Z',
        userRole: 'Faculty',
        ip: '127.0.0.1',
      }
    ];
  }
}

export const db = new DatabaseService();
