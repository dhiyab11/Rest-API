import { Request, Response } from 'express';
import { db, generateObjectId } from '../services/databaseService.js';
import { IBooking } from '../models/types.js';

export const classroomController = {
  // GET /api/classrooms
  getAllClassrooms: (req: Request, res: Response) => {
    const { block, type, isAvailable } = req.query;
    let list = [...db.classrooms];

    if (block && typeof block === 'string' && block !== 'All') {
      list = list.filter(c => c.block.toLowerCase().includes(block.toLowerCase()));
    }
    if (type && typeof type === 'string' && type !== 'All') {
      list = list.filter(c => c.type.toLowerCase() === type.toLowerCase());
    }
    if (isAvailable !== undefined) {
      const boolVal = isAvailable === 'true';
      list = list.filter(c => c.isAvailable === boolVal);
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      total: list.length,
      data: list,
    });
  },

  // GET /api/classrooms/available
  getAvailableClassrooms: (req: Request, res: Response) => {
    const available = db.classrooms.filter(c => c.isAvailable);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      total: available.length,
      data: available,
    });
  },

  // POST /api/classrooms/book
  bookClassroom: (req: Request, res: Response) => {
    const { classroomId, roomNumber, date, timeSlot, purpose, facultyName } = req.body;

    if (!classroomId && !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'classroomId or roomNumber is required',
        statusCode: 400,
      });
    }

    const room = db.classrooms.find(c => c._id === classroomId || c.roomNumber === roomNumber);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found',
        statusCode: 404,
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `Classroom '${room.roomNumber}' is already booked (${room.currentBooking?.purpose || 'Occupied'})`,
        statusCode: 400,
      });
    }

    const bookingId = generateObjectId();
    const bookedFaculty = facultyName || req.user?.name || 'Dr. Rajesh Kumar';

    const newBooking: IBooking = {
      _id: bookingId,
      classroomId: room._id,
      roomNumber: room.roomNumber,
      bookedBy: req.user?.referenceId || req.user?.userId || 'FAC101',
      facultyName: bookedFaculty,
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '02:00 PM - 04:00 PM',
      purpose: purpose || 'Academic Lecture / Seminar',
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    db.bookings.push(newBooking);

    // Update classroom availability
    room.isAvailable = false;
    room.currentBooking = {
      bookingId: newBooking._id,
      bookedBy: newBooking.bookedBy,
      facultyName: newBooking.facultyName,
      purpose: newBooking.purpose,
      startTime: timeSlot ? timeSlot.split('-')[0].trim() : '02:00 PM',
      endTime: timeSlot ? timeSlot.split('-')[1]?.trim() || '04:00 PM' : '04:00 PM',
      date: newBooking.date,
    };

    return res.status(201).json({
      success: true,
      message: `Classroom ${room.roomNumber} reserved successfully`,
      statusCode: 201,
      data: {
        booking: newBooking,
        classroom: room,
      },
    });
  },

  // DELETE /api/classrooms/booking/:id
  cancelBooking: (req: Request, res: Response) => {
    const { id } = req.params;
    const bookingIndex = db.bookings.findIndex(b => b._id === id);

    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        statusCode: 404,
      });
    }

    const booking = db.bookings[bookingIndex];
    booking.status = 'Cancelled';

    // Release classroom
    const room = db.classrooms.find(c => c._id === booking.classroomId || c.roomNumber === booking.roomNumber);
    if (room && room.currentBooking?.bookingId === booking._id) {
      room.isAvailable = true;
      room.currentBooking = undefined;
    }

    return res.status(200).json({
      success: true,
      message: `Booking ${id} cancelled and classroom released`,
      statusCode: 200,
    });
  },
};
