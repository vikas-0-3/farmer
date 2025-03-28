const multer = require('multer');
const path = require('path');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Determine prefix based on the field name
    let prefix;
    if (file.fieldname === 'farmPhoto') {
      prefix = 'farmer';
    } else if (file.fieldname === 'profilePhoto') {
      prefix = 'user';
    } else {
      prefix = 'file';
    }
    const uniqueName = `${prefix}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

// Filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image uploads are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit files to 5 MB (adjust as needed)
});

module.exports = upload;
