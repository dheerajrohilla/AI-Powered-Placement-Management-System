import express from 'express';
import { protect } from '../middleware/auth.js';
import { handleAvatarUpload, handleLogoUpload } from '../middleware/upload.js';
import * as studentCtrl from '../controllers/studentController.js';
import * as tpoCtrl from '../controllers/tpoController.js';
import * as adminCtrl from '../controllers/adminController.js';
import * as companyCtrl from '../controllers/companyController.js';

const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    switch (req.user.role) {
      case 'student':
        return studentCtrl.getProfile(req, res, next);
      case 'tpo':
        return tpoCtrl.getProfile(req, res, next);
      case 'admin':
        return adminCtrl.getProfile(req, res, next);
      case 'company':
        return companyCtrl.getProfile(req, res, next);
      default:
        return res.status(403).json({ error: 'Unsupported account role.' });
    }
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    switch (req.user.role) {
      case 'student':
        return studentCtrl.updateProfile(req, res, next);
      case 'tpo':
        return tpoCtrl.updateProfile(req, res, next);
      case 'admin':
        return adminCtrl.updateProfile(req, res, next);
      case 'company':
        return companyCtrl.updateProfile(req, res, next);
      default:
        return res.status(403).json({ error: 'Unsupported account role.' });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/photo', (req, res, next) => {
  if (req.user.role === 'company') {
    handleLogoUpload(req, res, (err) => {
      if (err) return next(err);
      return companyCtrl.uploadCompanyLogo(req, res, next);
    });
  } else {
    handleAvatarUpload(req, res, (err) => {
      if (err) return next(err);
      if (req.user.role === 'student') {
        return studentCtrl.uploadProfilePhoto(req, res, next);
      } else if (req.user.role === 'tpo') {
        return tpoCtrl.uploadProfilePhoto(req, res, next);
      } else if (req.user.role === 'admin') {
        return adminCtrl.uploadProfilePhoto(req, res, next);
      } else {
        return res.status(403).json({ error: 'Unsupported account role.' });
      }
    });
  }
});

export default router;

