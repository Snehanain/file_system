const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory storage for files (resets on server restart)
const fileStorage = new Map();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Generate file hash for duplicate detection
function generateFileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Get all uploaded files
app.get('/api/files', (req, res) => {
  const files = Array.from(fileStorage.values()).map(file => ({
    id: file.id,
    name: file.originalname,
    size: file.size,
    type: file.mimetype,
    uploadDate: file.uploadDate,
    hash: file.hash
  }));
  res.json(files);
});

// Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileHash = generateFileHash(req.file.buffer);
    
    // Check for duplicates
    const existingFile = Array.from(fileStorage.values()).find(file => file.hash === fileHash);
    
    if (existingFile) {
      return res.status(409).json({ 
        error: 'Duplicate file detected',
        duplicateFile: {
          id: existingFile.id,
          name: existingFile.originalname,
          uploadDate: existingFile.uploadDate
        }
      });
    }

    // Store file in memory
    const fileId = crypto.randomUUID();
    const fileData = {
      id: fileId,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer,
      hash: fileHash,
      uploadDate: new Date().toISOString()
    };

    fileStorage.set(fileId, fileData);

    res.json({
      message: 'File uploaded successfully',
      file: {
        id: fileId,
        name: fileData.originalname,
        size: fileData.size,
        type: fileData.mimetype,
        uploadDate: fileData.uploadDate
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete file
app.delete('/api/files/:id', (req, res) => {
  const fileId = req.params.id;
  
  if (fileStorage.has(fileId)) {
    fileStorage.delete(fileId);
    res.json({ message: 'File deleted successfully' });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Download file
app.get('/api/files/:id/download', (req, res) => {
  const fileId = req.params.id;
  const file = fileStorage.get(fileId);
  
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
  res.setHeader('Content-Type', file.mimetype);
  res.send(file.buffer);
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 FileVault server running on http://localhost:${PORT}`);
  console.log(`📁 Frontend served from: ${path.join(__dirname, '../frontend')}`);
  console.log(`💾 Files stored in memory (resets on server restart)`);
});
