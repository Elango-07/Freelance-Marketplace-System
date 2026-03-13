import express from 'express';
import { razorpayWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Note: Use express.raw() for webhook signature verification if needed, 
// but since we're using JSON.stringify on req.body, ensure app.use(express.json()) is active.
router.post('/razorpay', razorpayWebhook);

export default router;
