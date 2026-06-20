const multer = require('multer');
const path = require('path');
const config = require('../config');
const ApiResponse = require('../utils/response');

const ALLOWED_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword'],
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.path);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allAllowed = [...ALLOWED_TYPES.images, ...ALLOWED_TYPES.documents];
  if (allAllowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ApiResponse.badRequest(res, 'File too large. Maximum size is 5MB');
    }
    return ApiResponse.badRequest(res, err.message);
  }
  if (err) {
    return ApiResponse.badRequest(res, err.message);
  }
  next();
};

module.exports = { upload, handleUploadError, ALLOWED_TYPES };
