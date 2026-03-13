import express from 'express';
import { createMilestoneOrder, verifyPayment } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/create-order', createMilestoneOrder);
router.post('/verify', verifyPayment);

export default router;
