import { Request, Response } from 'express';
import { db, generateObjectId } from '../services/databaseService.js';
import { ILostFound } from '../models/types.js';

export const lostFoundController = {
  // GET /api/lost-found
  getAllLostFound: (req: Request, res: Response) => {
    const { type, category, status, search } = req.query;
    let list = [...db.lostFound];

    if (type && typeof type === 'string' && type !== 'All') {
      list = list.filter(item => item.type.toLowerCase() === type.toLowerCase());
    }
    if (category && typeof category === 'string' && category !== 'All') {
      list = list.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }
    if (status && typeof status === 'string' && status !== 'All') {
      list = list.filter(item => item.status.toLowerCase() === status.toLowerCase());
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.locationFoundLost || item.location || '').toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      total: list.length,
      data: list,
    });
  },

  // GET /api/lost-found/:id
  getLostFoundById: (req: Request, res: Response) => {
    const { id } = req.params;
    const item = db.lostFound.find(i => i._id === id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost & Found item not found',
        statusCode: 404,
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: item,
    });
  },

  // POST /api/lost-found
  createLostFound: (req: Request, res: Response) => {
    const { type, title, description, category, locationFoundLost, contactName, contactPhone, contactEmail } = req.body;

    if (!type || !title || !locationFoundLost) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: type (Lost/Found), title, and location are required',
        statusCode: 400,
      });
    }

    const newItem: ILostFound = {
      _id: generateObjectId(),
      type: type === 'Found' ? 'Found' : 'Lost',
      title,
      description: description || '',
      category: category || 'Other',
      locationFoundLost,
      date: new Date().toISOString().split('T')[0],
      contactName: contactName || req.user?.name || 'Campus Student',
      contactPhone: contactPhone || '+91 98400 00000',
      contactEmail: contactEmail || req.user?.email || 'contact@smartcampus.edu',
      status: 'Open',
      reportedBy: req.user?.referenceId || req.user?.userId || 'STU202401',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.lostFound.unshift(newItem);

    return res.status(201).json({
      success: true,
      message: `${newItem.type} item report registered successfully`,
      statusCode: 201,
      data: newItem,
    });
  },

  // PUT /api/lost-found/:id
  updateLostFound: (req: Request, res: Response) => {
    const { id } = req.params;
    const item = db.lostFound.find(i => i._id === id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
        statusCode: 404,
      });
    }

    Object.assign(item, req.body, { updatedAt: new Date().toISOString() });

    return res.status(200).json({
      success: true,
      message: 'Item details updated successfully',
      statusCode: 200,
      data: item,
    });
  },

  // DELETE /api/lost-found/:id
  deleteLostFound: (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.lostFound.findIndex(i => i._id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
        statusCode: 404,
      });
    }

    const removed = db.lostFound.splice(index, 1)[0];

    return res.status(200).json({
      success: true,
      message: 'Lost & Found record removed',
      statusCode: 200,
      data: removed,
    });
  },
};
