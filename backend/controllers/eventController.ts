import { Request, Response } from 'express';
import { db, generateObjectId } from '../services/databaseService.js';
import { IEvent } from '../models/types.js';

export const eventController = {
  // GET /api/events
  getAllEvents: (req: Request, res: Response) => {
    const { category, status, search } = req.query;
    let list = [...db.events];

    if (category && typeof category === 'string' && category !== 'All') {
      list = list.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }
    if (status && typeof status === 'string' && status !== 'All') {
      list = list.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      total: list.length,
      data: list,
    });
  },

  // POST /api/events
  createEvent: (req: Request, res: Response) => {
    const { title, description, category, venue, date, time, capacity, bannerUrl } = req.body;

    if (!title || !venue || !date) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: title, venue, and date are required',
        statusCode: 400,
      });
    }

    const newEvent: IEvent = {
      _id: generateObjectId(),
      title,
      description: description || 'Campus Event',
      category: category || 'Workshop',
      venue,
      date,
      time: time || '10:00 AM',
      organizer: req.user?.name || 'Campus Student Affairs',
      capacity: Number(capacity) || 100,
      registeredStudents: [],
      status: 'Upcoming',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    db.events.push(newEvent);

    return res.status(201).json({
      success: true,
      message: 'Event published successfully',
      statusCode: 201,
      data: newEvent,
    });
  },

  // PUT /api/events/:id
  updateEvent: (req: Request, res: Response) => {
    const { id } = req.params;
    const event = db.events.find(e => e._id === id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        statusCode: 404,
      });
    }

    Object.assign(event, req.body);

    return res.status(200).json({
      success: true,
      message: 'Event details updated successfully',
      statusCode: 200,
      data: event,
    });
  },

  // DELETE /api/events/:id
  deleteEvent: (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.events.findIndex(e => e._id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        statusCode: 404,
      });
    }

    const removed = db.events.splice(index, 1)[0];

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      statusCode: 200,
      data: removed,
    });
  },

  // POST /api/events/:id/register
  registerForEvent: (req: Request, res: Response) => {
    const { id } = req.params;
    const { studentId } = req.body;

    const event = db.events.find(e => e._id === id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        statusCode: 404,
      });
    }

    const effectiveStudentId = studentId || req.user?.referenceId || 'STU202401';

    if (event.registeredStudents.includes(effectiveStudentId)) {
      return res.status(400).json({
        success: false,
        message: `Student '${effectiveStudentId}' is already registered for this event`,
        statusCode: 400,
      });
    }

    if (event.registeredStudents.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event registration is at full capacity',
        statusCode: 400,
      });
    }

    event.registeredStudents.push(effectiveStudentId);

    return res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      statusCode: 200,
      data: {
        eventId: event._id,
        title: event.title,
        registeredCount: event.registeredStudents.length,
        capacity: event.capacity,
        studentId: effectiveStudentId,
      },
    });
  },
};
