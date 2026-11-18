import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

const uploadsDir = path.join(backendRoot, 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const logosDir = path.join(uploadsDir, 'logos');
const resumesDir = path.join(uploadsDir, 'resumes');

// Ensure upload directories exist
[uploadsDir, avatarsDir, logosDir, resumesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Image filter
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only valid image files (JPG, PNG, WEBP, GIF) are allowed.'), false);
  }
};

// Storage for Avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(avatarsDir, { recursive: true });
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const userId = req.user?.id || req.user?._id || 'user';
    cb(null, `avatar-${userId}-${Date.now()}${ext}`);
  }
});

// Storage for Company Logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(logosDir, { recursive: true });
    cb(null, logosDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const companyId = req.user?.id || req.user?._id || 'company';
    cb(null, `logo-${companyId}-${Date.now()}${ext}`);
  }
});

// Multer upload instances
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: imageFileFilter
});

export const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: imageFileFilter
});

export const handleAvatarUpload = (req, res, next) => {
  uploadAvatar.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'avatar', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image size exceeds maximum limit of 5MB.' });
      }
      return res.status(400).json({ error: err.message || 'Error uploading image file.' });
    }
    if (req.files) {
      const file = req.files.photo?.[0] || req.files.avatar?.[0] || req.files.image?.[0] || req.files.file?.[0];
      if (file) {
        req.file = file;
      }
    }
    next();
  });
};

export const handleLogoUpload = (req, res, next) => {
  uploadLogo.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Logo size exceeds maximum limit of 5MB.' });
      }
      return res.status(400).json({ error: err.message || 'Error uploading logo file.' });
    }
    if (req.files) {
      const file = req.files.logo?.[0] || req.files.photo?.[0] || req.files.image?.[0] || req.files.file?.[0];
      if (file) {
        req.file = file;
      }
    }
    next();
  });
};

