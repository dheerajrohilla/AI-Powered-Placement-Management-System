import express from 'express';
import {
  getSubjects,
  getSubjectMaterials,
  getPdfMetadata,
  streamPdf,
  downloadPdf
} from '../controllers/studyMaterialController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All study material routes require authentication
router.use(protect);

// Subjects overview & metadata
router.get('/subjects', getSubjects);
router.get('/subjects/:subjectId', getSubjectMaterials);

// Individual PDF operations
router.get('/pdf/:fileId/metadata', getPdfMetadata);
router.get('/pdf/:fileId/stream', streamPdf);
router.get('/pdf/:fileId/download', downloadPdf);

export default router;
