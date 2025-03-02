import express, { Router, Request, Response } from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { User } from '../lib/models/User.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../lib/utils/asyncHandler.js';

const router: Router = express.Router();

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

// Ruta para crear preferencia de pago
router.post('/create-preference', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { plan } = req.body;
  
  try {
    const planConfig = {
      monthly: { price: 9.99, title: "Plan Mensual" },
      biannual: { price: 49.99, title: "Plan Semestral" },
      annual: { price: 89.99, title: "Plan Anual" }
    };

    const selectedPlan = planConfig[plan as keyof typeof planConfig];
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Plan inválido' });
    }

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: plan,
            title: selectedPlan.title,
            quantity: 1,
            unit_price: selectedPlan.price,
            currency_id: "USD"
          }
        ],
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`
        },
        auto_return: "approved",
        notification_url: `${process.env.BACKEND_URL}/api/webhook`,
        metadata: {
          userId: req.user!._id,
          planId: plan
        }
      }
    });

    res.json({ preferenceId: preference.id });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: 'Error al crear preferencia de pago' });
  }
}));

// Webhook para recibir notificaciones de pago
router.post('/webhook', asyncHandler(async (req: Request, res: Response) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    try {
      const { metadata } = data;
      if (metadata?.userId) {
        await User.findByIdAndUpdate(metadata.userId, {
          role: 'premium'
        });
        console.log(`Usuario ${metadata.userId} actualizado a premium`);
      }
    } catch (error) {
      console.error('Error procesando webhook:', error);
    }
  }

  res.sendStatus(200);
}));

export default router;
