import express, { Router, Request, Response } from 'express';
import { startOfDay } from 'date-fns';
import { Phrase } from '../lib/models/Phrase.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../lib/utils/asyncHandler.js';

const router: Router = express.Router();
const FREE_CATEGORIES = ['Greeting and Introducing', 'Health and Wellness'];

// Ruta para obtener frases
router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { language, category } = req.query;
  const user = req.user!;

  if (user.role === 'free') {
    const today = startOfDay(new Date());
    const lastReset = startOfDay(user.lastPhrasesReset);

    if (today > lastReset) {
      user.dailyPhrasesCount = 0;
      user.lastPhrasesReset = new Date();
      await user.save();
    }
  }

  const query: any = { 
    ...(language && { language: language.toString() }),
    ...(category && { category: category.toString() }),
    ...(user.role === 'free' && { category: { $in: FREE_CATEGORIES } })
  };

  const phrases = await Phrase.find(query);
  
  res.json({
    phrases,
    userInfo: {
      role: user.role,
      dailyPhrasesCount: user.dailyPhrasesCount
    }
  });
}));

// Ruta para incrementar el contador de frases
router.post('/increment', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'free') {
    user.dailyPhrasesCount += 1;
    await user.save();
  }
  res.json({ dailyPhrasesCount: user.dailyPhrasesCount });
}));

export default router;
