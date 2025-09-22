# FileVault

A modern file management system built with Node.js and vanilla JavaScript. FileVault provides an intuitive interface for uploading, organizing, and managing files with advanced search and filtering capabilities.

## Features

- **File Upload**: Drag and drop or click to upload files
- **Duplicate Detection**: Prevents duplicate file uploads using content hashing
- **Search & Filter**: Find files quickly with advanced filtering options
- **File Management**: Download, delete, and organize your files
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Progress**: Visual feedback during file uploads

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Snehanain/file_system.git
cd file_system
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Uploading Files

FileVault supports multiple ways to upload files:

- **Drag & Drop**: Simply drag files from your computer onto the upload area
- **Click to Browse**: Use the "Choose Files" button to open the file browser
- **Take Photo**: Use the "Take Photo" button for camera access (images only)
- **Floating Button**: Click the + button in the top-right corner

### Managing Files

Once uploaded, you can:

- **View Files**: See all your files in a clean card-based layout
- **Search**: Use the search box to find files by name or type
- **Filter**: Filter files by type, size, or upload date
- **Download**: Click the download button to save files locally
- **Delete**: Remove files you no longer need

### Search & Filter Options

- **File Type**: Images, Videos, Audio, Documents, Archives, Other
- **Size Range**: Small (< 1MB), Medium (1-10MB), Large (> 10MB)
- **Date Range**: Today, This Week, This Month, Any Time
- **Sort Options**: Newest, Oldest, Name A-Z, Size, Type

## Technical Details

### Backend

- **Framework**: Express.js
- **File Handling**: Multer middleware
- **Duplicate Detection**: SHA-256 hashing
- **Storage**: In-memory (resets on server restart)
- **File Size Limit**: 10MB per file

### Frontend

- **Framework**: Vanilla JavaScript
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome
- **Fonts**: Poppins (Google Fonts)
- **Responsive**: Mobile-first design approach

### API Endpoints

- `GET /` - Serve the frontend application
- `GET /api/files` - Retrieve all uploaded files
- `POST /api/upload` - Upload a new file
- `DELETE /api/files/:id` - Delete a file by ID
- `GET /api/files/:id/download` - Download a file by ID

## Project Structure

```
file_system/
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── .gitignore
└── README.md
```

## Development

### Running in Development Mode

```bash
cd backend
npm run dev
```

This will start the server with nodemon for automatic restarts on file changes.

### Building for Production

```bash
cd backend
npm start
```

## Troubleshooting

### Common Issues

**Port Already in Use**
If port 3000 is already in use, you can change it by setting the PORT environment variable:

```bash
PORT=3001 npm start
```

**File Upload Fails**
- Ensure the file size is under 10MB
- Check that the file is not corrupted
- Verify the server is running properly

**Duplicate Detection**
- Duplicate detection is based on file content, not filename
- Files with identical content will be detected as duplicates regardless of name

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using Node.js, Express, and vanilla JavaScript.