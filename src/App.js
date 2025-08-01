import React, { useState, useRef, useCallback } from 'react';
import { Upload, Search, Globe, TrendingUp, RotateCcw, ExternalLink } from 'lucide-react';
import './Appp.css'
import { Link } from 'react-router-dom';
import Navbar from './pages/navbar';
function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          domain: 'unsplash.com',
          url: 'https://unsplash.com/photos/sample-image-123',
          thumbnail: uploadedImage,
          visits: '2.5M',
          rank: '#1,250',
          confidence: 95
        },
        {
          id: 2,
          domain: 'pinterest.com',
          url: 'https://pinterest.com/pin/sample-pin-456',
          thumbnail: uploadedImage,
          visits: '1.8M',
          rank: '#800',
          confidence: 89
        },
        {
          id: 3,
          domain: 'reddit.com',
          url: 'https://reddit.com/r/pics/sample-post-789',
          thumbnail: uploadedImage,
          visits: '1.2M',
          rank: '#15',
          confidence: 82
        },
        {
          id: 4,
          domain: 'flickr.com',
          url: 'https://flickr.com/photos/user/sample-photo-101',
          thumbnail: uploadedImage,
          visits: '850K',
          rank: '#3,200',
          confidence: 78
        }
      ];
      
      setResults(mockResults);
      setIsAnalyzing(false);
    }, 3000);
  };

  const resetApp = () => {
    setUploadedImage(null);
    setResults([]);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (

    <div className="imagelens-container">
       <Navbar/>
      
      <div className="imagelens-inner">
        {/* Header */}
        <div className="imagelens-header">
          <h1 className="imagelens-title">
            God's Eye
          </h1>
          <p className="imagelens-subtitle">
            Discover where your images appear across the web
          </p>
        </div>

        {/* Upload Section */}
        {!uploadedImage && (
          <div className="upload-section">
            <div
              className={`upload-area ${dragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="upload-text">
                Upload Your Image
              </h3>
              <p className="upload-subtext">
                Drag and drop an image here, or click to select
              </p>
              <p className="upload-hint">
                Supports JPG, PNG, GIF up to 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Preview Section */}
        {uploadedImage && !isAnalyzing && results.length === 0 && (
          <div className="preview-section">
            <img
              src={uploadedImage}
              alt="Uploaded preview"
              className="preview-image"
            />
            <button
              onClick={analyzeImage}
              className="analyze-button"
            >
              <Search className="w-5 h-5" />
              Analyze Image
            </button>
          </div>
        )}

        {/* Loading Section */}
        {isAnalyzing && (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <h3 className="loading-title">
              Analyzing Your Image...
            </h3>
            <p className="loading-text">
              Searching across millions of web pages
            </p>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div>
            <div className="results-header">
              <h2 className="results-title">
                Search Results
              </h2>
              <p className="results-count">
                Found {results.length} matching images across the web
              </p>
            </div>

            <div className="results-grid">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className="result-card"
                  onClick={() => window.open(result.url, '_blank')}
                >
                  <div className="result-image-container">
                    <img
                      src={result.thumbnail}
                      alt={`Result from ${result.domain}`}
                      className="result-image"
                    />
                    <div className="confidence-badge">
                      {result.confidence}% match
                    </div>
                  </div>
                  
                  <div className="result-content">
                    <div className="result-header">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <h3 className="result-domain">
                        {result.domain}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    <p className="result-url">
                      {result.url}
                    </p>
                    
                    <div className="traffic-info">
                      <div className="traffic-visits">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          {result.visits} visits/month
                        </span>
                      </div>
                      <div className="traffic-rank">
                        Rank {result.rank}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Button */}
        {(uploadedImage || results.length > 0) && (
          <button
            onClick={resetApp}
            className="reset-button"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        )}
      </div>

    
    </div>
  );
}

export default App;