import express, { Router, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../lib/models/User.js';
import { generateToken } from '../lib/utils/jwt.js';
import { sendPasswordResetEmail } from '../lib/utils/email.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../lib/utils/asyncHandler.js';

const router: Router = express.Router();

// Esquemas de validación con Zod
const SignUpSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// Ruta para solicitar recuperación de contraseña
router.post('/forgot-password', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'No existe una cuenta con este correo electrónico' });
  }

  const resetToken = generateToken({ userId: user._id }, '30m');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
  await user.save();

  try {
    await sendPasswordResetEmail(email, resetToken);
    res.json({ message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo de recuperación' });
  }
}));

// Rutas de autenticación
router.post('/signup', asyncHandler(async (req: Request, res: Response) => {
  const validation = SignUpSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }

  const { firstName, lastName, email, password } = validation.data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const user = new User({ firstName, lastName, email, password });
  await user.save();

  const token = generateToken({ userId: user._id });
  
  res.status(201).json({
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    }
  });
}));

router.post('/signin', asyncHandler(async (req: Request, res: Response) => {
  const validation = SignInSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ 
      error: validation.error.errors.map(e => e.message).join(', ')
    });
  }

  const { email, password } = validation.data;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = generateToken({ userId: user._id });
  
  res.json({
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    }
  });
}));

// Rutas protegidas
router.get('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  res.json({
    id: req.user!._id,
    firstName: req.user!.firstName,
    lastName: req.user!.lastName,
    email: req.user!.email,
    role: req.user!.role
  });
}));

export default router;
