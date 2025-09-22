// FileVault - Modern File Manager JavaScript
let uploadedFiles = [];
let isUploading = false;
let currentSection = 'upload';
let searchResultsArray = [];

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressPercentage = document.getElementById('progressPercentage');
const filesList = document.getElementById('filesList');
const fileCount = document.getElementById('fileCount');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const searchBox = document.getElementById('searchBox');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const uploadFab = document.getElementById('uploadFab');
const duplicateModal = document.getElementById('duplicateModal');
const duplicateInfo = document.getElementById('duplicateInfo');
const toastContainer = document.getElementById('toastContainer');

// Search and filter elements
const typeFilter = document.getElementById('typeFilter');
const sortFilter = document.getElementById('sortFilter');
const clearFilters = document.getElementById('clearFilters');
const mainSearchInput = document.getElementById('mainSearchInput');
const mainSearchBtn = document.getElementById('mainSearchBtn');
const advancedTypeFilter = document.getElementById('advancedTypeFilter');
const sizeFilter = document.getElementById('sizeFilter');
const dateFilter = document.getElementById('dateFilter');
const searchResults = document.getElementById('searchResults');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        loadFiles();
        setupEventListeners();
        setupNavigation();
        setupSearchAndFilter();
    }, 100);
});

// Setup event listeners
function setupEventListeners() {
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Drag and drop
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }
    
    // Upload FAB
    if (uploadFab) {
        uploadFab.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }
    
    // Upload buttons in HTML
    const chooseFilesBtn = document.getElementById('chooseFilesBtn');
    const takePhotoBtn = document.getElementById('takePhotoBtn');
    
    if (chooseFilesBtn) {
        chooseFilesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (fileInput) {
                fileInput.accept = '*/*';
                fileInput.click();
            }
        });
    }
    
    if (takePhotoBtn) {
        takePhotoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (fileInput) {
                fileInput.accept = 'image/*';
                fileInput.click();
            }
        });
    }
    
    // Modal buttons
    const closeDuplicateModalBtn = document.getElementById('closeDuplicateModal');
    const cancelDuplicateBtn = document.getElementById('cancelDuplicate');
    const replaceDuplicateBtn = document.getElementById('replaceDuplicate');
    
    if (closeDuplicateModalBtn) {
        closeDuplicateModalBtn.addEventListener('click', closeDuplicateModal);
    }
    
    if (cancelDuplicateBtn) {
        cancelDuplicateBtn.addEventListener('click', closeDuplicateModal);
    }
    
    if (replaceDuplicateBtn) {
        replaceDuplicateBtn.addEventListener('click', replaceDuplicate);
    }
    
    // Prevent default drag behaviors
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
    }
}

// Setup navigation
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
        });
    });
}

// Switch between sections
function switchSection(section) {
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Show target section
    document.getElementById(`${section}Section`).style.display = 'block';
    
    // Update header
    currentSection = section;
    updateHeader(section);
    
    // Load data if needed
    if (section === 'files') {
        loadFiles();
    } else if (section === 'search') {
        showSearchInterface();
    }
}

// Update header based on section
function updateHeader(section) {
    const headers = {
        upload: {
            title: 'Upload Files',
            subtitle: 'Drag and drop your files here to get started'
        },
        files: {
            title: 'My Files',
            subtitle: `You have ${uploadedFiles.length} files stored`
        },
        search: {
            title: 'Search & Filter',
            subtitle: 'Find exactly what you\'re looking for'
        }
    };
    
    const header = headers[section];
    pageTitle.textContent = header.title;
    pageSubtitle.textContent = header.subtitle;
    
    // Show/hide search box
    searchBox.style.display = section === 'files' ? 'flex' : 'none';
}

