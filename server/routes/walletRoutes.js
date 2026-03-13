import express from 'express';
import { getWallet, getTransactions, requestWithdrawal } from '../controllers/walletController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getWallet);
router.get('/transactions', getTransactions);
router.post('/withdraw', requestWithdrawal);

export default router;
