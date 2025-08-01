import React, { useState } from 'react';
import { 
  Shield, Eye, Search, Zap, 
  Upload, Camera, FileText, 
  Brain, Cpu, Activity,
  Play, Pause, CheckCircle,
  AlertTriangle, Download,
  Grid, BarChart3, Globe,
  ScanLine, Target, Lock
} from 'lucide-react';
import './howitworks.css';
import Navbar from './navbar';

const HowItWorks = () => {
  const [activeFeature, setActiveFeature] = useState('alter');
  const [isPlaying, setIsPlaying] = useState(false);

  const features = {
    alter: {
      title: "Image/Video Manipulation Detection",
      description: "Advanced AI-powered detection of deepfakes and manipulated content using multiple analysis techniques",
      icon: AlertTriangle,
      color: "red",
      steps: [
        {
          icon: Upload,
          title: "1. Upload Content",
          description: "Upload images or videos (up to 16MB) in formats like JPG, PNG, MP4, AVI",
          details: "Supports batch processing and real-time analysis"
        },
        {
          icon: Brain,
          title: "2. AI Analysis Pipeline",
          description: "Multi-layer analysis using ELA, metadata extraction, and deepfake detection",
          details: "Combines Error Level Analysis with advanced neural networks"
        },
        {
          icon: ScanLine,
          title: "3. Frame-by-Frame Inspection",
          description: "For videos: intelligent frame sampling and individual frame analysis",
          details: "Detects manipulation across temporal sequences"
        },
        {
          icon: BarChart3,
          title: "4. Confidence Scoring",
          description: "Generate detailed reports with confidence scores and manipulation probability",
          details: "Provides tampered region identification and forensic evidence"
        }
      ]
    },
    tracking: {
      title: "Multi-Camera Object Tracking",
      description: "Real-time object detection and tracking across multiple camera feeds with Socket.IO integration",
      icon: Target,
      color: "blue",
      steps: [
        {
          icon: Camera,
          title: "1. Camera Setup",
          description: "Connect multiple IP cameras or webcams for comprehensive surveillance",
          details: "Supports RTSP streams and USB cameras simultaneously"
        },
        {
          icon: Upload,
          title: "2. Reference Upload",
          description: "Upload reference images of objects/people you want to track",
          details: "AI learns from reference images for accurate detection"
        },
        {
          icon: Activity,
          title: "3. Real-Time Processing",
          description: "Live object detection with Socket.IO for instant notifications",
          details: "Sub-second latency with continuous tracking across feeds"
        },
        {
          icon: Globe,
          title: "4. Multi-Feed Monitoring",
          description: "Unified dashboard showing detections across all connected cameras",
          details: "Track objects moving between camera zones"
        }
      ]
    },
    product: {
      title: "Zero-Shot Logo Detection",
      description: "Advanced computer vision for detecting brand logos in videos without prior training",
      icon: Search,
      color: "purple",
      steps: [
        {
          icon: Upload,
          title: "1. Upload Assets",
          description: "Upload your logo image and target video for analysis",
          details: "Supports high-resolution logos and long-duration videos"
        },
        {
          icon: Eye,
          title: "2. Visual Feature Extraction",
          description: "AI extracts distinctive visual features from your logo",
          details: "Uses advanced computer vision algorithms for pattern recognition"
        },
        {
          icon: ScanLine,
          title: "3. Video Scanning",
          description: "Frame-by-frame analysis to locate logo appearances",
          details: "Intelligent sampling optimizes processing speed"
        },
        {
          icon: Grid,
          title: "4. Results Gallery",
          description: "Interactive gallery with similarity scores and timestamps",
          details: "Filter, sort, and download matching frames with confidence metrics"
        }
      ]
    },
    blur: {
      title: "AI Privacy Protection",
      description: "Enterprise-grade anonymization using multiple AI models for comprehensive privacy protection",
      icon: Shield,
      color: "green",
      steps: [
        {
          icon: Upload,
          title: "1. Image Upload",
          description: "Upload images requiring privacy protection (up to 16MB)",
          details: "Supports JPG, PNG, WEBP with automatic format optimization"
        },
        {
          icon: Brain,
          title: "2. Multi-Modal AI Detection",
          description: "Simultaneous detection of faces, license plates, and sensitive text",
          details: "Uses Dlib CNN, YOLO, Tesseract, and EasyOCR models"
        },
        {
          icon: Lock,
          title: "3. Customizable Protection",
          description: "Choose protection method: Gaussian blur, pixelation, or masking",
          details: "Adjustable intensity levels for different privacy requirements"
        },
        {
          icon: Download,
          title: "4. Protected Output",
          description: "Download anonymized images with detailed processing reports",
          details: "Maintains image quality while ensuring complete privacy"
        }
      ]
    }
  };

  const handleFeatureChange = (feature) => {
    setActiveFeature(feature);
    setIsPlaying(false);
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  const currentFeature = features[activeFeature];

  return (
    <div className="howitworks-container">
      <Navbar />
      
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="howitworks-content">
        {/* Header Section */}
        <div className="hero-section">
          <h1 className="main-title">How God's Eye Works</h1>
          <p className="main-subtitle">
            Discover the power of advanced AI across four cutting-edge features designed for modern security and content analysis
          </p>
        </div>

        {/* Feature Navigation */}
        <div className="feature-tabs">
          {Object.entries(features).map(([key, feature]) => {
            const IconComponent = feature.icon;
            return (
              <button
                key={key}
                className={`feature-tab ${activeFeature === key ? 'active' : ''} ${feature.color}`}
                onClick={() => handleFeatureChange(key)}
              >
                <div className="tab-icon">
                  <IconComponent size={24} />
                </div>
                <div className="tab-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Feature Display */}
        <div className="feature-showcase">
          <div className="showcase-header">
            <div className="feature-info">
              <div className={`feature-icon-large ${currentFeature.color}`}>
                <currentFeature.icon size={48} />
              </div>
              <div>
                <h2>{currentFeature.title}</h2>
                <p>{currentFeature.description}</p>
              </div>
            </div>
            
            <button 
              className={`animation-control ${isPlaying ? 'paused' : 'playing'}`}
              
            >
              
            User Guide
            </button>
          </div>

          {/* Process Steps */}
          <div className={`process-flow ${isPlaying ? 'animated' : ''}`}>
            {currentFeature.steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="process-step" style={{ animationDelay: `${index * 0.5}s` }}>
                  <div className="step-connector">
                    {index < currentFeature.steps.length - 1 && (
                      <div className="connector-line"></div>
                    )}
                  </div>
                  
                  <div className="step-card">
                    <div className={`step-icon ${currentFeature.color}`}>
                      <StepIcon size={32} />
                      <div className="icon-pulse"></div>
                    </div>
                    
                    <div className="step-content">
                      <h3>{step.title}</h3>
                      <p className="step-description">{step.description}</p>
                      <p className="step-details">{step.details}</p>
                    </div>
                    
                    <div className="step-status">
                      <CheckCircle className="status-icon" size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="tech-specs">
          <h3>Technical Capabilities</h3>
          <div className="specs-grid">
            <div className="spec-item">
              <Cpu className="spec-icon" />
              <div>
                <h4>AI Models</h4>
                <p>YOLO, Dlib CNN, Tesseract, EasyOCR</p>
              </div>
            </div>
            <div className="spec-item">
              <Activity className="spec-icon" />
              <div>
                <h4>Real-time Processing</h4>
                <p>Sub-second latency with WebSocket support</p>
              </div>
            </div>
            <div className="spec-item">
              <Globe className="spec-icon" />
              <div>
                <h4>Multi-Platform</h4>
                <p>Cross-platform compatibility with REST APIs</p>
              </div>
            </div>
            <div className="spec-item">
              <Lock className="spec-icon" />
              <div>
                <h4>Enterprise Security</h4>
                <p>End-to-end encryption and privacy protection</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="component-footer">
        <p>&copy; {new Date().getFullYear()} God's Eye. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HowItWorks;