// Setup search and filter functionality
function setupSearchAndFilter() {
    // Search input
    searchInput.addEventListener('input', debounce(performSearch, 300));
    mainSearchInput.addEventListener('input', debounce(performSearch, 300));
    
    // Search button
    mainSearchBtn.addEventListener('click', performSearch);
    
    // Clear search
    clearSearch.addEventListener('click', clearSearchResults);
    
    // Filters
    typeFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);
    advancedTypeFilter.addEventListener('change', applyFilters);
    sizeFilter.addEventListener('change', applyFilters);
    dateFilter.addEventListener('change', applyFilters);
    
    // Clear filters
    clearFilters.addEventListener('click', clearAllFilters);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Perform search
function performSearch() {
    const query = searchInput.value || mainSearchInput.value;
    
    if (!query.trim()) {
        clearSearchResults();
        return;
    }
    
    searchResultsArray = uploadedFiles.filter(file => {
        const fileName = file.name.toLowerCase();
        const fileType = file.type.toLowerCase();
        const searchQuery = query.toLowerCase();
        
        return fileName.includes(searchQuery) || 
               fileType.includes(searchQuery) ||
               getFileCategory(file.type).toLowerCase().includes(searchQuery);
    });
    
    displaySearchResults(searchResultsArray);
}

// Display search results
function displaySearchResults(results) {
    if (currentSection === 'search') {
        const searchResultsContainer = document.getElementById('searchResults');
        
        if (results.length === 0) {
            searchResultsContainer.innerHTML = `
                <div class="empty-search">
                    <i class="fas fa-search"></i>
                    <h4>No files found</h4>
                    <p>Try adjusting your search terms or filters</p>
                </div>
            `;
        } else {
            searchResultsContainer.innerHTML = `
                <div class="files-grid">
                    ${results.map(file => createFileCard(file)).join('')}
                </div>
            `;
        }
    } else {
        // Update files list with search results
        displayFiles(results);
    }
}

// Clear search results
function clearSearchResults() {
    searchInput.value = '';
    mainSearchInput.value = '';
    searchResultsArray = [];
    
    if (currentSection === 'search') {
        document.getElementById('searchResults').innerHTML = `
            <div class="empty-search">
                <i class="fas fa-search"></i>
                <h4>Start searching to find your files</h4>
                <p>Use the search box above or apply filters to narrow down your results</p>
            </div>
        `;
    } else {
        displayFiles(uploadedFiles);
    }
}

// Apply filters
function applyFilters() {
    let filteredFiles = [...uploadedFiles];
    
    // Type filter
    const typeFilterValue = typeFilter.value || advancedTypeFilter.value;
    if (typeFilterValue) {
        filteredFiles = filteredFiles.filter(file => {
            const category = getFileCategory(file.type);
            return category === typeFilterValue;
        });
    }
    
    // Size filter
    const sizeFilterValue = sizeFilter.value;
    if (sizeFilterValue) {
        filteredFiles = filteredFiles.filter(file => {
            const sizeInMB = file.size / (1024 * 1024);
            switch (sizeFilterValue) {
                case 'small': return sizeInMB < 1;
                case 'medium': return sizeInMB >= 1 && sizeInMB <= 10;
                case 'large': return sizeInMB > 10;
                default: return true;
            }
        });
    }
    
    // Date filter
    const dateFilterValue = dateFilter.value;
    if (dateFilterValue) {
        const now = new Date();
        const fileDate = new Date(file.uploadDate);
        
        filteredFiles = filteredFiles.filter(file => {
            const fileDate = new Date(file.uploadDate);
            const diffTime = now - fileDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            switch (dateFilterValue) {
                case 'today': return diffDays <= 1;
                case 'week': return diffDays <= 7;
                case 'month': return diffDays <= 30;
                default: return true;
            }
        });
    }
    
    // Sort filter
    const sortFilterValue = sortFilter.value;
    if (sortFilterValue) {
        filteredFiles.sort((a, b) => {
            switch (sortFilterValue) {
                case 'newest': return new Date(b.uploadDate) - new Date(a.uploadDate);
                case 'oldest': return new Date(a.uploadDate) - new Date(b.uploadDate);
                case 'name': return a.name.localeCompare(b.name);
                case 'size': return b.size - a.size;
                case 'type': return a.type.localeCompare(b.type);
                default: return 0;
            }
        });
    }
    
    displayFiles(filteredFiles);
}

