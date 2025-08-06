// backend/src/middleware/image.middleware.js

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(); // No files to process, move to the next middleware
  }

  try {
    const processedFiles = [];
    for (const file of req.files) {
      const newFilename = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
      const newPath = path.join(__dirname, '../../uploads', newFilename);

      await sharp(file.path)
        .resize({ width: 1024, height: 1024, fit: 'inside' }) // Resize to max 1024x1024
        .toFormat('webp') // Convert to WebP format
        .webp({ quality: 80 }) // Set WebP quality
        .toFile(newPath);

      // Add the new filename to our processed files list
      processedFiles.push(newFilename);

      // Delete the original uploaded file
      fs.unlinkSync(file.path);
    }
    
    // Replace req.files with our new processed file info
    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ message: 'Error processing images.' });
  }
};

module.exports = { processImages };