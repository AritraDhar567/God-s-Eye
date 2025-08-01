import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { Camera, Video, Upload, Settings, Target, Play, Square, X, Download, AlertTriangle, MonitorPlay, Plus, Minus, Grid, List, Eye, LayoutGrid } from 'lucide-react';
import Navbar from './navbar.js';
import './object.css'; // Assuming Navbar is in the same directory


const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? window.location.origin
  : 'http://localhost:5000';

const ObjectTracker = () => {
  // --- Core State Management ---
  const [currentMode, setCurrentMode] = useState('upload'); // 'upload', 'video', 'live'
  const [isTracking, setIsTracking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // For video processing or general backend busy state
  const [trackingResults, setTrackingResults] = useState([]);
  const [detectionAlert, setDetectionAlert] = useState(false); // Global alert for any detection

  // --- Reference Image State ---
  const [referenceImages, setReferenceImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({}); // { 'upload-1': 50, 'upload-2': 100 }
  const [showFullscreen, setShowFullscreen] = useState(null); // For fullscreen result viewer

  // --- Video Tracking State ---
  const [videoFile, setVideoFile] = useState(null);
  const [videoProcessingProgress, setVideoProcessingProgress] = useState(0);
  const videoRef = useRef(null); // For video playback (if you implement local playback or processed video display)

  // --- Live Feed State (UPDATED FOR MULTIPLE CAMERAS) ---
  const [cameras, setCameras] = useState([]); // List of available cameras
  const [cameraFetchError, setCameraFetchError] = useState(null);
  const [ipCameraUrl, setIpCameraUrl] = useState('');
  const [addingIpCamera, setAddingIpCamera] = useState(false);
  const [addIpCameraError, setAddIpCameraError] = useState(null);
  const [addIpCameraSuccess, setAddIpCameraSuccess] = useState(null);
  const [showCameraSelector, setShowCameraSelector] = useState(true); // Toggle visibility of camera grid

  // NEW: State for multiple selected cameras
  const [selectedCameras, setSelectedCameras] = useState([]); // Array of selected camera IDs
  // NEW: Store Socket.IO session ID for each active camera stream
  const [liveStreamSessionIds, setLiveStreamSessionIds] = useState({}); // { camera_id: 'session_id' }
  // NEW: Store status messages for each active camera stream
  const [liveStreamStatusMessage, setLiveStreamStatusMessage] = useState({}); // { camera_id: 'status message' }

  // NEW: A ref to hold individual canvas refs for each camera feed
  const cameraCanvasRefs = useRef({});

  // --- Settings State ---
  const [detectionThreshold, setDetectionThreshold] = useState(0.7);
  const [maxObjects, setMaxObjects] = useState(10);
  const [modelAccuracy, setModelAccuracy] = useState('medium');
  const [alertOnDetection, setAlertOnDetection] = useState(true);

  // --- Display Settings ---
  const [galleryView, setGalleryView] = useState('grid'); // 'grid' or 'list' for results gallery

  // --- Socket.IO setup ---
  const socketRef = useRef(null);

  // Use a ref to hold the latest state values for socket event listeners
  const latestStates = useRef({
    selectedCameras: selectedCameras,
    currentMode: currentMode,
    isTracking: isTracking,
    alertOnDetection: alertOnDetection
  });

  // Update the ref whenever relevant state changes
  useEffect(() => {
    latestStates.current = {
      selectedCameras: selectedCameras,
      currentMode: currentMode,
      isTracking: isTracking,
      alertOnDetection: alertOnDetection
    };
  }, [selectedCameras, currentMode, isTracking, alertOnDetection]);

  // Ref to hold the latest liveStreamSessionIds for cleanup
  const liveStreamSessionIdsRef = useRef({});
  useEffect(() => {
    liveStreamSessionIdsRef.current = liveStreamSessionIds;
  }, [liveStreamSessionIds]);

  // --- Trigger Detection Alert ---
  const triggerDetectionAlert = useCallback(() => {
    setDetectionAlert(true);
    setTimeout(() => {
      setDetectionAlert(false);
    }, 2000); // Alert visible for 2 seconds
  }, []);

  // FIRST useEffect: Initialize and manage the single, persistent Socket.IO connection
  // This effect should only run once on component mount and clean up on unmount.
  // Its dependencies should be an empty array to prevent re-runs.
  useEffect(() => {
    // Initialize Socket.IO connection if not already initialized
    if (!socketRef.current) {
      socketRef.current = io(API_BASE_URL);

      socketRef.current.on('connect', () => {
        console.log('Socket.IO: Connected to backend.');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket.IO: Disconnected from backend.');
      });

      socketRef.current.on('live_frame', (data) => {
        if (!data || !data.frame_data || !data.camera_id) {
          console.error('Socket.IO: Received live_frame event with missing or invalid frame_data or camera_id.');
          return;
        }

        const canvas = cameraCanvasRefs.current[data.camera_id];
        const { selectedCameras: latestSelectedCameras, currentMode: latestCurrentMode, isTracking: latestIsTracking, alertOnDetection: latestAlertOnDetection } = latestStates.current;


        if (canvas && latestCurrentMode === 'live' && latestSelectedCameras.includes(data.camera_id)) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.src = data.frame_data;

          img.onload = () => {
            if (img.width > 0 && img.height > 0) {
              try {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                setLiveStreamStatusMessage(prev => ({ ...prev, [data.camera_id]: 'Live Status: Streaming' }));
              } catch (e) {
                console.error(`Frontend: Error drawing image on canvas for ${data.camera_id}:`, e);
                setLiveStreamStatusMessage(prev => ({ ...prev, [data.camera_id]: 'Live Status: Drawing Error' }));
              }
            }
          };
          img.onerror = (e) => {
            console.error(`Frontend: Error loading image for canvas (${data.camera_id}): check base64 data validity from backend.`, e);
            if (canvas) {
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            setLiveStreamStatusMessage(prev => ({ ...prev, [data.camera_id]: 'Live Status: Image Load Error' }));
          };
        } else if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        if (latestIsTracking && data.detections && data.detections.length > 0) {
          setTrackingResults(prev => [
            ...prev,
            ...data.detections.map(d => ({
              id: d.object_id || `det-${Date.now()}-${Math.random()}`,
              timestamp: d.timestamp || new Date().toISOString(),
              confidence: d.confidence,
              similarity: d.similarity,
              bbox: d.bbox,
              label: d.label,
              cameraId: data.camera_id
            }))
          ]);
          if (latestAlertOnDetection) {
            triggerDetectionAlert();
          }
        }
      });

      socketRef.current.on('stream_error', (data) => {
          console.error(`Socket.IO: Stream error for camera ${data.camera_id}:`, data.message);
          setLiveStreamStatusMessage(prev => ({ ...prev, [data.camera_id]: `Error: ${data.message}` }));
          setSelectedCameras(prev => prev.filter(id => id !== data.camera_id));
          setLiveStreamSessionIds(prev => {
              const newSessions = { ...prev };
              delete newSessions[data.camera_id];
              return newSessions;
          });
          const canvas = cameraCanvasRefs.current[data.camera_id];
          if (canvas) {
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [triggerDetectionAlert]);

  // --- Fetch Available Cameras ---
  const fetchCameras = useCallback(async () => {
    try {
      setCameraFetchError(null);
      const response = await fetch(`${API_BASE_URL}/api/cameras`);
      if (!response.ok) {
        throw new Error('Failed to fetch cameras');
      }
      const responseData = await response.json();

      const camerasArray = responseData.cameras;

      if (!Array.isArray(camerasArray)) {
        console.error("Backend /api/cameras returned non-array data in 'cameras' key:", responseData);
        throw new Error("Invalid data format from camera API. Expected an array in 'cameras' key.");
      }

      setCameras(camerasArray);
      console.log('Fetched cameras:', camerasArray);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      setCameraFetchError(`Failed to fetch cameras: ${error.message}`);
      setCameras([]);
    }
  }, []);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);


  // --- Add IP Camera ---
  const handleAddIpCamera = async () => {
    if (!ipCameraUrl.trim()) {
      setAddIpCameraError('IP Camera URL cannot be empty.');
      return;
    }
    setAddingIpCamera(true);
    setAddIpCameraError(null);
    setAddIpCameraSuccess(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/add-ip-camera`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera_url: ipCameraUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add IP camera.');
      }
      setAddIpCameraSuccess('IP Camera added successfully!');
      setIpCameraUrl('');
      fetchCameras();
    } catch (error) {
      console.error('Error adding IP camera:', error);
      setAddIpCameraError(`Error adding IP camera: ${error.message}`);
    } finally {
      setAddingIpCamera(false);
      setTimeout(() => {
        setAddIpCameraSuccess(null);
        setAddIpCameraError(null);
      }, 3000);
    }
  };

  // --- Handle Reference Image Upload ---
  const handleReferenceUpload = async (event, uploadSlotId) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('images', file);

    setUploadProgress(prev => ({ ...prev, [uploadSlotId]: 0 }));

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/api/upload-reference`, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          setUploadProgress(prev => ({ ...prev, [uploadSlotId]: percent }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log('Upload successful:', data);
          setUploadProgress(prev => ({ ...prev, [uploadSlotId]: 100 }));
          if (data.uploaded_images_details && data.uploaded_images_details.length > 0) {
            const newImageInfo = data.uploaded_images_details[0];
            if (newImageInfo.status === 'success') {
              setReferenceImages(prev => [
                ...prev,
                { id: newImageInfo.filename, name: newImageInfo.filename, src: newImageInfo.image_data, timestamp: newImageInfo.timestamp }
              ]);
            } else {
              alert(`Upload failed for ${newImageInfo.filename}: ${newImageInfo.error}`);
            }
          } else {
            setReferenceImages(prev => [
              ...prev,
              { id: file.name, name: file.name, src: URL.createObjectURL(file), timestamp: new Date().toISOString() }
            ]);
          }
        } else {
          const errorData = JSON.parse(xhr.responseText);
          console.error('Upload failed:', errorData.error);
          setUploadProgress(prev => ({ ...prev, [uploadSlotId]: -1 }));
          alert(`Error uploading image: ${errorData.error}`);
        }
      };

      xhr.onerror = () => {
        console.error('Upload request failed.');
        setUploadProgress(prev => ({ ...prev, [uploadSlotId]: -1 }));
        alert('Network error during upload. Please try again.');
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Client-side error during upload:', error);
      setUploadProgress(prev => ({ ...prev, [uploadSlotId]: -1 }));
      alert(`An unexpected error occurred: ${error.message}`);
    }
  };

  // --- Handle Video Upload (Client-side for now, backend processing needs implementation) ---
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setVideoFile(file);
    setVideoProcessingProgress(0);

    console.log('Video file selected:', file.name);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        setVideoProcessingProgress(progress);
      } else {
        clearInterval(interval);
      }
    }, 300);

    alert('Video selected. Backend processing of video files is under development.');
  };


  // --- Start Tracking ---
  const startTracking = async () => {
    await updateBackendSettings(true);
    setIsTracking(true);
    setIsProcessing(true);
    setTrackingResults([]);

    if (currentMode === 'live') {
      console.log('Live tracking initiated. Stream management handled by useEffect.');
      setIsProcessing(false);
    } else if (currentMode === 'video') {
      alert('Video tracking is not yet fully implemented on backend.');
      setIsTracking(false);
      setIsProcessing(false);
    } else if (currentMode === 'upload' && referenceImages.length === 0) {
      alert('Please upload reference images first.');
      setIsTracking(false);
      setIsProcessing(false);
      return;
    }
  };

  // --- Stop Tracking ---
  const stopTracking = async () => {
    await updateBackendSettings(false);
    setIsTracking(false);
    setIsProcessing(false);

    if (currentMode === 'live') {
      console.log('Live tracking stopped. Streams remain active for preview.');
    } else if (currentMode === 'video') {
      console.log('Video tracking stopped.');
    }
  };

  // --- Clear All ---
  const clearAll = async () => {
    console.log("Clear All Click: Initiating clear all operation.");
    await stopTracking();

    setReferenceImages([]);
    setVideoFile(null);
    setUploadProgress({}); // Clear upload progress state
    setVideoProcessingProgress(0);
    setTrackingResults([]);
    setDetectionAlert(false);

    setCameraFetchError(null);
    setIpCameraUrl('');
    setAddIpCameraError(null);
    setAddIpCameraSuccess(null);
    setShowCameraSelector(true);

    const activeCameraSessions = Object.entries(liveStreamSessionIds);
    for (const [camId, sessionId] of activeCameraSessions) {
        console.log(`Clear All: Stopping active backend live stream for camera: ${camId}, session: ${sessionId}`);
        try {
            await fetch(`${API_BASE_URL}/api/stop-live-tracking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ camera_id: camId, session_id: sessionId }),
            });
            const canvas = cameraCanvasRefs.current[camId];
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        } catch (error) {
            console.error(`Clear All: Error stopping backend live stream for ${camId} during clearAll:`, error);
        }
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('leave_room', { room: sessionId });
        }
    }
    setLiveStreamSessionIds({});
    setLiveStreamStatusMessage({});
    setSelectedCameras([]);
    cameraCanvasRefs.current = {};

    try {
      const response = await fetch(`${API_BASE_URL}/api/clear-references`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear references on backend');
      }
      console.log('Clear All: Backend references cleared:', data.message);
    } catch (error) {
      console.error('Clear All: Error clearing references on backend:', error);
      alert(`Error clearing backend references: ${error.message}`);
    }
    fetchCameras();
  };

  // --- Remove a specific reference image (client-side only for now) ---
  const removeReferenceImage = (id) => {
    setReferenceImages(prev => prev.filter(img => img.id !== id));
    console.log(`Removed reference image with ID: ${id} from frontend UI.`);
    alert('Image removed from UI. To clear from backend, use "Clear All".');
  };

  // --- Determine similarity level for styling ---
  const getSimilarityLevel = (similarity) => {
    if (similarity > 0.8) return 'high';
    if (similarity > 0.5) return 'medium';
    return 'low';
  };

  // --- Determine confidence class for styling ---
  const getConfidenceClass = (confidence) => {
    if (confidence > 0.8) return '';
    if (confidence > 0.5) return 'medium';
    return 'low';
  };

  // --- Format timestamp for display ---
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return timestamp;
    }
  };

  // --- Settings update function (debounced for multiple changes) ---
  const updateBackendSettings = useCallback(async (forceIsTracking = undefined) => {
    console.log('Settings: Attempting to update backend settings.');
    const payload = {
      detection_threshold: detectionThreshold,
      max_objects: maxObjects,
      model_accuracy: modelAccuracy,
      alert_on_detection: alertOnDetection,
    };
    if (forceIsTracking !== undefined) {
      payload.is_tracking_enabled = forceIsTracking;
    } else {
      payload.is_tracking_enabled = isTracking;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }
      console.log('Settings: Backend settings updated:', data.settings);
    } catch (error) {
      console.error('Settings: Error updating settings on backend:', error);
    }
  }, [detectionThreshold, maxObjects, modelAccuracy, alertOnDetection, isTracking]);

  useEffect(() => {
    const handler = setTimeout(() => {
        updateBackendSettings();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [detectionThreshold, maxObjects, modelAccuracy, alertOnDetection, isTracking, updateBackendSettings]);


  // SECOND useEffect: Effect for managing backend live streams (starting/stopping individual camera threads)
  // This useCallback should be stable. Its dependencies are setters and refs.
  const manageBackendLiveStreams = useCallback(async () => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn('Socket.IO is not connected. Cannot manage backend live streams yet.');
      return;
    }

    const currentActiveSessions = liveStreamSessionIdsRef.current || {}; // Get latest from ref
    const desiredSelectedCameras = latestStates.current.selectedCameras;
    const currentOperatingMode = latestStates.current.currentMode;

    // 1. Stop streams that are no longer selected OR if mode is no longer 'live'
    const sessionsToStop = Object.entries(currentActiveSessions).filter(([camId, sessionId]) =>
      currentOperatingMode !== 'live' || !desiredSelectedCameras.includes(camId)
    );

    for (const [camId, sessionId] of sessionsToStop) {
        console.log(`Live Stream Manager: Stopping backend stream for camera: ${camId}, session: ${sessionId}`);
        setLiveStreamStatusMessage(prev => ({ ...prev, [camId]: `Stopping stream...` }));
        try {
          await fetch(`${API_BASE_URL}/api/stop-live-tracking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ camera_id: camId, session_id: sessionId }),
          });
          console.log(`Live Stream Manager: Backend stream stopped for ${camId}.`);
        } catch (error) {
          console.error(`Live Stream Manager: Error stopping backend live stream for ${camId}:`, error);
          setLiveStreamStatusMessage(prev => ({ ...prev, [camId]: `Error stopping: ${error.message}` }));
        } finally {
          setLiveStreamSessionIds(prev => {
            const updated = { ...prev };
            delete updated[camId];
            return updated;
          });
          setLiveStreamStatusMessage(prev => {
              const updated = { ...prev };
              delete updated[camId];
              return updated;
          });
          const canvas = cameraCanvasRefs.current[camId];
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          if (socketRef.current && socketRef.current.connected) {
              socketRef.current.emit('leave_room', { room: sessionId });
          }
        }
    }

    // 2. Identify streams to START (newly selected AND mode is 'live')
    const sessionsAfterPotentialStops = liveStreamSessionIdsRef.current || {}; // Use the ref here for latest state

    const camerasToStart = desiredSelectedCameras.filter(camId =>
        currentOperatingMode === 'live' && !(camId in sessionsAfterPotentialStops)
    );

    for (const camId of camerasToStart) {
      console.log(`Live Stream Manager: Initiating backend live stream for camera: ${camId}`);
      setLiveStreamStatusMessage(prev => ({ ...prev, [camId]: `Connecting...` }));
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/start-live-tracking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ camera_id: camId }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Failed to initiate live stream for ${camId}`);
        }
        setLiveStreamSessionIds(prev => ({ ...prev, [camId]: data.session_id }));
        setLiveStreamStatusMessage(prev => ({ ...prev, [camId]: `Live Status: Waiting for frames...` }));
        
        socketRef.current.emit('join_room', { room: data.session_id });
        console.log(`Socket.IO: Emitted join_room for new stream: ${data.session_id}`);
        
      } catch (error) {
        console.error(`Live Stream Manager: Error initiating backend live stream for ${camId}:`, error);
        setLiveStreamSessionIds(prev => {
          const updated = { ...prev };
          delete updated[camId];
          return updated;
        });
        setLiveStreamStatusMessage(prev => ({ ...prev, [camId]: `Error: ${error.message}` }));
        setSelectedCameras(prev => prev.filter(id => id !== camId));
      }
    }
  }, [latestStates, socketRef, setLiveStreamSessionIds, setLiveStreamStatusMessage, setSelectedCameras]);


  // This useEffect will now only depend on currentMode and selectedCameras, and manageBackendLiveStreams (which is stable)
  // Its cleanup will be minimal.
  useEffect(() => {
    const delayHandler = setTimeout(() => {
        manageBackendLiveStreams();
    }, 100);

    return () => {
        clearTimeout(delayHandler);
        // This cleanup should *not* stop individual streams.
        // manageBackendLiveStreams is designed to handle the reconciliation.
        // The only time we need to explicitly stop all streams is on component unmount,
        // which can be handled by `clearAll` or a dedicated unmount effect.
    };
  }, [currentMode, selectedCameras, manageBackendLiveStreams]);


  // --- Download Results ---
  const handleDownloadResults = () => {
    console.log('Download Results: Initiated download.');
    if (trackingResults.length === 0) {
      alert('No results to download.');
      return;
    }
    const csvHeader = ["ID", "Timestamp", "Confidence", "Similarity", "Label", "Camera ID"];
    const csvRows = trackingResults.map(result => [
      result.id,
      formatTime(result.timestamp),
      (result.confidence * 100).toFixed(2) + '%',
      (result.similarity * 100).toFixed(2) + '%',
      result.label || 'N/A',
      result.cameraId || 'N/A'
    ].join(','));

    const csvContent = [csvHeader.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `object_tracking_results_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('Tracking results downloaded successfully!');
  };


  return (
    <div className="object-tracker-container">
      <Navbar />

      {/* Global Detection Alert */}
      {detectionAlert && (
        <div className={`detection-alert ${!detectionAlert ? 'hidden' : ''}`}>
          <div className="alert-content">
            <AlertTriangle className="alert-icon" />
            <span>Object Detected!</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="tracker-header">
        <div className="tracker-header-title-container">
          <Target className="tracker-header-icon" />
          <h1 className="tracker-header-title">Object Search & Tracking System</h1>
        </div>
        <p className="tracker-header-subtitle">
          Upload reference images, select a feed, and track objects with advanced AI.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Mode Selector Buttons */}
        <div className="mode-selector">
          <button
            className={`mode-btn ${currentMode === 'upload' ? 'active' : ''}`}
            onClick={() => setCurrentMode('upload')}
            disabled={isTracking}
          >
            <LayoutGrid className="mode-icon" />
            Upload & Setup
          </button>
          <button
            className={`mode-btn ${currentMode === 'video' ? 'active' : ''}`}
            onClick={() => setCurrentMode('video')}
            disabled={isTracking}
          >
            <Video className="mode-icon" />
            Video Tracking
          </button>
          <button
            className={`mode-btn ${currentMode === 'live' ? 'active' : ''}`}
            onClick={() => setCurrentMode('live')}
            disabled={isTracking}
          >
            <Camera className="mode-icon" />
            Live Feed
          </button>
        </div>

        {/* --- Upload & Setup Section (conditionally rendered) --- */}
        {currentMode === 'upload' && (
          <div className="upload-section-tracker">
            <h3 className="section-title">Reference Images</h3>
            <p className="section-description">Upload 3-4 images of the target object for better recognition.</p>

            <div className="upload-grid">
              {[1, 2, 3, 4 ,5 ,6].map(num => (
                <div key={num} className="upload-item">
                  <label htmlFor={`upload-${num}`} className="upload-dropzone">
                    <div className="upload-content">
                      <Upload className="upload-icon" />
                      <span className="upload-text-main">Reference Image {num}</span>
                      <span className="upload-text-sub">Drag & drop or click to upload</span>
                      {uploadProgress[`upload-${num}`] !== undefined && uploadProgress[`upload-${num}`] < 100 && (
                        <div className="upload-progress">
                          <div
                            className="progress-bar"
                            style={{ width: `${uploadProgress[`upload-${num}`]}%` }}
                          />
                          <span className="progress-percentage">{Math.round(uploadProgress[`upload-${num}`])}%</span>
                        </div>
                      )}
                      {uploadProgress[`upload-${num}`] === 100 && (
                        <span className="upload-complete-text">Upload Complete!</span>
                      )}
                      {uploadProgress[`upload-${num}`] === -1 && (
                        <span className="upload-error-text">Upload Failed!</span>
                      )}
                    </div>
                  </label>
                  <input
                    id={`upload-${num}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleReferenceUpload(e, `upload-${num}`)}
                    className="upload-input"
                  />
                </div>
              ))}
            </div>

            {/* Display uploaded reference images */}
            {referenceImages.length > 0 && (
              <div className="reference-preview">
                <h4 className="preview-title">Uploaded References ({referenceImages.length})</h4>
                <div className="reference-grid">
                  {referenceImages.map(img => (
                    <div key={img.id} className="reference-item">
                      <div className="reference-image-container">
                        <img src={img.src} alt={img.name} className="reference-image" />
                        <div className="reference-overlay">
                          <button
                            className="remove-reference"
                            onClick={() => removeReferenceImage(img.id)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="reference-info">
                        <span className="reference-name">{img.name}</span>
                        <span className="reference-time">{formatTime(img.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Video Tracking Section (conditionally rendered) --- */}
        {currentMode === 'video' && (
          <div className="upload-section-tracker">
            <h3 className="section-title">Video Tracking</h3>
            <p className="section-description">Upload a video file to analyze for object movements.</p>
            <div className="upload-input-container">
              <label htmlFor="video-upload" className="upload-dropzone">
                <div className="upload-content">
                  <Video className="upload-icon" />
                  <span className="upload-text-main">Upload Video File</span>
                  <span className="upload-text-sub">MP4, AVI, MOV supported</span>
                  {videoProcessingProgress > 0 && videoProcessingProgress < 100 && (
                    <div className="upload-progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${videoProcessingProgress}%` }}
                      />
                      <span className="progress-percentage">{Math.round(videoProcessingProgress)}%</span>
                      <span className="upload-complete-text">{videoProcessingProgress > 0 && videoProcessingProgress < 100 ? 'Uploading/Processing...' : ''}</span>
                    </div>
                  )}
                  {videoProcessingProgress === 100 && (
                    <span className="upload-complete-text">Processing Complete!</span>
                  )}
                </div>
              </label>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="upload-input"
              />
            </div>

            {videoFile && (
              <div className="video-container">
                <div className="video-wrapper">
                  <video
                    ref={videoRef}
                    controls
                    className="video-element"
                  />
                </div>
                <div className="video-info">
                  <span className="video-name">File: {videoFile.name}</span>
                  <span className="video-size">Size: ${(videoFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Live Feed Tracking Section (conditionally rendered) --- */}
        {currentMode === 'live' && (
          <div className="upload-section-tracker">
            <h3 className="section-title">Live Feed Tracking</h3>
            <p className="section-description">Select one or more cameras or add an IP camera URL to start live object tracking.</p>

            {/* NEW: Add IP Camera Section */}
            <div className="add-ip-camera-section">
              <h4 className="section-subtitle"><MonitorPlay className="monitor-icon"/> Add IP Camera by URL</h4>
              <p className="section-description">Enter the RTSP, HTTP, or other direct stream URL for an IP camera.</p>
              <div className="ip-camera-input-group">
                <input
                  type="text"
                  placeholder="e.g., rtsp://user:pass@192.168.1.100/stream"
                  value={ipCameraUrl}
                  onChange={(e) => setIpCameraUrl(e.target.value)}
                  className="ip-camera-input"
                  disabled={addingIpCamera}
                />
                <button
                  onClick={handleAddIpCamera}
                  className="add-ip-camera-btn"
                  disabled={addingIpCamera || !ipCameraUrl.trim()}
                >
                  {addingIpCamera ? 'Adding...' : 'Add Camera'}
                </button>
              </div>
              {addIpCameraError && <p className="error-message">{addIpCameraError}</p>}
              {addIpCameraSuccess && <p className="success-message">{addIpCameraSuccess}</p>}
            </div>

            {/* Camera Selector Header with Toggle */}
            <div className="camera-selector-header" onClick={() => setShowCameraSelector(!showCameraSelector)}>
              <h4 className="camera-selector-title">
                Available Camera Feeds ({cameras.length})
                {showCameraSelector ? <Minus size={20} className="toggle-icon" /> : <Plus size={20} className="toggle-icon" />}
              </h4>
            </div>

            {/* Conditionally render the camera grid */}
            {showCameraSelector && (
              <div className="camera-selector">
                {cameraFetchError && (
                  <p className="error-message">{cameraFetchError}</p>
                )}
                {/* Ensure cameras is always an array before mapping */}
                {cameras.length === 0 && !cameraFetchError ? (
                  <p className="no-cameras-message">No active cameras detected. Ensure your camera is connected and not in use by another application, or add an IP camera above.</p>
                ) : (
                  <div className="camera-grid">
                    {cameras.map(cam => (
                      <div
                        key={cam.id}
                        className={`camera-item ${selectedCameras.includes(cam.id) ? 'selected' : ''} ${cam.live ? 'online' : 'offline'}`}
                        onClick={() => cam.live && setSelectedCameras(prev =>
                            prev.includes(cam.id) ? prev.filter(id => id !== cam.id) : [...prev, cam.id]
                        )}
                      >
                        <div className="camera-preview">
                          <Camera className="camera-icon" />
                          <div className="camera-status">
                            {cam.live ? (
                              <div className="status-indicator live">
                                <div className="pulse-dot" />
                                LIVE
                              </div>
                            ) : (
                              <div className="status-indicator offline">
                                Disconnected
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="camera-info">
                          <span className="camera-name">{cam.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NEW: Display multiple live feed canvases in a grid */}
            <div className="live-feed-grid">
              {selectedCameras.length === 0 && (
                <p className="no-live-feed-message">Select one or more cameras above to view their live feeds.</p>
              )}
              {selectedCameras.map(camId => (
                <div key={camId} className="video-container">
                  <div className="video-wrapper">
                    {/* Conditional rendering for loading state before feed appears */}
                    {!liveStreamSessionIds[camId] && (
                      <div className="camera-loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Connecting to {cameras.find(c => c.id === camId)?.name || camId}...</p>
                        <small>{liveStreamStatusMessage[camId] || 'Initializing stream...'}</small>
                      </div>
                    )}
                    <canvas
                      ref={el => (cameraCanvasRefs.current[camId] = el)}
                      className="live-canvas"
                      style={{ display: liveStreamSessionIds[camId] ? 'block' : 'none' }}
                    ></canvas>
                  </div>
                  <div className="camera-info">
                    <span className="camera-name">Selected: {cameras.find(c => c.id === camId)?.name || camId}</span>
                    <span className="camera-status-msg">{liveStreamStatusMessage[camId] || 'Disconnected'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tracking Controls & Settings --- */}
        <div className="controls-and-settings">
          <div className="tracking-controls">
            {!isTracking ? (
              <button
                className="action-button primary"
                onClick={startTracking}
                disabled={isProcessing || referenceImages.length === 0 || (currentMode === 'live' && selectedCameras.length === 0) || (currentMode === 'video' && !videoFile)}
              >
                <Play />
                Start Tracking
              </button>
            ) : (
              <button className="action-button secondary" onClick={stopTracking}>
                <Square />
                Stop Tracking
              </button>
            )}
            <button className="action-button danger" onClick={clearAll}>
              <X />
              Clear All
            </button>
            {trackingResults.length > 0 && (
              <button className="action-button tertiary" onClick={handleDownloadResults}>
                <Download />
                Download Results ({trackingResults.length})
              </button>
            )}
          </div>

          <div className="tracking-settings">
            <h3 className="section-title">
              <Settings className="settings-icon" />
              Tracking Settings
            </h3>
            <div className="setting-item">
              <label>Detection Threshold: {(detectionThreshold * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={detectionThreshold}
                onChange={(e) => setDetectionThreshold(parseFloat(e.target.value))}
                className="slider"
                disabled={isTracking || isProcessing}
              />
            </div>
            <div className="setting-item">
              <label>Max Objects to Track: {maxObjects}</label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={maxObjects}
                onChange={(e) => setMaxObjects(parseInt(e.target.value))}
                className="slider"
                disabled={isTracking || isProcessing}
              />
            </div>
            <div className="setting-item">
              <label>Model Accuracy:</label>
              <select
                value={modelAccuracy}
                onChange={(e) => setModelAccuracy(e.target.value)}
                className="select-dropdown"
                disabled={isTracking || isProcessing}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="setting-item switch-container">
              <label htmlFor="alertToggle">Alert on Detection:</label>
              <input
                type="checkbox"
                id="alertToggle"
                checked={alertOnDetection}
                onChange={(e) => setAlertOnDetection(e.target.checked)}
                className="toggle-switch"
                disabled={isTracking || isProcessing}
              />
              <label htmlFor="alertToggle" className="toggle-switch-label"></label>
            </div>
          </div>
        </div>

        {/* --- Tracking Results Section --- */}
        {trackingResults.length > 0 && (
          <div className="tracking-results-section">
            <h3 className="section-title">
              <Eye className="results-icon" />
              Tracking Results (${trackingResults.length} Detections)
            </h3>
            <div className="results-view-toggle">
              <button
                className={`view-btn ${galleryView === 'grid' ? 'active' : ''}`}
                onClick={() => setGalleryView('grid')}
              >
                <Grid /> Grid View
              </button>
              <button
                className={`view-btn ${galleryView === 'list' ? 'active' : ''}`}
                onClick={() => setGalleryView('list')}
              >
                <List /> List View
              </button>
            </div>

            <div className={`results-gallery ${galleryView}`}>
              {trackingResults.map((result, index) => (
                <div
                  key={result.id || index}
                  className={`result-item
                    ${getSimilarityLevel(result.similarity)}
                    ${getConfidenceClass(result.confidence)}
                  `}
                  onClick={() => setShowFullscreen(result)}
                >
                  <img
                    src={result.imageSrc || `data:image/jpeg;base64,${result.frame_data}`}
                    alt={`Detection ${result.id}`}
                    className="result-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/333333/FFFFFF?text=No+Image"; }}
                  />
                  <div className="result-info">
                    <div className="result-header">
                      <span className="result-id">ID: ${result.object_id}</span>
                      <span className="result-label">${result.label}</span>
                    </div>
                    <span className="result-time">${formatTime(result.timestamp)}</span>
                    <span className="result-confidence">Conf: ${(result.confidence * 100).toFixed(1)}%</span>
                    {referenceImages.length > 0 && (
                      <span className="result-similarity">Sim: ${(result.similarity * 100).toFixed(1)}%</span>
                    )}
                    {result.cameraId && <span className="result-camera-id">Cam: ${cameras.find(c => c.id === result.cameraId)?.name || result.cameraId}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Viewer Modal */}
      {showFullscreen && (
        <div className="fullscreen-modal" onClick={() => setShowFullscreen(null)}>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-fullscreen" onClick={() => setShowFullscreen(null)}>
              <X size={24} />
            </button>
            <img src={showFullscreen.imageSrc || `data:image/jpeg;base64,${showFullscreen.frame_data}`} alt={`Detection ${showFullscreen.id}`} className="fullscreen-image" />
            <div className="fullscreen-details">
              <h3>Details for ID: ${showFullscreen.object_id} (${showFullscreen.label})</h3>
              <p>Timestamp: ${new Date(showFullscreen.timestamp).toLocaleString()}</p>
              <p>Confidence: ${(showFullscreen.confidence * 100).toFixed(2)}%</p>
              {referenceImages.length > 0 && (
                <p>Similarity: ${(showFullscreen.similarity * 100).toFixed(2)}%</p>
              )}
              {showFullscreen.cameraId && (
                  <p>Camera: ${cameras.find(c => c.id === showFullscreen.cameraId)?.name || showFullscreen.cameraId}</p>
              )}
              <p>Bounding Box: [${showFullscreen.bbox.map(coord => Math.round(coord)).join(', ')}]</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectTracker;