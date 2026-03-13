import express from 'express';
import multer from 'multer';
import { uploadFile, deleteFile } from '../controllers/fileController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadFile);
router.post('/delete', deleteFile);

export default router;
