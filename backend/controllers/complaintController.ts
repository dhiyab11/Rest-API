import { Request, Response } from 'express';
import { db, generateObjectId } from '../services/databaseService.js';
import { IComplaint } from '../models/types.js';

export const complaintController = {
  // GET /api/complaints
  getAllComplaints: (req: Request, res: Response) => {
    const { status, category, priority, studentId } = req.query;
    let list = [...db.complaints];

    if (status && typeof status === 'string' && status !== 'All') {
      list = list.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }
    if (category && typeof category === 'string' && category !== 'All') {
      list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }
    if (priority && typeof priority === 'string' && priority !== 'All') {
      list = list.filter(c => c.priority.toLowerCase() === priority.toLowerCase());
    }
    if (studentId && typeof studentId === 'string') {
      list = list.filter(c => c.submittedBy.toLowerCase() === studentId.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      total: list.length,
      data: list,
    });
  },

  // GET /api/complaints/:id
  getComplaintById: (req: Request, res: Response) => {
    const { id } = req.params;
    const complaint = db.complaints.find(c => c._id === id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint not found with ID '${id}'`,
        statusCode: 404,
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: complaint,
    });
  },

  // POST /api/complaints
  createComplaint: (req: Request, res: Response) => {
    const { title, description, category, priority = 'Medium', studentId, studentName } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: title, description, and category are required',
        statusCode: 400,
      });
    }

    const subId = studentId || req.user?.referenceId || 'STU202401';
    const subName = studentName || req.user?.name || 'Priya Sharma';

    const newComplaint: IComplaint = {
      _id: generateObjectId(),
      title,
      description,
      category,
      priority,
      status: 'Pending',
      submittedBy: subId,
      studentName: subName,
      assignedTo: 'Campus Student Grievance Committee',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.complaints.unshift(newComplaint);

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      statusCode: 201,
      data: newComplaint,
    });
  },

  // PUT /api/complaints/:id/status
  updateComplaintStatus: (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, resolutionNotes, assignedTo } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required (Pending, In Progress, Resolved, Rejected)',
        statusCode: 400,
      });
    }

    const complaint = db.complaints.find(c => c._id === id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
        statusCode: 404,
      });
    }

    complaint.status = status;
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo;
    complaint.updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: `Complaint status updated to '${status}'`,
      statusCode: 200,
      data: complaint,
    });
  },

  // DELETE /api/complaints/:id
  deleteComplaint: (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.complaints.findIndex(c => c._id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
        statusCode: 404,
      });
    }

    const removed = db.complaints.splice(index, 1)[0];

    return res.status(200).json({
      success: true,
      message: 'Complaint record removed successfully',
      statusCode: 200,
      data: removed,
    });
  },
};
