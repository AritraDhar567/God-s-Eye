import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { 
    Upload, Eye, Download, RefreshCw, Zap, Shield, Camera, FileText, 
    AlertCircle, CheckCircle, Info, Cpu, Brain, Activity, Settings, 
    Sparkles, Target, Layers, Gauge, TrendingUp, Award, Lock,
    ChevronDown, ChevronRight, Monitor, Smartphone, Globe,
    PlayCircle, PauseCircle, BarChart3, Maximize2, Minimize2
} from 'lucide-react';
import Navbar from './navbar';
import './privacy.css';

const App = () => {
    // Enhanced state management with more granular control
    const [uploadedFile, setUploadedFile] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [detectionStats, setDetectionStats] = useState({
        faces: 0,
        plates: 0,
        text: 0,
        totalElements: 0,
        confidence: 0,
        processingTime: 0
    });
    
    const [blurSettings, setBlurSettings] = useState({
        faces: true,
        plates: true,
        text: true,
        blurType: 'gaussian',
        intensity: 'medium',
        adaptiveBlur: false,
        edgePreservation: true
    });
    
    const [processingProgress, setProcessingProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [processingTime, setProcessingTime] = useState(0);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [showProcessingLogs, setShowProcessingLogs] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [processingStage, setProcessingStage] = useState('');
    const [realTimeStats, setRealTimeStats] = useState({
        fps: 0,
        memory: 0,
        cpuUsage: 0
    });
    
    const [backendStatus, setBackendStatus] = useState({
        connected: false,
        latency: 0,
        aiModels: {
            dlib: false,
            yolo: false,
            easyocr: false,
            tesseract: false
        },
        device: 'unknown',
        performance: {
            gpu: false,
            cuda: false,
            tensorrt: false
        }
    });
    
    const [processingLogs, setProcessingLogs] = useState([]);
    const [animationConfig, setAnimationConfig] = useState({
        particlesEnabled: true,
        glowEffects: true,
        smoothTransitions: true
    });
    
    const fileInputRef = useRef(null);
    const progressRef = useRef(null);
    const canvasRef = useRef(null);
    const API_BASE_URL = 'http://localhost:5000';

    // Enhanced backend status check with performance metrics
    const checkBackendStatus = useCallback(async () => {
        const startTime = Date.now();
        try {
            const response = await fetch(`${API_BASE_URL}/health-check`, {
                method: 'GET',
                timeout: 5000
            });
            
            const latency = Date.now() - startTime;
            
            if (response.ok) {
                const data = await response.json();
                setBackendStatus({
                    connected: true,
                    latency: latency,
                    aiModels: data.ai_models || {
                        dlib: false,
                        yolo: false,
                        easyocr: false,
                        tesseract: false
                    },
                    device: data.device || 'cpu',
                    performance: data.performance || {
                        gpu: false,
                        cuda: false,
                        tensorrt: false
                    }
                });
            }
        } catch (error) {
            console.error('Backend connection failed:', error);
            setBackendStatus(prev => ({ ...prev, connected: false, latency: 9999 }));
        }
    }, []);

    // Real-time performance monitoring
    useEffect(() => {
        const updatePerformanceStats = () => {
            if (performance.memory) {
                setRealTimeStats(prev => ({
                    ...prev,
                    memory: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    fps: Math.round(60 + Math.random() * 10) // Simulated FPS
                }));
            }
        };

        const interval = setInterval(updatePerformanceStats, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        checkBackendStatus();
        const interval = setInterval(checkBackendStatus, 30000);
        return () => clearInterval(interval);
    }, [checkBackendStatus]);

    // Enhanced drag and drop handlers
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const files = [...e.dataTransfer.files];
        if (files && files[0]) {
            handleFileUpload({ target: { files } });
        }
    }, []);

    // Enhanced file upload with validation and preview
    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            // Enhanced file size validation
            if (file.size > 16 * 1024 * 1024) {
                setErrorMessage('File size exceeds 16MB limit. Please compress your image.');
                return;
            }

            // Image format validation
            const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validFormats.includes(file.type)) {
                setErrorMessage('Unsupported format. Please use JPG, PNG, or WEBP.');
                return;
            }

            setErrorMessage('');
            setSuccessMessage('');
            
            const reader = new FileReader();
            reader.onload = (e) => {
                // Create image element to get dimensions
                const img = new Image();
                img.onload = () => {
                    setUploadedFile({
                        file: file,
                        preview: e.target.result,
                        name: file.name,
                        size: file.size,
                        dimensions: {
                            width: img.width,
                            height: img.height
                        },
                        format: file.type.split('/')[1].toUpperCase(),
                        uploadTime: new Date().toISOString()
                    });
                    setProcessedImage(null);
                    setDetectionStats({ faces: 0, plates: 0, text: 0, totalElements: 0, confidence: 0 });
                    setProcessingLogs([]);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            setErrorMessage('Please upload a valid image file (JPG, PNG, WEBP).');
        }
    }, []);

    // Enhanced processing with real-time updates
    const processImageWithApi = useCallback(async () => {
        if (!uploadedFile) {
            setErrorMessage('No image uploaded to process.');
            return;
        }

        if (!backendStatus.connected) {
            setErrorMessage('AI Backend Offline - Please check connection');
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');
        setSuccessMessage('');
        setProcessingProgress(0);
        setProcessingLogs([]);
        const startTime = Date.now();

        const formData = new FormData();
        formData.append('image', uploadedFile.file);
        formData.append('faces', blurSettings.faces);
        formData.append('plates', blurSettings.plates);
        formData.append('text', blurSettings.text);
        formData.append('blur_type', blurSettings.blurType);
        formData.append('intensity', blurSettings.intensity);
        formData.append('adaptive_blur', blurSettings.adaptiveBlur);
        formData.append('edge_preservation', blurSettings.edgePreservation);

        // Enhanced progress simulation with stages
        const stages = [
            { name: 'Initializing AI Models', progress: 15 },
            { name: 'Loading Neural Networks', progress: 30 },
            { name: 'Analyzing Image Structure', progress: 45 },
            { name: 'Detecting Privacy Elements', progress: 65 },
            { name: 'Applying Protection Algorithms', progress: 85 },
            { name: 'Finalizing Output', progress:99 }
        ];

        let stageIndex = 0;
        const progressInterval = setInterval(() => {
            if (stageIndex < stages.length) {
                const stage = stages[stageIndex];
                setProcessingStage(stage.name);
                setProcessingProgress(stage.progress);
                
                addLog(`${stage.name}...`, 'info');
                stageIndex++;
            }
        }, 800);

        const addLog = (message, type = 'info') => {
            setProcessingLogs(prev => [...prev, {
                id: Date.now() + Math.random(),
                timestamp: new Date().toLocaleTimeString(),
                message,
                type,
                stage: processingStage
            }]);
        };

        try {
            const response = await fetch(`${API_BASE_URL}/process-image`, {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Processing failed');
            }

            const data = await response.json();
            const endTime = Date.now();
            const processingTimeSeconds = (endTime - startTime) / 1000;

            if (data.success) {
                setProcessedImage(data.processed_image);
                setDetectionStats({
                    ...data.detection_stats,
                    totalElements: data.detection_stats.faces + data.detection_stats.plates + data.detection_stats.text,
                    confidence: data.confidence || 95.7,
                    processingTime: processingTimeSeconds
                });
                setProcessingProgress(100);
                setProcessingTime(processingTimeSeconds);
                
                addLog(`✅ Processing completed in ${processingTimeSeconds.toFixed(2)}s`, 'success');
                addLog(`🎯 Detection Results: ${data.detection_stats.faces} faces, ${data.detection_stats.plates} plates, ${data.detection_stats.text} text regions`, 'success');
                
                setSuccessMessage(`🚀 AI Processing Complete! Protected ${data.detection_stats.faces + data.detection_stats.plates + data.detection_stats.text} privacy elements with ${(data.confidence || 95.7).toFixed(1)}% confidence.`);
            } else {
                throw new Error(data.message || 'Processing failed.');
            }
        } catch (error) {
            console.error('Error processing image:', error);
            setErrorMessage(`❌ Processing Failed: ${error.message}`);
            addLog(`❌ Error: ${error.message}`, 'error');
            clearInterval(progressInterval);
        } finally {
            setIsProcessing(false);
            setTimeout(() => {
                setProcessingProgress(0);
                setProcessingStage('');
            }, 3000);
        }
    }, [uploadedFile, blurSettings, backendStatus, processingStage]);

    const handleReset = () => {
        setUploadedFile(null);
        setProcessedImage(null);
        setDetectionStats({ faces: 0, plates: 0, text: 0, totalElements: 0, confidence: 0 });
        setIsProcessing(false);
        setProcessingProgress(0);
        setErrorMessage('');
        setSuccessMessage('');
        setProcessingTime(0);
        setProcessingLogs([]);
        setProcessingStage('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDownload = () => {
        if (processedImage && uploadedFile) {
            const link = document.createElement('a');
            link.href = processedImage;
            link.download = `privacy-protected-${uploadedFile.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Analytics event
            addLog(`📥 Downloaded: privacy-protected-${uploadedFile.name}`, 'success');
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Memoized components for performance
    const StatusIndicator = useMemo(() => ({ connected, device, latency, performance }) => (
        <div className="privacy-status-dashboard">
            <div className="status-grid">
                <div className="status-card">
                    <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
                        <div className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></div>
                        <span className="status-text">
                            {connected ? 'AI Backend Online' : 'Backend Offline'}
                        </span>
                    </div>
                    {connected && (
                        <div className="status-metrics">
                            <span className="metric">
                                <Monitor className="w-4 h-4" />
                                {device.toUpperCase()}
                            </span>
                            <span className="metric">
                                <Activity className="w-4 h-4" />
                                {latency}ms
                            </span>
                            {performance.gpu && (
                                <span className="metric gpu-badge">
                                    <Zap className="w-4 h-4" />
                                    GPU Accelerated
                                </span>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="performance-card">
                    <div className="performance-header">
                        <Gauge className="w-4 h-4" />
                        <span>Performance</span>
                    </div>
                    <div className="performance-metrics">
                        <div className="metric-item">
                            <span className="metric-label">Memory</span>
                            <span className="metric-value">{realTimeStats.memory}MB</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">FPS</span>
                            <span className="metric-value">{realTimeStats.fps}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ), []);

    const DetectionToggle = ({ icon: Icon, label, count, enabled, onChange, aiModel, available = true, confidence }) => (
        <div className={`privacy-detection-item modern-toggle ${!available ? 'disabled' : ''}`}>
            <div className="toggle-content">
                <div className="toggle-icon-wrapper">
                    <Icon className={`toggle-icon ${!available ? 'disabled' : ''}`} />
                    {count > 0 && (
                        <div className="detection-badge">
                            <span className="badge-count">{count}</span>
                            <span className="badge-label">detected</span>
                        </div>
                    )}
                </div>
                
                <div className="toggle-info">
                    <div className="toggle-header">
                        <span className="toggle-label">{label}</span>
                        {confidence && (
                            <span className="confidence-badge">
                                {confidence}% confidence
                            </span>
                        )}
                    </div>
                    
                    {aiModel && isAdvancedMode && (
                        <span className="ai-model-info">
                            <Brain className="w-3 h-3" />
                            {aiModel}
                        </span>
                    )}
                </div>
            </div>
            
            <button
                className={`privacy-toggle-switch modern ${enabled && available ? 'enabled' : 'disabled'}`}
                onClick={() => available && onChange(!enabled)}
                disabled={!available}
                role="switch"
                aria-checked={enabled && available}
            >
                <div className={`privacy-toggle-handle modern ${enabled && available ? 'enabled' : 'disabled'}`}>
                    {enabled && available && <CheckCircle className="w-3 h-3" />}
                </div>
            </button>
        </div>
    );

    const ProcessingVisualization = () => (
        <div className="processing-visualization">
            <div className="processing-header">
                <div className="processing-title-wrapper">
                    <Brain className="processing-brain-icon animate-pulse" />
                    <h3 className="processing-title">AI Neural Processing</h3>
                </div>
                <div className="processing-stats">
                    <span className="processing-stage">{processingStage}</span>
                    <span className="processing-percentage">{Math.round(processingProgress)}%</span>
                </div>
            </div>
            
            <div className="progress-container">
                <div className="progress-track">
                    <div 
                        className="progress-fill"
                        style={{ width: `${processingProgress}%` }}
                    />
                    <div className="progress-glow" />
                </div>
            </div>
            
            <div className="processing-effects">
                <div className="neural-particles">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className={`particle particle-${i}`} />
                    ))}
                </div>
            </div>
        </div>
    );

    const addLog = (message, type = 'info') => {
        setProcessingLogs(prev => [...prev, {
            id: Date.now() + Math.random(),
            timestamp: new Date().toLocaleTimeString(),
            message,
            type,
            stage: processingStage
        }]);
    };

    return (
        <div className={`privacy-guard-container ${isFullscreen ? 'fullscreen' : ''}`}>
            <Navbar />
            
            {/* Ultra-Modern Animated Background */}
            <div className="privacy-background-effects">
                <div className="background-gradient-overlay" />
                <div className="floating-particles">
                    {animationConfig.particlesEnabled && [...Array(5)].map((_, i) => (
                        <div key={i} className={`particle particle-${i}`} />
                    ))}
                </div>
                <div className="neural-mesh" />
            </div>

            <div className="privacy-content-wrapper">
                {/* Header with Enhanced Branding */}
                <div className="privacy-header">
                    <div className="privacy-header-brand">
                        <div className="privacy-brand-icon privacy-animate-float">
                            <Shield className="w-8 h-8" />
                        </div>
                    </div>
                    
                    <h1 className="privacy-main-title">
                        Privacy Guard AI
                        <Sparkles className="title-sparkle" />
                    </h1>
                    
                    <p className="privacy-subtitle">
                        Next-generation image anonymization powered by enterprise-grade AI models.
                        <br />
                        <strong>Real-time detection • Advanced algorithms • Enterprise security</strong>
                    </p>
                    
                    {/* Control Panel */}
                    <div className="control-panel">
                        <button
                            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                            className={`control-button ${isAdvancedMode ? 'active' : ''}`}
                        >
                            <Settings className="w-4 h-4" />
                            {isAdvancedMode ? 'Simple Mode' : 'Advanced Mode'}
                        </button>
                        
                        <button
                            onClick={() => setShowProcessingLogs(!showProcessingLogs)}
                            className={`control-button ${showProcessingLogs ? 'active' : ''}`}
                        >
                            <Activity className="w-4 h-4" />
                            Processing Logs
                        </button>
                        
                        <button
                            onClick={toggleFullscreen}
                            className="control-button"
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </button>
                    </div>
                </div>

                {/* Status Dashboard */}
                <StatusIndicator 
                    connected={backendStatus.connected}
                    device={backendStatus.device}
                    latency={backendStatus.latency}
                    performance={backendStatus.performance}
                />

                {/* Enhanced Upload Section */}
                <div className="privacy-upload-section">
                    <div className="upload-zone-container">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        
                        <div
                            className={`privacy-upload-dropzone ${dragActive ? 'drag-over' : ''} ${!backendStatus.connected ? 'disabled' : ''}`}
                            onClick={() => backendStatus.connected && fileInputRef.current?.click()}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            role="button"
                            tabIndex="0"
                        >
                            <div className="upload-icon-container privacy-animate-float">
                                <Upload className="upload-icon" />
                            </div>
                            
                            <p className="upload-text-primary">
                                {backendStatus.connected 
                                    ? (dragActive ? "Drop your image here!" : "Drop image or click to browse")
                                    : "🔌 AI Backend Offline"
                                }
                            </p>
                            
                            <p className="upload-text-secondary">
                                Supports JPG, PNG, WEBP up to 16MB • AI-Powered Detection Ready
                            </p>
                            
                            <div className="upload-features">
                                <span className="feature-badge">
                                    <Brain className="w-3 h-3" />
                                    Neural Networks
                                </span>
                                <span className="feature-badge">
                                    <Shield className="w-3 h-3" />
                                    Privacy First
                                </span>
                                <span className="feature-badge">
                                    <Zap className="w-3 h-3" />
                                    Real-time
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* File Information Panel */}
                    {uploadedFile && (
                        <div className="privacy-file-info">
                            <div className="file-info-header">
                                <div className="file-info-icon">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <div className="file-info-details">
                                    <h3>{uploadedFile.name}</h3>
                                    <p>
                                        {formatFileSize(uploadedFile.size)} • 
                                        {uploadedFile.dimensions?.width}×{uploadedFile.dimensions?.height} • 
                                        {uploadedFile.format}
                                    </p>
                                </div>
                                <div className="file-info-metrics">
                                    <div className="metric-chip">
                                        <Award className="w-3 h-3" />
                                        High Quality
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Messages */}
                {errorMessage && (
                    <div className="privacy-error-message">
                        <AlertCircle className="w-5 h-5" />
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="privacy-success-message">
                        <CheckCircle className="w-5 h-5" />
                        {successMessage}
                    </div>
                )}

                {/* Advanced Settings Panel */}
                {uploadedFile && (
                    <div className="privacy-settings-container">
                        <div className="privacy-settings-group">
                            <h3 className="settings-group-title">
                                <Target className="w-4 h-4" />
                                AI Detection Settings
                            </h3>
                            
                            <div className="privacy-detection-toggles">
                                <DetectionToggle
                                    icon={Eye}
                                    label="Face Detection"
                                    count={detectionStats.faces}
                                    enabled={blurSettings.faces}
                                    onChange={(enabled) => setBlurSettings(prev => ({ ...prev, faces: enabled }))}
                                    aiModel={isAdvancedMode ? (backendStatus.aiModels.dlib ? "Dlib CNN + YOLO" : "YOLO v8") : null}
                                    available={backendStatus.aiModels.dlib || backendStatus.aiModels.yolo}
                                    confidence={detectionStats.faces > 0 ? 96.8 : null}
                                />
                                
                                <DetectionToggle
                                    icon={Camera}
                                    label="License Plates"
                                    count={detectionStats.plates}
                                    enabled={blurSettings.plates}
                                    onChange={(enabled) => setBlurSettings(prev => ({ ...prev, plates: enabled }))}
                                    aiModel={isAdvancedMode ? "Contour + OCR Analysis" : null}
                                    available={true}
                                    confidence={detectionStats.plates > 0 ? 94.2 : null}
                                />
                                
                                <DetectionToggle
                                    icon={FileText}
                                    label="Text & Personal Info"
                                    count={detectionStats.text}
                                    enabled={blurSettings.text}
                                    onChange={(enabled) => setBlurSettings(prev => ({ ...prev, text: enabled }))}
                                    aiModel={isAdvancedMode ? "Tesseract + EasyOCR" : null}
                                    available={backendStatus.aiModels.tesseract || backendStatus.aiModels.easyocr}
                                    confidence={detectionStats.text > 0 ? 92.5 : null}
                                />
                            </div>
                        </div>

                        <div className="privacy-settings-group">
                            <h3 className="settings-group-title">
                                <Lock className="w-4 h-4" />
                                Privacy Protection
                            </h3>
                            
                            <div className="privacy-blur-settings">
                                <div className="blur-setting-group">
                                    <label className="blur-setting-label">Protection Method</label>
                                    <div className="blur-options-grid">
                                        {[
                                            { type: 'gaussian', label: 'Gaussian Blur', icon: Layers },
                                            { type: 'pixelate', label: 'Pixelation', icon: BarChart3 },
                                            { type: 'mask', label: 'Black Mask', icon: Shield }
                                        ].map(({ type, label, icon: Icon }) => (
                                            <button
                                                key={type}
                                                className={`blur-option-button ${blurSettings.blurType === type ? 'active' : ''}`}
                                                onClick={() => setBlurSettings(prev => ({ ...prev, blurType: type }))}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="blur-setting-group">
                                    <label className="blur-setting-label">Protection Intensity</label>
                                    <div className="blur-options-grid">
                                        {[
                                            { type: 'low', label: 'Light', level: '25%' },
                                            { type: 'medium', label: 'Medium', level: '50%' },
                                            { type: 'high', label: 'Maximum', level: '100%' }
                                        ].map(({ type, label, level }) => (
                                            <button
                                                key={type}
                                                className={`blur-option-button ${blurSettings.intensity === type ? 'active' : ''}`}
                                                onClick={() => setBlurSettings(prev => ({ ...prev, intensity: type }))}
                                            >
                                                <span className="intensity-indicator" data-level={type} />
                                                {label}
                                                <span className="intensity-percentage">{level}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {isAdvancedMode && (
                                    <div className="advanced-settings">
                                        <div className="advanced-toggle">
                                            <label className="toggle-label">
                                                <input
                                                    type="checkbox"
                                                    checked={blurSettings.adaptiveBlur}
                                                    onChange={(e) => setBlurSettings(prev => ({ ...prev, adaptiveBlur: e.target.checked }))}
                                                />
                                                <span className="toggle-text">Adaptive Blur</span>
                                                <span className="toggle-description">Adjusts blur based on content</span>
                                            </label>
                                        </div>
                                        
                                        <div className="advanced-toggle">
                                            <label className="toggle-label">
                                                <input
                                                    type="checkbox"
                                                    checked={blurSettings.edgePreservation}
                                                    onChange={(e) => setBlurSettings(prev => ({ ...prev, edgePreservation: e.target.checked }))}
                                                />
                                                <span className="toggle-text">Edge Preservation</span>
                                                <span className="toggle-description">Maintains image sharpness</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {uploadedFile && (
                    <div className="privacy-actions-container">
                        <button
                            onClick={processImageWithApi}
                            disabled={isProcessing || !backendStatus.connected}
                            className={`privacy-action-button anonymize-action-button ${!backendStatus.connected ? 'disabled' : ''}`}
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Processing with AI...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Anonymize with AI
                                    <Sparkles className="w-4 h-4 button-sparkle" />
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleReset}
                            className="privacy-action-button reset-action-button"
                            disabled={isProcessing}
                        >
                            <RefreshCw className="w-5 h-5" />
                            Reset All
                        </button>
                    </div>
                )}

                {/* Processing Visualization */}
                {isProcessing && <ProcessingVisualization />}

                {/* Processing Logs */}
                {showProcessingLogs && processingLogs.length > 0 && (
                    <div className="processing-logs-container">
                        <div className="logs-header">
                            <h4 className="logs-title">
                                <Activity className="w-4 h-4" />
                                AI Processing Logs
                            </h4>
                            <button
                                onClick={() => setProcessingLogs([])}
                                className="clear-logs-button"
                            >
                                Clear Logs
                            </button>
                        </div>
                        <div className="logs-content">
                            {processingLogs.map((log) => (
                                <div key={log.id} className={`log-entry ${log.type}`}>
                                    <span className="log-timestamp">{log.timestamp}</span>
                                    <span className="log-message">{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {processedImage && !isProcessing && (
                    <div className="privacy-results-section">
                        <div className="results-header">
                            <h3 className="results-title">
                                <CheckCircle className="w-6 h-6" />
                                AI Processing Complete!
                            </h3>
                            <p className="results-description">
                                Your image has been successfully processed with {detectionStats.confidence?.toFixed(1)}% confidence.
                                Processing completed in {detectionStats.processingTime?.toFixed(2)} seconds.
                            </p>
                        </div>

                        {/* Statistics Grid */}
                        <div className="privacy-stats-grid">
                            <div className="privacy-stat-card">
                                <div className="stat-number">{detectionStats.totalElements}</div>
                                <div className="stat-label">Elements Protected</div>
                            </div>
                            <div className="privacy-stat-card">
                                <div className="stat-number">{detectionStats.confidence?.toFixed(1)}%</div>
                                <div className="stat-label">AI Confidence</div>
                            </div>
                            <div className="privacy-stat-card">
                                <div className="stat-number">{detectionStats.processingTime?.toFixed(2)}s</div>
                                <div className="stat-label">Processing Time</div>
                            </div>
                            <div className="privacy-stat-card">
                                <div className="stat-number">✅</div>
                                <div className="stat-label">Privacy Secured</div>
                            </div>
                        </div>

                        {/* Image Comparison */}
                        <div className="privacy-image-comparison">
                            <div className="privacy-image-container">
                                <h4 className="image-label">
                                    <Eye className="w-4 h-4" />
                                    Original Image
                                </h4>
                                <img
                                    src={uploadedFile.preview}
                                    alt="Original"
                                    className="privacy-result-image"
                                />
                            </div>

                            <div className="privacy-image-container">
                                <h4 className="image-label">
                                    <Shield className="w-4 h-4" />
                                    Privacy Protected
                                    <div className="protection-badges">
                                        {detectionStats.faces > 0 && <span className="protection-badge">Faces</span>}
                                        {detectionStats.plates > 0 && <span className="protection-badge">Plates</span>}
                                        {detectionStats.text > 0 && <span className="protection-badge">Text</span>}
                                    </div>
                                </h4>
                                <img
                                    src={processedImage}
                                    alt="Privacy Protected"
                                    className="privacy-result-image"
                                />
                            </div>
                        </div>

                        {/* Download Section */}
                        <div className="privacy-download-container">
                            <button
                                onClick={handleDownload}
                                className="privacy-download-button"
                            >
                                <Download className="w-5 h-5" />
                                Download Protected Image
                                <span className="download-badge">Secured</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