// Clear all filters
function clearAllFilters() {
    typeFilter.value = '';
    sortFilter.value = 'newest';
    advancedTypeFilter.value = '';
    sizeFilter.value = '';
    dateFilter.value = '';
    displayFiles(uploadedFiles);
}

// Show search interface
function showSearchInterface() {
    // This function can be expanded for search-specific UI updates
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
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
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
        const progress = ((i + 1) / files.length) * 100;
        updateProgress(progress, `Uploading ${file.name}...`);
        
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
    const duplicateDate = new Date(duplicateFile.uploadDate).toLocaleString();
    
    duplicateInfo.innerHTML = `
        <div class="duplicate-file">
            <i class="fas fa-exclamation-triangle" style="color: #f59e0b; margin-right: 1rem;"></i>
            <div>
                <strong>${fileName}</strong> is a duplicate of an existing file.
                <br>
                <small style="color: #718096;">Original file uploaded on: ${duplicateDate}</small>
            </div>
        </div>
    `;
    
    duplicateModal.style.display = 'flex';
    showToast(`Duplicate file detected: ${fileName}`, 'warning');
}

// Close duplicate modal
function closeDuplicateModal() {
    duplicateModal.style.display = 'none';
}

// Replace duplicate file
function replaceDuplicate() {
    // Implementation for replacing duplicate file
    closeDuplicateModal();
    showToast('Duplicate file replacement not implemented yet', 'warning');
}

// Load all files
async function loadFiles() {
    try {
        const response = await fetch('/api/files');
        const files = await response.json();
        
        uploadedFiles = files;
        fileCount.textContent = files.length;
        displayFiles(files);
        
        // Update header subtitle
        if (currentSection === 'files') {
            pageSubtitle.textContent = `You have ${files.length} files stored`;
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
            <div class="loading-state">
                <i class="fas fa-folder-open"></i>
                <p>No files uploaded yet</p>
            </div>
        `;
        return;
    }
    
    filesList.innerHTML = `
        <div class="files-grid">
            ${files.map(file => createFileCard(file)).join('')}
        </div>
    `;
}

// Create file card HTML
function createFileCard(file) {
    const uploadDate = new Date(file.uploadDate).toLocaleString();
    const fileSize = formatFileSize(file.size);
    const fileCategory = getFileCategory(file.type);
    const fileIcon = getFileIcon(file.type);
    
    return `
        <div class="file-card" data-file-id="${file.id}">
            <div class="file-header">
                <div class="file-icon ${fileCategory}">
                    <i class="fas ${fileIcon}"></i>
                </div>
                <div class="file-info">
                    <h4>${escapeHtml(file.name)}</h4>
                    <div class="file-meta">
                        <span><i class="fas fa-weight-hanging"></i> ${fileSize}</span>
                        <span><i class="fas fa-calendar"></i> ${uploadDate}</span>
                        <span><i class="fas fa-tag"></i> ${fileCategory}</span>
                    </div>
                </div>
            </div>
            <div class="file-actions">
                <button class="download-btn" onclick="downloadFile('${file.id}', '${escapeHtml(file.name)}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="delete-btn" onclick="deleteFile('${file.id}', '${escapeHtml(file.name)}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Get file category
function getFileCategory(mimeType) {
    if (!mimeType) return 'other';
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
    
    return 'other';
}

// Get file icon
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
        progressPercentage.textContent = '0%';
    }
}

// Update progress
function updateProgress(percent, text) {
    progressFill.style.width = `${percent}%`;
    progressPercentage.textContent = `${Math.round(percent)}%`;
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