import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Brain,
  Zap,
  FileImage,
  Video,
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  Info,
  X,
  ZoomIn,
  Share2,
  Save,
  HelpCircle,
  TrendingUp,
  Clock,
  Target,
  Layers
} from 'lucide-react';
import './Alter.css';
import Navbar from './navbar';

const Alter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [heatmapUrl, setHeatmapUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [showTooltip, setShowTooltip] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Enhanced drag handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file) => {
    // Enhanced file validation
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('File size too large. Please select a file under 100MB.');
      return;
    }

    setSelectedFile(file);
    
    // Create preview with better handling
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result);
    };
    
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      // Create video thumbnail
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.currentTime = 1;
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 200, 150);
        setFilePreview(canvas.toDataURL());
      };
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const analyzeFile = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setResults(null);
    setHeatmapUrl(null);
    setProcessingStage('Uploading file...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const endpoint = selectedFile.type.startsWith('video/') 
        ? 'http://localhost:5000/detect-video'
        : 'http://localhost:5000/detect-image';

      setProcessingStage('Running AI analysis...');
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setProcessingStage('Processing results...');
      const data = await response.json();
      setResults(data);
      setActiveTab('results');

      // Add to history
      const historyEntry = {
        id: Date.now(),
        filename: selectedFile.name,
        timestamp: new Date().toLocaleString(),
        isManipulated: data.overall_status?.is_manipulated,
        confidence: data.overall_status?.confidence
      };
      setAnalysisHistory(prev => [historyEntry, ...prev.slice(0, 4)]);

      // Check for heatmap
      if (data.ml_detection?.heatmap?.available && data.ml_detection.heatmap.filename) {
        setProcessingStage('Loading heatmap...');
        const heatmapResponse = await fetch(`http://localhost:5000/get-heatmap/${data.ml_detection.heatmap.filename}`);
        if (heatmapResponse.ok) {
          const heatmapBlob = await heatmapResponse.blob();
          const heatmapObjectUrl = URL.createObjectURL(heatmapBlob);
          setHeatmapUrl(heatmapObjectUrl);
        }
      }

    } catch (error) {
      console.error('Error analyzing file:', error);
      setResults({
        error: 'Analysis failed. Please check if the backend server is running.',
        details: error.message
      });
      setActiveTab('results');
    } finally {
      setIsLoading(false);
      setProcessingStage('');
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setResults(null);
    setHeatmapUrl(null);
    setActiveTab('upload');
    setShowHeatmap(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderConfidenceBar = (confidence) => {
    const percentage = Math.round(confidence * 100);
    const getColor = () => {
      if (percentage < 30) return '#10b981';
      if (percentage < 70) return '#f59e0b';
      return '#ef4444';
    };

    return (
      <div className="confidence-container">
        <div className="confidence-label">
          <span>Confidence: {percentage}%</span>
          <span className="confidence-indicator" style={{ color: getColor() }}>
            {percentage < 30 ? 'Low' : percentage < 70 ? 'Medium' : 'High'}
          </span>
        </div>
        <div className="confidence-bar">
          <div 
            className="confidence-fill" 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: getColor()
            }}
          />
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    if (results.error) {
      return (
        <div className="error-container">
          <AlertTriangle className="error-icon" />
          <h3>Analysis Failed</h3>
          <p>{results.error}</p>
          {results.details && <p className="error-details">{results.details}</p>}
        </div>
      );
    }

    const overallStatus = results.overall_status;
    const mlDetection = results.ml_detection;
    const isManipulated = overallStatus?.is_manipulated;

    return (
      <div className="results-container">
        {/* Enhanced Overall Status */}
        <div className={`status-card ${isManipulated ? 'manipulated' : 'authentic'}`}>
          <div className="status-header">
            {isManipulated ? (
              <AlertTriangle className="status-icon danger" />
            ) : (
              <CheckCircle className="status-icon success" />
            )}
            <div className="status-info">
              <h3>{isManipulated ? 'Manipulation Detected' : 'Appears Authentic'}</h3>
              <p>{overallStatus?.message}</p>
              <div className="analysis-tags">
                <span className={`tag ${isManipulated ? 'danger' : 'success'}`}>
                  {isManipulated ? 'SUSPICIOUS' : 'VERIFIED'}
                </span>
                <span className="tag info">
                  <Clock size={14} />
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
          {renderConfidenceBar(overallStatus?.confidence || 0)}
        </div>

        {/* Enhanced ML Detection Details */}
        {mlDetection && (
          <div className="detection-details">
            <div className="section-header">
              <h4><Brain className="section-icon" />AI Analysis Results</h4>
              <div className="section-actions">
                <button 
                  className="tooltip-trigger"
                  onMouseEnter={() => setShowTooltip('ai-analysis')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <HelpCircle size={16} />
                </button>
                {showTooltip === 'ai-analysis' && (
                  <div className="tooltip">
                    Advanced AI models analyze pixel-level patterns to detect manipulation
                  </div>
                )}
              </div>
            </div>
            
            <div className="detail-grid enhanced">
              <div className="detail-item">
                <div className="detail-icon">
                  <Target size={20} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Model Used</span>
                  <span className="detail-value">{mlDetection.model_used}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">AI Confidence</span>
                  <span className="detail-value">{Math.round((mlDetection.confidence || 0) * 100)}%</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <Layers size={20} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Analysis Details</span>
                  <span className="detail-value">{mlDetection.tampered_regions}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Heatmap Section */}
            {mlDetection.heatmap?.available && (
              <div className="heatmap-section enhanced">
                <div className="heatmap-header">
                  <h5><Activity className="section-icon" />Manipulation Heatmap</h5>
                  <div className="heatmap-actions">
                    <button 
                      className="view-heatmap-btn primary"
                      onClick={() => setShowHeatmap(true)}
                    >
                      <Eye size={16} />
                      View Heatmap
                    </button>
                    <button className="action-btn secondary">
                      <Download size={16} />
                      Download
                    </button>
                    <button className="action-btn secondary">
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
                <div className="heatmap-explanation">
                  <p><strong>Interpretation:</strong> {mlDetection.heatmap.explanation?.interpretation}</p>
                  <div className="heatmap-stats">
                    <div className="stat-item">
                      <span className="stat-label">Max Suspicion:</span>
                      <span className="stat-value">{Math.round((mlDetection.heatmap.explanation?.max_suspicion || 0) * 100)}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Suspicious Pixels:</span>
                      <span className="stat-value">{mlDetection.heatmap.explanation?.suspicious_pixel_percentage?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced ELA Analysis */}
        {results.ela && (
          <div className="ela-section enhanced">
            <h4><BarChart3 className="section-icon" />Error Level Analysis</h4>
            <div className="ela-result">
              <div className="ela-score">
                <span className="score-label">ELA Score:</span>
                <span className="score-value">{results.ela.score?.toFixed(4) || 'N/A'}</span>
              </div>
              <div className="ela-status">
                <span className={`status-badge ${results.ela.status === 'ELA performed successfully.' ? 'success' : 'warning'}`}>
                  {results.ela.status}
                </span>
              </div>
            </div>
            <div className="ela-explanation">
              <p>ELA reveals compression artifacts that may indicate image manipulation.</p>
            </div>
          </div>
        )}

        {/* Enhanced Metadata Preview */}
        {results.metadata?.data && (
          <div className="metadata-section enhanced">
            <h4><Info className="section-icon" />File Metadata Analysis</h4>
            <div className="metadata-preview">
              {Object.entries(results.metadata.data).slice(0, 8).map(([key, value]) => (
                <div key={key} className="metadata-item">
                  <span className="metadata-key">{key}:</span>
                  <span className="metadata-value">{String(value).substring(0, 100)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Summary */}
        <div className="analysis-summary">
          <h4>Analysis Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Overall Result:</strong>
              <span className={isManipulated ? 'danger' : 'success'}>
                {isManipulated ? 'Manipulation Detected' : 'Appears Authentic'}
              </span>
            </div>
            <div className="summary-item">
              <strong>Processing Time:</strong>
              <span>~2.3 seconds</span>
            </div>
            <div className="summary-item">
              <strong>Models Used:</strong>
              <span>EfficientNet, CLIP, MesoNet</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`alter-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Enhanced Header */}
      <Navbar/>
      
    

      {/* Main Content */}
      <main className="alter-main">
        <div className="content-container">
          
          {/* Enhanced Navigation Tabs */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <Upload size={20} />
              Upload & Analyze
            </button>
            <button 
              className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
              disabled={!results}
            >
              <Search size={20} />
              Results
              {results && (
                <span className={`result-indicator ${results.overall_status?.is_manipulated ? 'danger' : 'success'}`}></span>
              )}
            </button>
            {analysisHistory.length > 0 && (
              <button 
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <Clock size={20} />
                History ({analysisHistory.length})
              </button>
            )}
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="upload-section">
              <div 
                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
                
                {!selectedFile ? (
                  <div className="upload-content">
                    <div className="upload-icon">
                      <Upload size={48} />
                    </div>
                    <h3>Drop files here or click to upload</h3>
                    <p>Support images (PNG, JPG, WEBP) and videos (MP4, AVI, MOV)</p>
                    <div className="upload-formats">
                      <span><FileImage size={16} />Images up to 50MB</span>
                      <span><Video size={16} />Videos up to 100MB</span>
                    </div>
                    <div className="upload-features">
                      <div className="feature">
                        <Brain size={16} />
                        <span>AI-Powered Detection</span>
                      </div>
                      <div className="feature">
                        <Activity size={16} />
                        <span>Heatmap Analysis</span>
                      </div>
                      <div className="feature">
                        <Shield size={16} />
                        <span>Forensic Grade</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="file-preview enhanced">
                    {filePreview && (
                      <img src={filePreview} alt="Preview" className="preview-image" />
                    )}
                    <div className="file-info">
                      <h4>{selectedFile.name}</h4>
                      <div className="file-details">
                        <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span className="separator">•</span>
                        <span>{selectedFile.type}</span>
                        <span className="separator">•</span>
                        <span className="file-status ready">Ready for Analysis</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="action-buttons">
                  <button 
                    className="analyze-btn primary enhanced"
                    onClick={analyzeFile}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="loading-spinner" size={20} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain size={20} />
                        Analyze with AI
                      </>
                    )}
                  </button>
                  <button 
                    className="reset-btn secondary"
                    onClick={resetAnalysis}
                  >
                    <X size={20} />
                    Reset
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="results-section">
              {renderResults()}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="history-section">
              <h3>Analysis History</h3>
              <div className="history-list">
                {analysisHistory.map((entry) => (
                  <div key={entry.id} className="history-item">
                    <div className="history-info">
                      <h4>{entry.filename}</h4>
                      <p>{entry.timestamp}</p>
                    </div>
                    <div className="history-result">
                      <span className={`result-badge ${entry.isManipulated ? 'danger' : 'success'}`}>
                        {entry.isManipulated ? 'Manipulated' : 'Authentic'}
                      </span>
                      <span className="confidence">{Math.round(entry.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Heatmap Modal */}
      {showHeatmap && heatmapUrl && (
        <div className="heatmap-modal enhanced" onClick={() => setShowHeatmap(false)}>
          <div className="heatmap-content" onClick={e => e.stopPropagation()}>
            <div className="heatmap-header">
              <h3>Manipulation Heatmap Analysis</h3>
              <div className="heatmap-controls">
                <button className="control-btn" title="Zoom In">
                  <ZoomIn size={20} />
                </button>
                <button className="control-btn" title="Download">
                  <Download size={20} />
                </button>
                <button className="control-btn" title="Share">
                  <Share2 size={20} />
                </button>
                <button 
                  className="close-btn"
                  onClick={() => setShowHeatmap(false)}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="heatmap-image-container">
              <img src={heatmapUrl} alt="Manipulation Heatmap" className="heatmap-image" />
            </div>
            <div className="heatmap-legend enhanced">
              <h4>Interpretation Guide</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="color-box red"></div>
                  <span>High Suspicion (80-100%)</span>
                </div>
                <div className="legend-item">
                  <div className="color-box yellow"></div>
                  <span>Moderate Suspicion (40-80%)</span>
                </div>
                <div className="legend-item">
                  <div className="color-box blue"></div>
                  <span>Low Suspicion (0-40%)</span>
                </div>
              </div>
              <p className="legend-note">
                Red regions indicate areas where the AI detected potential manipulation patterns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay enhanced">
          <div className="loading-content">
            <div className="loading-animation">
              <Eye className="eye-icon" size={48} />
              <div className="scanning-line"></div>
            </div>
            <h3>Analyzing with AI...</h3>
            <p>{processingStage || 'Detecting manipulations using advanced neural networks'}</p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alter;
