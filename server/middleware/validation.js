import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  body('name').trim().notEmpty().withMessage('Name is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateLogin = [
  body('email').isEmail().withMessage('Invalid email.'),
  body('password').notEmpty().withMessage('Password is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
