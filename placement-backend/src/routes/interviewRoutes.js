import express from 'express';
import {
  getRoomAccess,
  updateInterviewStatus,
  getInterviewDetails
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All interview room routes require authentication
router.use(protect);

router.get('/:id/room-access', getRoomAccess);
router.patch('/:id/status', updateInterviewStatus);
router.get('/:id', getInterviewDetails);

export default router;

