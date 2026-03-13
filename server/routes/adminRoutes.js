import express from 'express';
import { getProjectRanking, assignBestPartner } from '../controllers/adminController.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.use(adminOnly);

router.get('/matching/:projectId', getProjectRanking);
router.post('/auto-assign', assignBestPartner);

export default router;
