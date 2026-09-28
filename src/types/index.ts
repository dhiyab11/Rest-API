export type UserRole = 'Student' | 'Faculty' | 'Admin';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  referenceId?: string;
  department?: string;
}

export interface IStudent {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: number;
  semester: number;
  cgpa: number;
  attendanceRate: number;
  assignedBusId?: string;
  hostelResident: boolean;
  roomNumber?: string;
  createdAt: string;
  updatedAt: string;
  attendanceHistory?: IAttendance[];
  complaints?: IComplaint[];
}

export interface IFaculty {
  _id: string;
  facultyId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  cabinNumber: string;
  phone: string;
  subjects: string[];
}

export interface IAttendance {
  _id: string;
  studentId: string;
  studentName: string;
  subjectCode: string;
  subjectName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  markedBy: string;
  semester: number;
  createdAt: string;
}

export interface IComplaint {
  _id: string;
  title: string;
  description: string;
  category: 'Hostel' | 'Academic' | 'Transport' | 'Infrastructure' | 'Cafeteria' | 'Library' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  submittedBy: string;
  studentName: string;
  assignedTo?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  category: 'Workshop' | 'Hackathon' | 'Cultural' | 'Sports' | 'Seminar';
  venue: string;
  date: string;
  time: string;
  organizer: string;
  capacity: number;
  registeredStudents: string[];
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  bannerUrl?: string;
  isRegistered?: boolean;
}

export interface IBusLocation {
  lat: number;
  lng: number;
  landmark: string;
  lastUpdated: string;
  speedKmH: number;
}

export interface IBus {
  _id: string;
  busNumber: string;
  route: string;
  driverName: string;
  driverPhone: string;
  currentLocation: IBusLocation;
  status: 'On Route' | 'At Stop' | 'Delayed' | 'Maintenance';
  capacity: number;
  currentOccupancy: number;
  stops: string[];
  departureTime: string;
  arrivalTime: string;
}

export interface IClassroom {
  _id: string;
  roomNumber: string;
  block: string;
  type: 'Lecture Hall' | 'Computer Lab' | 'Seminar Hall' | 'Project Room';
  capacity: number;
  facilities: string[];
  isAvailable: boolean;
  currentBooking?: {
    bookingId: string;
    bookedBy: string;
    facultyName: string;
    purpose: string;
    startTime: string;
    endTime: string;
    date: string;
  };
}

export interface IBooking {
  _id: string;
  classroomId: string;
  roomNumber: string;
  bookedBy: string;
  facultyName: string;
  date: string;
  timeSlot: string;
  purpose: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: 'Info' | 'Alert' | 'Academic' | 'Transport' | 'Urgent';
  targetRole: 'All' | 'Student' | 'Faculty' | 'Admin';
  sender: string;
  readBy: string[];
  createdAt: string;
}

export interface ILostFound {
  _id: string;
  type: 'Lost' | 'Found';
  title: string;
  description: string;
  category: 'Electronics' | 'ID Cards & Keys' | 'Books & Stationery' | 'Clothing & Accessories' | 'Other' | string;
  locationFoundLost?: string;
  location?: string;
  date: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: 'Open' | 'Claimed' | 'Closed';
  reportedBy: string;
  claimedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IApiLog {
  id: string;
  method: string;
  endpoint: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  userRole?: string;
  ip?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  statusCode: number;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
}
