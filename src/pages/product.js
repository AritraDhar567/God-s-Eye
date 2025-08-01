import React, { useState } from 'react';
import './product.css';
import Navbar from './navbar'; // Assuming Navbar is in the same directory

const Zeroshot = () => {
  const [logoFile, setLogoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [logoPath, setLogoPath] = useState('');
  const [videoPath, setVideoPath] = useState('');
  const [results, setResults] = useState([]); // This will now store Base64 image data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ logo: '', video: '' });
  const [viewMode, setViewMode] = useState('grid'); // grid, list, masonry
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showHighSimilarityOnly, setShowHighSimilarityOnly] = useState(false);

  // Backend URL - adjust this based on your setup
  const API_BASE_URL = 'http://127.0.0.1:5000';

  const handleLogoUpload = async () => {
    if (!logoFile) {
      setError('Please select a logo file first');
      return;
    }

    setError('');
    setUploadStatus({ ...uploadStatus, logo: 'Uploading...' });

    try {
      const formData = new FormData();
      formData.append('file', logoFile);
      
      const res = await fetch(`${API_BASE_URL}/upload_logo`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setLogoPath(data.logo_path);
      setUploadStatus({ ...uploadStatus, logo: 'Uploaded successfully!' });
    } catch (error) {
      console.error('Logo upload error:', error);
      setError(`Logo upload failed: ${error.message}`);
      setUploadStatus({ ...uploadStatus, logo: 'Upload failed' });
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) {
      setError('Please select a video file first');
      return;
    }

    setError('');
    setUploadStatus({ ...uploadStatus, video: 'Uploading...' });

    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      
      const res = await fetch(`${API_BASE_URL}/upload_video`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setVideoPath(data.video_path);
      setUploadStatus({ ...uploadStatus, video: 'Uploaded successfully!' });
    } catch (error) {
      console.error('Video upload error:', error);
      setError(`Video upload failed: ${error.message}`);
      setUploadStatus({ ...uploadStatus, video: 'Upload failed' });
    }
  };

  const handleSearch = async () => {
    if (!logoPath || !videoPath) {
      setError('Please upload both logo and video first');
      return;
    }

    setError('');
    setLoading(true);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append('logo_path', logoPath);
      formData.append('video_path', videoPath);

      const res = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Backend now sends Base64 encoded images directly
      setResults(data.matches || []); 
      
      if (data.matches && data.matches.length === 0) {
        setError('No matching frames found. Try adjusting the similarity threshold or check if the logo appears in the video.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(`Detection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setLogoFile(null);
    setVideoFile(null);
    setLogoPath('');
    setVideoPath('');
    setResults([]);
    setError('');
    setUploadStatus({ logo: '', video: '' });
    setShowHighSimilarityOnly(false);
  };

  const getSimilarityBadgeClass = (similarity) => {
    const percentage = similarity * 100;
    if (percentage >= 80) return 'high';
    if (percentage >= 60) return 'medium';
    return 'low';
  };

  const formatTimestamp = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateStats = () => {
    const filteredAndSortedResults = getFilteredAndSortedResults(); // Use sorted results for stats
    if (!filteredAndSortedResults.length) return { total: 0, avgSimilarity: 0, highConfidence: 0 };
    
    const avgSimilarity = filteredAndSortedResults.reduce((sum, result) => sum + result.similarity, 0) / filteredAndSortedResults.length;
    const highConfidence = filteredAndSortedResults.filter(result => result.similarity >= 0.8).length;
    
    return {
      total: filteredAndSortedResults.length,
      avgSimilarity: (avgSimilarity * 100).toFixed(1),
      highConfidence
    };
  };

  const getFilteredAndSortedResults = () => {
    let currentResults = results;
    if (showHighSimilarityOnly) {
      currentResults = results.filter(result => result.similarity >= 0.65);
    }
    // Sort in decreasing order of similarity
    return [...currentResults].sort((a, b) => b.similarity - a.similarity);
  };

  const stats = calculateStats();
  const filteredAndSortedResults = getFilteredAndSortedResults();

  return (
    <div className="about-container">
      {/* Navbar component */}
      <Navbar /> 
      <div className="Product-content">
        <h2>God's Eye – Zero Shot Logo Detection</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="upload-section">
          <div className="upload-item">
            <label htmlFor="logo-input">Upload Logo Image:</label>
            <input 
              id="logo-input"
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                setLogoFile(e.target.files[0]);
                setUploadStatus({ ...uploadStatus, logo: '' });
                setError(''); // Clear error on new file selection
              }} 
            />
            <button 
              onClick={handleLogoUpload} 
              disabled={!logoFile || uploadStatus.logo === 'Uploading...'}
            >
              {uploadStatus.logo === 'Uploading...' ? 'Uploading...' : 'Upload Logo'}
            </button>
            {uploadStatus.logo && (
              <span className={`status ${uploadStatus.logo.includes('success') ? 'success' : 'error'}`}>
                {uploadStatus.logo}
              </span>
            )}
           
          </div>

          <div className="upload-item">
            <label htmlFor="video-input">Upload Video:</label>
            <input 
              id="video-input"
              type="file" 
              accept="video/*" 
              onChange={(e) => {
                setVideoFile(e.target.files[0]);
                setUploadStatus({ ...uploadStatus, video: '' });
                setError(''); // Clear error on new file selection
              }} 
            />
            <button 
              onClick={handleVideoUpload} 
              disabled={!videoFile || uploadStatus.video === 'Uploading...'}
            >
              {uploadStatus.video === 'Uploading...' ? 'Uploading...' : 'Upload Video'}
            </button>
            {uploadStatus.video && (
              <span className={`status ${uploadStatus.video.includes('success') ? 'success' : 'error'}`}>
                {uploadStatus.video}
              </span>
            )}
             
          </div>

          <div className="action-buttons">
            <button 
              onClick={handleSearch} 
              disabled={!logoPath || !videoPath || loading}
              className="search-button"
            >
              {loading ? 'Processing...' : 'Start Detection'}
            </button>
            <button 
              onClick={resetAll}
              className="reset-button"
            >
              Reset All
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-message">
            <p>🔍 Processing video and comparing with logo...</p>
            <p>This may take a few minutes depending on video length and your system's performance.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="frame-gallery">
            <h3>✅ Matches Found: {filteredAndSortedResults.length}</h3>
            
            {/* Gallery Controls */}
            <div className="gallery-controls">
              <div className="gallery-stats">
                <div className="stat-item">
                  <span className="stat-number">{stats.total}</span>
                  <span className="stat-label">Filtered Matches</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.avgSimilarity}%</span>
                  <span className="stat-label">Avg Similarity</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.highConfidence}</span>
                  <span className="stat-label">High Confidence (&ge;80%)</span>
                </div>
              </div>
              
              <div className="view-controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginRight: '1rem' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--gray-300)',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={showHighSimilarityOnly}
                      onChange={(e) => setShowHighSimilarityOnly(e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: 'var(--purple-500)'
                      }}
                    />
                    Show High Similarity Only (65%+)
                  </label>
                </div>
                
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  title="Grid View"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  title="List View"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="6" width="18" height="2" rx="1"/>
                    <rect x="3" y="12" width="18" height="2" rx="1"/>
                    <rect x="3" y="18" width="18" height="2" rx="1"/>
                  </svg>
                </button>
                <button 
                  className={`view-btn ${viewMode === 'masonry' ? 'active' : ''}`}
                  onClick={() => setViewMode('masonry')}
                  aria-label="Masonry view"
                  title="Masonry View"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="9" rx="1"/>
                    <rect x="14" y="3" width="7" height="5" rx="1"/>
                    <rect x="3" y="16" width="7" height="5" rx="1"/>
                    <rect x="14" y="12" width="7" height="9" rx="1"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className={`gallery-grid ${viewMode}-view`}>
              {filteredAndSortedResults.map((match, index) => (
                <div className="frame-item" key={index} tabIndex="0">
                  <div className="frame-image-container">
                    {/* The src now uses the Base64 data directly */}
                    <img
                      src={`data:image/jpeg;base64,${match.frame_data}`} 
                      alt={`Frame at ${match.timestamp_sec}s`}
                      className="frame-image"
                      onClick={() => setFullscreenImage(`data:image/jpeg;base64,${match.frame_data}`)}
                      onError={(e) => {
                        e.target.style.display = 'none'; // Hide the broken image
                        e.target.nextSibling.style.display = 'block'; // Show "Image not available"
                      }}
                    />
                    <div className="image-unavailable-placeholder" style={{ display: 'none', padding: '20px', textAlign: 'center', backgroundColor: '#f5f5f5', color: '#888', borderRadius: '8px', border: '1px dashed #ccc' }}>
                      Image not available
                    </div>
                    
                    {/* Similarity Badge */}
                    <div className={`similarity-badge ${getSimilarityBadgeClass(match.similarity)}`}>
                      {(match.similarity * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="frame-info">
                    <div className="frame-details">
                      <div className="timestamp">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        {formatTimestamp(match.timestamp_sec)}
                      </div>
                      <div className="confidence-score">
                        <span>Confidence</span>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill" 
                            style={{ width: `${match.similarity * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="frame-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => setFullscreenImage(`data:image/jpeg;base64,${match.frame_data}`)}
                        title="View Fullscreen"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        </svg>
                        View Full
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => {
                          // Create a blob from the Base64 data and download it
                          const byteCharacters = atob(match.frame_data);
                          const byteNumbers = new Array(byteCharacters.length);
                          for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                          }
                          const byteArray = new Uint8Array(byteNumbers);
                          const blob = new Blob([byteArray], { type: 'image/jpeg' });
                          const link = document.createElement('a');
                          link.href = URL.createObjectURL(blob);
                          link.download = `frame_${match.timestamp_sec}s.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(link.href); // Clean up the object URL
                        }}
                        title="Download Image"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && filteredAndSortedResults.length === 0 && results.length > 0 && showHighSimilarityOnly && (
          <div className="no-results">
            <p>🔍 No high similarity matches found (60%+ threshold).</p>
            <p>Try unchecking the filter to see all matches or adjust your search criteria.</p>
          </div>
        )}

        {!loading && results.length === 0 && logoPath && videoPath && !error && (
          <div className="no-results">
            <p>🔍 No matching frames found.</p>
            <p>The logo might not appear in the video, or the similarity threshold might be too high.</p>
          </div>
        )}

        {/* Fullscreen Modal */}
        {fullscreenImage && (
          <div className="fullscreen-modal" onClick={() => setFullscreenImage(null)}>
            <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="close-btn" 
                onClick={() => setFullscreenImage(null)}
                aria-label="Close fullscreen"
                title="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <img 
                src={fullscreenImage} 
                alt="Fullscreen view" 
                className="fullscreen-image"
                style={{
                  maxWidth: '80vw',
                  maxHeight: '80vh',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        )}
      </div>

      <footer className="component-footer">
        <p>&copy; {new Date().getFullYear()} God's Eye. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Zeroshot;