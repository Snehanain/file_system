// Global variables
let uploadedFiles = [];
let isUploading = false;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const filesList = document.getElementById('filesList');
const duplicatesSection = document.getElementById('duplicatesSection');
const duplicateInfo = document.getElementById('duplicateInfo');
const toastContainer = document.getElementById('toastContainer');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadFiles();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
}

// Prevent default drag behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Handle drag over
function handleDragOver(e) {
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
    uploadArea.classList.remove('dragover');
}

// Handle file drop
function handleDrop(e) {
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
}

// Handle file input change
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// Handle files (from input or drop)
function handleFiles(files) {
    if (isUploading) {
        showToast('Please wait for current upload to complete', 'warning');
        return;
    }
    
    if (files.length === 0) return;
    
    // Convert FileList to Array
    const fileArray = Array.from(files);
    
    // Upload files one by one
    uploadFilesSequentially(fileArray);
}

// Upload files sequentially
async function uploadFilesSequentially(files) {
    isUploading = true;
    showProgress(true);
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        updateProgress((i / files.length) * 100, `Uploading ${file.name}...`);
        
        try {
            await uploadFile(file);
        } catch (error) {
            console.error('Upload error:', error);
            showToast(`Failed to upload ${file.name}: ${error.message}`, 'error');
        }
    }
    
    updateProgress(100, 'Upload complete!');
    setTimeout(() => {
        showProgress(false);
        loadFiles();
        isUploading = false;
    }, 1000);
}

// Upload single file
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast(`Successfully uploaded ${file.name}`, 'success');
            return result;
        } else if (response.status === 409) {
            // Duplicate file detected
            showDuplicateWarning(file.name, result.duplicateFile);
            throw new Error('Duplicate file detected');
        } else {
            throw new Error(result.error || 'Upload failed');
        }
    } catch (error) {
        if (error.message !== 'Duplicate file detected') {
            throw error;
        }
    }
}

// Show duplicate warning
function showDuplicateWarning(fileName, duplicateFile) {
    duplicatesSection.style.display = 'block';
    
    const duplicateDate = new Date(duplicateFile.uploadDate).toLocaleString();
    
    duplicateInfo.innerHTML = `
        <div class="duplicate-file">
            <i class="fas fa-exclamation-triangle duplicate-icon"></i>
            <div>
                <strong>${fileName}</strong> is a duplicate of an existing file.
                <br>
                <small>Original file uploaded on: ${duplicateDate}</small>
            </div>
        </div>
    `;
    
    showToast(`Duplicate file detected: ${fileName}`, 'warning');
}

// Load all files
async function loadFiles() {
    try {
        const response = await fetch('/api/files');
        const files = await response.json();
        
        uploadedFiles = files;
        displayFiles(files);
        
        // Hide duplicates section if no duplicates
        if (files.length === 0) {
            duplicatesSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading files:', error);
        showToast('Failed to load files', 'error');
    }
}

// Display files in the UI
function displayFiles(files) {
    if (files.length === 0) {
        filesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>No files uploaded yet</h3>
                <p>Upload your first file to get started</p>
            </div>
        `;
        return;
    }
    
    filesList.innerHTML = files.map(file => createFileItem(file)).join('');
}

// Create file item HTML
function createFileItem(file) {
    const uploadDate = new Date(file.uploadDate).toLocaleString();
    const fileSize = formatFileSize(file.size);
    const fileIcon = getFileIcon(file.type);
    
    return `
        <div class="file-item" data-file-id="${file.id}">
            <i class="fas ${fileIcon} file-icon"></i>
            <div class="file-info">
                <div class="file-name">${escapeHtml(file.name)}</div>
                <div class="file-details">
                    <span><i class="fas fa-weight-hanging"></i> ${fileSize}</span>
                    <span><i class="fas fa-calendar"></i> ${uploadDate}</span>
                    <span><i class="fas fa-tag"></i> ${file.type || 'Unknown'}</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="action-btn download-btn" onclick="downloadFile('${file.id}', '${escapeHtml(file.name)}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="action-btn delete-btn" onclick="deleteFile('${file.id}', '${escapeHtml(file.name)}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Download file
async function downloadFile(fileId, fileName) {
    try {
        const response = await fetch(`/api/files/${fileId}/download`);
        
        if (!response.ok) {
            throw new Error('Download failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showToast(`Downloaded ${fileName}`, 'success');
    } catch (error) {
        console.error('Download error:', error);
        showToast(`Failed to download ${fileName}`, 'error');
    }
}

// Delete file
async function deleteFile(fileId, fileName) {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/files/${fileId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Delete failed');
        }
        
        showToast(`Deleted ${fileName}`, 'success');
        loadFiles();
    } catch (error) {
        console.error('Delete error:', error);
        showToast(`Failed to delete ${fileName}`, 'error');
    }
}

// Show/hide progress section
function showProgress(show) {
    progressSection.style.display = show ? 'block' : 'none';
    if (!show) {
        progressFill.style.width = '0%';
    }
}

// Update progress
function updateProgress(percent, text) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = text;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${getToastIcon(type)}"></i>
        ${message}
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

// Get toast icon based on type
function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Get file icon based on MIME type
function getFileIcon(mimeType) {
    if (!mimeType) return 'fa-file';
    
    if (mimeType.startsWith('image/')) return 'fa-file-image';
    if (mimeType.startsWith('video/')) return 'fa-file-video';
    if (mimeType.startsWith('audio/')) return 'fa-file-audio';
    if (mimeType.includes('pdf')) return 'fa-file-pdf';
    if (mimeType.includes('word')) return 'fa-file-word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fa-file-excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fa-file-powerpoint';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'fa-file-archive';
    if (mimeType.includes('text/')) return 'fa-file-alt';
    if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('json')) return 'fa-file-code';
    
    return 'fa-file';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
