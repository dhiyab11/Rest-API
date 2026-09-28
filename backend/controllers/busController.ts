import { Request, Response } from 'express';
import { db } from '../services/databaseService.js';

export const busController = {
  // GET /api/buses
  getAllBuses: (req: Request, res: Response) => {
    const { status } = req.query;
    let list = [...db.buses];

    if (status && typeof status === 'string' && status !== 'All') {
      list = list.filter(b => b.status.toLowerCase() === status.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      total: list.length,
      data: list,
    });
  },

  // GET /api/buses/:id
  getBusById: (req: Request, res: Response) => {
    const { id } = req.params;
    const bus = db.buses.find(b => b._id === id || b.busNumber.includes(id));

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: `Bus not found with identifier '${id}'`,
        statusCode: 404,
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: bus,
    });
  },

  // POST /api/buses/location
  updateBusLocation: (req: Request, res: Response) => {
    const { busId, lat, lng, landmark, speedKmH, status, currentOccupancy } = req.body;

    if (!busId) {
      return res.status(400).json({
        success: false,
        message: 'busId is required',
        statusCode: 400,
      });
    }

    const bus = db.buses.find(b => b._id === busId || b.busNumber.includes(busId));
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: `Bus not found with ID '${busId}'`,
        statusCode: 404,
      });
    }

    if (lat !== undefined && lng !== undefined) {
      bus.currentLocation.lat = Number(lat);
      bus.currentLocation.lng = Number(lng);
    }
    if (landmark) bus.currentLocation.landmark = landmark;
    if (speedKmH !== undefined) bus.currentLocation.speedKmH = Number(speedKmH);
    bus.currentLocation.lastUpdated = 'Just now';

    if (status) bus.status = status;
    if (currentOccupancy !== undefined) bus.currentOccupancy = Number(currentOccupancy);

    return res.status(200).json({
      success: true,
      message: 'Bus telemetry and GPS coordinates updated',
      statusCode: 200,
      data: bus,
    });
  },

  // GET /api/buses/:id/location
  getBusLocation: (req: Request, res: Response) => {
    const { id } = req.params;
    const bus = db.buses.find(b => b._id === id || b.busNumber.includes(id));

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
        statusCode: 404,
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      busId: bus._id,
      busNumber: bus.busNumber,
      status: bus.status,
      location: bus.currentLocation,
    });
  },
};
