import express, { Router, Request, Response } from 'express';
import { Reading } from '../lib/models/Reading.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../lib/utils/asyncHandler.js';

const router: Router = express.Router();

// Ruta para obtener lecturas
router.get('/', authenticateToken, asyncHandler(async (_req: Request, res: Response) => {
  try {
    const readings = await Reading.find();
    res.json(readings);
  } catch (error) {
    console.error('Error al obtener lecturas:', error);
    res.status(500).json({ error: 'Error al obtener lecturas' });
  }
}));

export default router;
