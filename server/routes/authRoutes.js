import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  updatePassword, 
  getOAuthUrl,
  getSessions,
  revokeSession,
  logoutAll,
  enroll2FA,
  verify2FA,
  challenge2FA,
  list2FAFactors,
  unenroll2FA
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

import { validateRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/me', authMiddleware, getMe);

// Step 9: Account Recovery
router.post('/forgot-password', forgotPassword);
router.post('/update-password', authMiddleware, updatePassword);

// Step 1: OAuth
router.get('/oauth/:provider', getOAuthUrl);

// Steps 6, 8, 15: Session Management
router.get('/sessions', authMiddleware, getSessions);
router.delete('/sessions/:sessionId', authMiddleware, revokeSession);
router.post('/logout-all', authMiddleware, logoutAll);

// Step 5: 2FA
router.post('/2fa/enroll', authMiddleware, enroll2FA);
router.post('/2fa/verify', authMiddleware, verify2FA);
router.post('/2fa/challenge', authMiddleware, challenge2FA);
router.get('/2fa/factors', authMiddleware, list2FAFactors);
router.delete('/2fa/unenroll', authMiddleware, unenroll2FA);

export default router;
