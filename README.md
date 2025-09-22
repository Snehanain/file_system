# File Manager

A modern, full-stack file management application with duplicate detection capabilities. Built with Node.js, Express, and vanilla JavaScript.

![File Manager](https://img.shields.io/badge/File%20Manager-v1.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![Express](https://img.shields.io/badge/Express-v4.18+-red)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## ✨ Features

- **📁 File Upload**: Drag & drop or click to upload files
- **🔍 Duplicate Detection**: Automatically detects and prevents duplicate file uploads using SHA-256 hashing
- **📋 File Management**: View, download, and delete uploaded files
- **🎨 Modern UI**: Beautiful, responsive interface with real-time feedback
- **📊 Progress Tracking**: Visual upload progress with status updates
- **💾 Memory Storage**: Files stored in memory (resets on server restart)
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/file-manager.git
   cd file-manager
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Upload Files
- **Drag & Drop**: Simply drag files from your computer onto the upload area
- **Click to Browse**: Click the "Select Files" button to open the file browser
- **Multiple Files**: You can select multiple files at once

### Duplicate Detection
- When you try to upload a file that already exists, the system will:
  - Show a warning message
  - Display information about the original file
  - Prevent the duplicate from being uploaded

### File Management
- **View Files**: See all uploaded files with details (name, size, upload date, type)
- **Download**: Click the download button to save files to your computer
- **Delete**: Remove files you no longer need
- **Refresh**: Update the file list manually

## 🛠️ Technical Details

### Backend (Node.js + Express)
- **Server**: Express.js web server
- **File Upload**: Multer middleware for handling multipart/form-data
- **Duplicate Detection**: SHA-256 hashing for file comparison
- **Storage**: In-memory storage (resets on server restart)
- **CORS**: Enabled for cross-origin requests
- **File Size Limit**: 10MB per file

### Frontend (Vanilla JavaScript)
- **UI**: Modern, responsive design with CSS Grid and Flexbox
- **Drag & Drop**: Native HTML5 drag and drop API
- **AJAX**: Fetch API for server communication
- **Notifications**: Toast notifications for user feedback
- **Icons**: Font Awesome icons for better UX
- **Animations**: Smooth CSS transitions and animations

### API Endpoints
- `GET /` - Serve the frontend application
- `GET /api/files` - Get list of all uploaded files
- `POST /api/upload` - Upload a new file
- `DELETE /api/files/:id` - Delete a file by ID
- `GET /api/files/:id/download` - Download a file by ID

## 📁 Project Structure

```
file-manager/
├── backend/
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express server with API endpoints
├── frontend/
│   ├── index.html            # Main HTML file
│   ├── styles.css            # CSS styles
│   └── script.js             # JavaScript functionality
├── README.md                 # This file
└── .gitignore               # Git ignore file
```

## 🎨 Design Features

- **Modern Color Scheme**: Professional blue gradient background
- **Glass Morphism**: Subtle backdrop blur effects
- **Smooth Animations**: CSS transitions and hover effects
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: Proper contrast ratios and keyboard navigation

## 🔧 Development

### Running in Development Mode
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Building for Production
```bash
cd backend
npm start
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# If port 3000 is busy, you can change it
PORT=3001 npm start
```

**File Upload Fails**
- Check file size (must be under 10MB)
- Ensure file is not corrupted
- Check browser console for error messages

**Duplicate Detection Not Working**
- Duplicate detection is based on file content, not filename
- Files with identical content will be detected as duplicates regardless of name

## 📝 License

MIT License - feel free to use this project for learning and development purposes.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**File Manager** - A simple yet powerful file management solution with duplicate detection.

Made with ❤️ using Node.js, Express, and vanilla JavaScript.