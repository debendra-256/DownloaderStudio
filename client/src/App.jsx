import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import JSZip from 'jszip';
import { jsPDF } from "jspdf";
import saveAs from 'file-saver';
import * as XLSX from 'xlsx';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Clock, Download, Image, FileText, ChevronLeft, ChevronRight, HelpCircle, Video, X, Camera, User, Maximize2, Minimize2, Pencil, Eraser, Trash2, Pause, Play, StopCircle, ExternalLink, Smile, Flower2, Sparkles } from 'lucide-react';
import Meeting from './Meeting';
import Dashboard, { TOOLS } from './Dashboard';
import Downloader from './Downloader';
import ScreenRecorder from './ScreenRecorder';
import QRCodeGenerator from './QRCodeGenerator';
import WatermarkEditor from './WatermarkEditor';
import EMICalculator from './EMICalculator';
import ImageCompressor from './ImageCompressor';
import HowToUse from './HowToUse';
import VideoToMP3 from './VideoToMP3';
import './Dashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || ''; // Use environment variable or relative paths.

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState('');
  const [activeLoadingId, setActiveLoadingId] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [aiNote, setAiNote] = useState('');
  const [studyNote, setStudyNote] = useState('');
  const [voiceConfig, setVoiceConfig] = useState({ voiceId: 'FmBhnvP58BK0vz65OOj7' });
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [videoAudioUrl, setVideoAudioUrl] = useState(null);
  const [customVoices, setCustomVoices] = useState([]);
  const [images, setImages] = useState([]);
  const [targetLanguage, setTargetLanguage] = useState('English');
  // Removed currentPage state, using URL routing instead
  const [cloneAudioFile, setCloneAudioFile] = useState(null);
  const [cloneName, setCloneName] = useState('');
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [recordingName, setRecordingName] = useState('');
  const [mediaType, setMediaType] = useState(null); // 'audio' or 'video'
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [selectionArea, setSelectionArea] = useState(null); // {x, y, w, h}
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [bubbleType, setBubbleType] = useState('none'); // 'none', 'camera', 'photo'
  const [bubblePos, setBubblePos] = useState({ x: 20, y: 10 });
  const [isDraggingBubble, setIsDraggingBubble] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPipActive, setIsPipActive] = useState(false);
  const [virtualBg, setVirtualBg] = useState('none'); // 'none', 'blur', 'grayscale', 'sepia', 'color', 'image'
  const [virtualBgColor, setVirtualBgColor] = useState('#000000');
  const [virtualBgImage, setVirtualBgImage] = useState(null);
  const pipWindowRef = useRef(null);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    let timer;
    if (isRecording && !isPaused) {
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording, isPaused]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert("Installation is not available. This might be because the app is already installed or your browser doesn't support it.");
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
  };

  const handleLoadMedia = async (type) => {
    if (!url) return;
    setMediaType(type);
    setIsLoading(true);
    setLoadingType('downloading');
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (data.success) {
        setVideoData(data);
        if (type === 'audio') {
          handleDownloadAudioOriginal();
        } else {
          // Let backend choose best MP4-compatible format (H.264 + M4A)
          handleDownloadFormat(null);
        }
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      console.error("Backend connection error:", e);
      alert(`Backend Error: ${e.message}. Please ensure the backend is running and reachable at ${API_BASE || 'the same origin'}. Path: /api/analyze`);
    } finally {
      setIsLoading(false);
      setActiveLoadingId(null);
    }
  };

  const handleDownloadFormat = async (formatId) => {
    if (!url) return;
    setIsLoading(true);
    setLoadingType('downloading');
    setActiveLoadingId(formatId);
    try {
      // null = let backend auto-select best MP4-compatible (H.264 + M4A)
      // combined spec (contains + or /) = pass through as-is
      // plain format ID (e.g. '137') = combine with best M4A audio for merged MP4
      const response = await fetch(`${API_BASE}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, formatId: formatId || null })
      });
      const data = await response.json();
      if (data.success) {
        setVideoData(prev => prev ? { ...prev, videoUrl: data.videoUrl } : { videoUrl: data.videoUrl });

        let downloadName = data.originalFilename;
        if (downloadName) {
          downloadName = downloadName.replace(/_\[.*?\]/, '');
        } else {
          const ext = data.videoUrl.split('.').pop() || 'mp4';
          downloadName = (videoData && videoData.title) ? `${videoData.title}.${ext}` : `video.${ext}`;
        }

        // Trigger browser download
        saveAs(`${API_BASE}${data.videoUrl}`, downloadName);
      } else {
        alert("Error downloading: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert(`Backend Error: ${e.message}. Path: /api/download`);
    } finally {
      setIsLoading(false);
      setActiveLoadingId(null);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "Unknown";
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadAudioOriginal = async () => {
    if (!url) return;
    setIsLoading(true);
    setLoadingType('audio-download');
    try {
      const response = await fetch(`${API_BASE}/api/audio-only`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (data.success) {
        let downloadName = data.originalFilename;
        if (downloadName) {
          downloadName = downloadName.replace(/_\[.*?\]/, '');
        } else {
          downloadName = (videoData && videoData.title) ? `${videoData.title}.mp3` : "audio.mp3";
        }
        saveAs(`${API_BASE}${data.audioUrl}`, downloadName);
      } else {
        alert("Error downloading audio: " + data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setActiveLoadingId(null);
    }
  };

  const handleTranscribe = async (selectedLang) => {
    const lang = (selectedLang && typeof selectedLang === 'string') ? selectedLang : targetLanguage;
    if (!url) return;
    setIsLoading(true);
    setLoadingType('transcribing');
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const next = prev + Math.random() * 5;
        return next > 90 ? 90 : next;
      });
    }, 800);

    try {
      const response = await fetch(`${API_BASE}/api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, targetLanguage: lang })
      });
      const data = await response.json();
      if (data.success) {
        setProgress(100);
        setVideoData(data);
        setTranscription(data.transcription);
        setAiNote(data.aiNote);
        setImages(data.images);
        setVideoAudioUrl(data.audioUrl);
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect to backend.");
    } finally {
      clearInterval(interval);
      setTimeout(() => setProgress(0), 1000); // Fade out after 1s
      setIsLoading(false);
    }
  };

  const handleCreateStudyNote = async () => {
    if (!transcription) return;
    setIsLoading(true);
    setLoadingType('note');
    try {
      const response = await fetch(`${API_BASE}/api/generate-study-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription })
      });
      const data = await response.json();
      if (data.success) {
        setStudyNote(data.studyNote);
      } else {
        alert("Error generating note.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAudio = async () => {
    const textToSpeak = studyNote || aiNote || transcription;
    if (!textToSpeak) return;
    setIsLoading(true);
    setLoadingType('audio');
    try {
      const response = await fetch(`${API_BASE}/api/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, voiceConfig })
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedAudio(`${API_BASE}${data.audioUrl}`);
      } else {
        alert("Error generating audio.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloneVoice = async () => {
    if (!cloneAudioFile || !cloneName) {
      alert("Please upload an audio file and provide a voice name.");
      return;
    }
    setIsLoading(true);
    setLoadingType('cloning');
    const formData = new FormData();
    formData.append('sample', cloneAudioFile);
    formData.append('name', cloneName);
    try {
      const response = await fetch(`${API_BASE}/api/clone-voice`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setCustomVoices([...customVoices, { name: cloneName, voiceId: data.voiceId }]);
        alert(`Voice '${cloneName}' cloned successfully!`);
        setCloneName('');
      } else {
        alert("Cloning failed: " + data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewVoice = async () => {
    setIsLoading(true);
    setLoadingType('preview');
    try {
      const demoText = "नमस्ते, यह एक डेमो है। ନ୍ମସ୍କାର୍, ମୁଁ ଏବେ ଓଡିଆରେ କଥା କହିପାରେ।";
      const response = await fetch(`${API_BASE}/api/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: demoText, voiceConfig })
      });
      const data = await response.json();
      if (data.success) {
        const audio = new Audio(`${API_BASE}${data.audioUrl}`);
        audio.play();
      } else {
        alert("Error generating preview.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(studyNote || aiNote, 180);
    doc.text(splitText, 15, 20);
    doc.save("ai_note.pdf");
  };

  const handleExportZip = async () => {
    if (!transcription) return;
    const zip = new JSZip();
    zip.file("transcription.txt", transcription);
    if (images.length > 0) {
      const imgFolder = zip.folder("images");
      for (let i = 0; i < images.length; i++) {
        try {
          const imgUrl = `${API_BASE}${images[i]}`;
          const response = await fetch(imgUrl);
          const blob = await response.blob();
          imgFolder.file(`frame_${i + 1}.jpg`, blob);
        } catch (e) { console.error(e); }
      }
    }
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "transcription_bundle.zip");
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert("Screen recording is only supported on Desktop browsers.");
      return;
    }
    try {
      // High Quality Screen Stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30, max: 60 } },
        audio: audioEnabled // This captures system audio
      });

      let finalStream = screenStream;

      // Microphone Capture & Mixing for High Quality Audio
      if (audioEnabled) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,
              channelCount: 2
            }
          });

          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const destination = audioContext.createMediaStreamDestination();
          
          // Mix system audio (from screen stream) if present
          if (screenStream.getAudioTracks().length > 0) {
            const systemSource = audioContext.createMediaStreamSource(new MediaStream([screenStream.getAudioTracks()[0]]));
            systemSource.connect(destination);
          }
          
          // Mix microphone audio
          const micSource = audioContext.createMediaStreamSource(micStream);
          micSource.connect(destination);
          
          // Combine mixed audio with screen video
          finalStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...destination.stream.getAudioTracks()
          ]);

          // Keep track of all original tracks to stop them later
          finalStream.originalTracks = [
            ...screenStream.getTracks(),
            ...micStream.getTracks()
          ];
        } catch (micErr) {
          console.warn("Microphone not available, recording with system audio only:", micErr);
        }
      }

      // Show selection mode if requested
      if (isSelectionMode) {
        // This is a simplified simulation: the user will select area in the ScreenRecorder component
        // which will update selectionArea. We wait for them to confirm.
      }

      // Start Countdown
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Wait for countdown
      await new Promise(r => setTimeout(r, 3000));

      // If selection area is defined, use a canvas to crop
      if (selectionArea) {
        const video = document.createElement('video');
        video.srcObject = finalStream;
        video.play();

        const canvas = document.createElement('canvas');
        canvas.width = selectionArea.w;
        canvas.height = selectionArea.h;
        const ctx = canvas.getContext('2d');

        const cropLoop = () => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            ctx.drawImage(video, selectionArea.x, selectionArea.y, selectionArea.w, selectionArea.h, 0, 0, selectionArea.w, selectionArea.h);
            requestAnimationFrame(cropLoop);
          }
        };
        requestAnimationFrame(cropLoop);
        finalStream = canvas.captureStream(60); // 60 FPS
        // Add audio tracks from the original mixed stream
        screenStream.getAudioTracks().forEach(track => finalStream.addTrack(track));
        if (finalStream.originalTracks) {
          finalStream.originalTracks.forEach(track => {
            if (track.kind === 'audio' && !finalStream.getAudioTracks().includes(track)) {
              finalStream.addTrack(track);
            }
          });
        }
      }

      recordedChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=h264') 
        ? 'video/mp4;codecs=h264' 
        : 'video/webm;codecs=vp9,opus';
        
      const mediaRecorder = new MediaRecorder(finalStream, { 
        mimeType,
        audioBitsPerSecond: 128000, // High quality audio
        videoBitsPerSecond: 3000000  // High quality video
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const extension = mediaRecorder.mimeType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(recordedChunksRef.current, { type: mediaRecorder.mimeType });
        const url = URL.createObjectURL(blob);
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
        let fileName = recordingName ? recordingName.trim() : `Area_Recording_${timestamp}`;
        if (!fileName.endsWith(`.${extension}`)) fileName += `.${extension}`;
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        
        // Stop all tracks (screen and microphone)
        finalStream.getTracks().forEach(track => track.stop());
        if (finalStream.originalTracks) {
          finalStream.originalTracks.forEach(track => track.stop());
        }
        setIsRecording(false);
        setRecordingName('');
        setSelectionArea(null);
        setBubbleType('none');
        setRecordingTime(0);
        setIsPaused(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting screen recording:", err);
      alert("Could not start screen recording.");
    }
  };

  const startRecording1 = async () => {
    try {
      // Screen stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Microphone stream
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      // Combine tracks
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...screenStream.getAudioTracks(),
        ...micStream.getAudioTracks()
      ]);

      recordedChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=h264') 
        ? 'video/mp4;codecs=h264' 
        : 'video/webm;codecs=vp9,opus';

      const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const extension = mediaRecorder.mimeType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(recordedChunksRef.current, { type: mediaRecorder.mimeType });
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;

        let fileName = recordingName ? recordingName.trim() : `Screen_Recording_${timestamp}`;
        if (!fileName.endsWith(`.${extension}`)) fileName += `.${extension}`;

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);

        combinedStream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setRecordingName('');
        setBubbleType('none');
        setRecordingTime(0);
        setIsPaused(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

    } catch (err) {
      console.error("Error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const togglePip = async () => {
    if (isPipActive) {
      if (pipWindowRef.current) pipWindowRef.current.close();
      setIsPipActive(false);
      return;
    }

    // Modern Document PiP (Chrome 116+)
    if (window.documentPictureInPicture) {
      try {
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width: 320,
          height: 240,
        });

        pipWindowRef.current = pipWindow;
        setIsPipActive(true);

        // Remove default margins/padding in PIP window to eliminate whitespace
        pipWindow.document.body.style.margin = '0';
        pipWindow.document.body.style.padding = '0';
        pipWindow.document.body.style.overflow = 'hidden';
        pipWindow.document.body.style.backgroundColor = '#000';

        // Copy ALL styles to PIP window for premium look
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            if (styleSheet.href) {
              const newLink = pipWindow.document.createElement('link');
              newLink.rel = 'stylesheet';
              newLink.href = styleSheet.href;
              pipWindow.document.head.appendChild(newLink);
            } else if (styleSheet.cssRules) {
              const newStyle = pipWindow.document.createElement('style');
              [...styleSheet.cssRules].forEach((rule) => {
                newStyle.appendChild(pipWindow.document.createTextNode(rule.cssText));
              });
              pipWindow.document.head.appendChild(newStyle);
            }
          } catch (e) { 
            console.warn("Could not copy some styles to PiP window:", e);
          }
        });

        pipWindow.addEventListener("pagehide", () => {
          setIsPipActive(false);
          pipWindowRef.current = null;
        });

      } catch (err) {
        console.error("PiP error:", err);
      }
    } else {
      // Fallback: Standard Video PiP
      if (videoRef.current) {
        try {
          await videoRef.current.requestPictureInPicture();
        } catch (e) {
          alert("Your browser does not support floating windows. Please use Chrome or Edge for the best experience.");
        }
      }
    }
  };

  return (
    <Router>
      <AppContent
        url={url} setUrl={setUrl}
        isLoading={isLoading} setIsLoading={setIsLoading}
        loadingType={loadingType} setLoadingType={setLoadingType}
        activeLoadingId={activeLoadingId} setActiveLoadingId={setActiveLoadingId}
        videoData={videoData} setVideoData={setVideoData}
        transcription={transcription} setTranscription={setTranscription}
        aiNote={aiNote} setAiNote={setAiNote}
        studyNote={studyNote} setStudyNote={setStudyNote}
        voiceConfig={voiceConfig} setVoiceConfig={setVoiceConfig}
        generatedAudio={generatedAudio} setGeneratedAudio={setGeneratedAudio}
        videoAudioUrl={videoAudioUrl} setVideoAudioUrl={setVideoAudioUrl}
        customVoices={customVoices} setCustomVoices={setCustomVoices}
        images={images} setImages={setImages}
        targetLanguage={targetLanguage} setTargetLanguage={setTargetLanguage}
        cloneAudioFile={cloneAudioFile} setCloneAudioFile={setCloneAudioFile}
        cloneName={cloneName} setCloneName={setCloneName}
        progress={progress} setProgress={setProgress}
        isRecording={isRecording} setIsRecording={setIsRecording}
        audioEnabled={audioEnabled} setAudioEnabled={setAudioEnabled}
        recordingName={recordingName} setRecordingName={setRecordingName}
        mediaType={mediaType} setMediaType={setMediaType}
        handleLoadMedia={handleLoadMedia}
        handleDownloadFormat={handleDownloadFormat}
        handleDownloadAudioOriginal={handleDownloadAudioOriginal}
        handleTranscribe={handleTranscribe}
        handleCreateStudyNote={handleCreateStudyNote}
        handleCreateAudio={handleCreateAudio}
        handleCloneVoice={handleCloneVoice}
        handlePreviewVoice={handlePreviewVoice}
        downloadPdf={downloadPdf}
        handleExportZip={handleExportZip}
        startRecording={startRecording}
        stopRecording={stopRecording}
        formatSize={formatSize}
        handleInstallApp={handleInstallApp}
        isInstallAvailable={!!deferredPrompt}
        countdown={countdown}
        setCountdown={setCountdown}
        selectionArea={selectionArea}
        setSelectionArea={setSelectionArea}
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        bubbleType={bubbleType}
        setBubbleType={setBubbleType}
        bubblePos={bubblePos}
        setBubblePos={setBubblePos}
        isDraggingBubble={isDraggingBubble}
        setIsDraggingBubble={setIsDraggingBubble}
        photoUrl={photoUrl}
        setPhotoUrl={setPhotoUrl}
        isMaximized={isMaximized}
        setIsMaximized={setIsMaximized}
        isPaused={isPaused}
        pauseRecording={pauseRecording}
        resumeRecording={resumeRecording}
        recordingTime={recordingTime}
        togglePip={togglePip}
        isPipActive={isPipActive}
        pipWindow={pipWindowRef.current}
        virtualBg={virtualBg}
        setVirtualBg={setVirtualBg}
        virtualBgColor={virtualBgColor}
        setVirtualBgColor={setVirtualBgColor}
        virtualBgImage={virtualBgImage}
        setVirtualBgImage={setVirtualBgImage}
      />
    </Router>
  );
}

const LecturerBubbleContent = ({ 
  bubbleType, videoRef, photoUrl, isMaximized, setIsMaximized, setBubbleType, 
  isRecording, recordingTime, isPaused, resumeRecording, pauseRecording, stopRecording,
  bubblePos, setBubblePos, isDraggingBubble, setIsDraggingBubble, setDragOffset, dragOffset,
  togglePip, isPipActive, container, virtualBg,
  activeEffect, triggerEffect
}) => {
  
  // Re-attach stream when moving between windows
  useEffect(() => {
    if (bubbleType === 'camera' && videoRef.current) {
      const video = videoRef.current;
      // Access the stream from the main window's global state if needed, 
      // but usually the ref keeps the srcObject. However, it needs a nudge.
      if (video.srcObject) {
        video.play().catch(e => console.error("Auto-play failed:", e));
      }
    }
  }, [isPipActive, bubbleType]);

  const content = (
    <div 
      style={{ 
        position: isPipActive ? 'relative' : 'fixed', 
        bottom: isPipActive ? '0' : (isMaximized ? '0' : `${bubblePos.y}px`), 
        right: isPipActive ? '0' : (isMaximized ? '0' : `${bubblePos.x}px`),
        width: isPipActive ? '100%' : (isMaximized ? '100vw' : '280px'),
        height: isPipActive ? '100%' : (isMaximized ? '100vh' : '180px'),
        borderRadius: (isMaximized || isPipActive) ? '0' : '16px',
        overflow: 'hidden',
        border: (isMaximized || isPipActive) ? 'none' : '3px solid var(--zoom-blue)',
        boxShadow: isPipActive ? 'none' : '0 30px 60px rgba(0,0,0,0.4)',
        zIndex: 100000,
        cursor: (isDraggingBubble && !isPipActive) ? 'grabbing' : (isMaximized || isPipActive ? 'default' : 'grab'),
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: (isDraggingBubble || isPipActive) ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseDown={(e) => {
        if (isMaximized || isPipActive) return;
        setIsDraggingBubble(true);
        setDragOffset({
          x: window.innerWidth - e.clientX - bubblePos.x,
          y: window.innerHeight - e.clientY - bubblePos.y
        });
      }}
    >
      {bubbleType === 'camera' && (
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            transform: 'scaleX(-1)',
            filter: virtualBg === 'blur' ? 'blur(10px)' : 
                    virtualBg === 'grayscale' ? 'grayscale(1)' : 
                    virtualBg === 'sepia' ? 'sepia(1)' : 'none'
          }} 
        />
      )}
      {bubbleType === 'photo' && photoUrl && (
        <img 
          src={photoUrl} 
          alt="Lecturer" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      )}

      {/* Effect Overlays */}
      {activeEffect === 'congratulations' && (
        <div className="bubble-effect-overlay congratulations-anim">
          {['🎊','🎉','✨','🥳','👏','🎊','🎉','✨'].map((e, i) => <span key={i} className={`particle p${i}`}>{e}</span>)}
        </div>
      )}
      {activeEffect === 'flowers' && (
        <div className="bubble-effect-overlay flowers-anim">
          {['🌸','🌺','🌻','🌼','🌷','🌸','🌺','🌻'].map((e, i) => <span key={i} className={`particle p${i}`}>{e}</span>)}
        </div>
      )}
      {activeEffect === 'emoji' && (
        <div className="bubble-effect-overlay emojis-anim">
          {['👍','❤️','🔥','🙌','⭐','👍','❤️','🔥'].map((e, i) => <span key={i} className={`particle p${i}`}>{e}</span>)}
        </div>
      )}

      {/* Bottom Quick Controls - Shown on Hover */}
      {!isPipActive && (
        <div className="bubble-quick-controls">
           <button onClick={() => setBubbleType('none')} title="Stop Camera" className="quick-btn-stop"><X size={14} /></button>
           <div className="bubble-divider" />
           {isPaused ? 
             <button onClick={resumeRecording} title="Resume Recording" className="quick-btn-resume"><Play size={14} fill="currentColor" /></button> :
             <button onClick={pauseRecording} title="Pause Recording" className="quick-btn-pause"><Pause size={14} fill="currentColor" /></button>
           }
           <div className="bubble-divider" />
           <button onClick={() => triggerEffect('emoji')} title="Reaction" className="quick-btn-effect"><Smile size={14} /></button>
           <button onClick={() => triggerEffect('flowers')} title="Flowers" className="quick-btn-effect"><Flower2 size={14} /></button>
           <button onClick={() => triggerEffect('congratulations')} title="Congratulations" className="quick-btn-effect"><Sparkles size={14} /></button>
        </div>
      )}

      
      {/* Control Bar Overlay - Hidden in PiP for clear picture */}
      {!isPipActive && (
        <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '10px', zIndex: 10 }}>
        {!isPipActive && (
          <button 
            onClick={togglePip}
            style={{ background: 'rgba(11, 92, 255, 0.6)', border: 'none', borderRadius: '8px', color: 'white', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Pop Out (Float over all screens)"
          >
            <ExternalLink size={18} />
          </button>
        )}
        <button 
          onClick={() => setIsMaximized(!isMaximized)}
          style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '8px', color: 'white', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={isMaximized ? "Minimize" : "Maximize"}
        >
          {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
        <button 
          onClick={() => {
            if (isPipActive && window.documentPictureInPicture.window) {
              window.documentPictureInPicture.window.close();
            }
            setBubbleType('none');
          }}
          style={{ background: 'rgba(255,59,48,0.8)', border: 'none', borderRadius: '8px', color: 'white', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Close Bubble"
        >
          <X size={18} />
        </button>
      </div>
      )}

      {/* Recording Timer & Controls (Only if recording and NOT in PiP) */}
      {isRecording && !isPipActive && (
        <div style={{ position: 'absolute', bottom: isPipActive ? '5px' : '15px', left: isPipActive ? '5px' : '15px', right: isPipActive ? '5px' : '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.6)', padding: isPipActive ? '4px 8px' : '8px 12px', borderRadius: '12px', backdropFilter: 'blur(10px)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '800', fontSize: isPipActive ? '0.75rem' : '0.85rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isPaused ? '#FFCC00' : '#FF3B30', animation: isPaused ? 'none' : 'pulse 1.5s infinite' }}></div>
            <span>{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {isPaused ? (
              <button onClick={resumeRecording} style={{ background: '#4CD964', border: 'none', borderRadius: '6px', color: 'white', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
                <Play size={12} fill="currentColor" /> RESUME
              </button>
            ) : (
              <button onClick={pauseRecording} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', color: 'white', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
                <Pause size={12} fill="currentColor" /> PAUSE
              </button>
            )}
            <button onClick={stopRecording} style={{ background: '#FF3B30', border: 'none', borderRadius: '6px', color: 'white', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
              <StopCircle size={12} fill="currentColor" /> STOP
            </button>
          </div>
        </div>
      )}

      {/* Draggable Indicator */}
      {!isMaximized && !isRecording && !isPipActive && (
        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></div>
      )}
    </div>
  );

  if (isPipActive && container) {
    return createPortal(content, container);
  }

  return content;
};

function AppContent({
  url, setUrl, isLoading, setIsLoading, loadingType, setLoadingType,
  activeLoadingId, setActiveLoadingId, videoData, setVideoData,
  transcription, setTranscription, aiNote, setAiNote, studyNote, setStudyNote,
  voiceConfig, setVoiceConfig, generatedAudio, setGeneratedAudio,
  videoAudioUrl, setVideoAudioUrl, customVoices, setCustomVoices,
  images, setImages, targetLanguage, setTargetLanguage,
  cloneAudioFile, setCloneAudioFile, cloneName, setCloneName,
  progress, setProgress, isRecording, setIsRecording,
  audioEnabled, setAudioEnabled, recordingName, setRecordingName,
  mediaType, setMediaType, handleLoadMedia, handleDownloadFormat,
  handleDownloadAudioOriginal, handleTranscribe, handleCreateStudyNote,
  handleCreateAudio, handleCloneVoice, handlePreviewVoice,
  downloadPdf, handleExportZip, startRecording, stopRecording, formatSize,
  handleInstallApp, isInstallAvailable,
  countdown, setCountdown, selectionArea, setSelectionArea,
  isSelectionMode, setIsSelectionMode,
  bubbleType, setBubbleType, bubblePos, setBubblePos,
  isDraggingBubble, setIsDraggingBubble, photoUrl, setPhotoUrl,
  isMaximized, setIsMaximized,
  isPaused, pauseRecording, resumeRecording, recordingTime,
  togglePip, isPipActive, pipWindow,
  virtualBg, setVirtualBg,
  virtualBgColor, setVirtualBgColor,
  virtualBgImage, setVirtualBgImage
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleToolSelection = (toolId) => {
    switch (toolId) {
      case 'downloader': navigate('/downloader'); break;
      case 'notes-from-v': navigate('/ai-notes'); break;
      case 'screen-rec': navigate('/screen-recorder'); break;
      case 'qr-gen': navigate('/qr-generator'); break;
      case 'add-watermark': navigate('/watermark'); break;
      case 'emi-calc': navigate('/emi-calculator'); break;
      case 'v-to-mp3': navigate('/video-to-mp3'); break;
      case 'img-compress': navigate('/img-compressor'); break;
      case 'meeting': navigate('/meeting'); break;
      // Handle remaining tools with a consistent alert for now
      case 'age-calc':
      case 'pdf-editor':
      case 'watermark-rem':
      case 'url-shortener':
      case 'merge-pdf':
      case 'split-pdf':
        alert(`Launching ${toolId.replace('-', ' ')}... This premium tool is coming soon to your AI Workspace!`);
        break;
      default: 
        alert(`Launching ${toolId}... (Logic for this tool will be added soon)`);
    }
  };

  const currentPage = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const processingRef = useRef(false);
  const selfieSegmentationRef = useRef(null);
  const canvasRef = useRef(null);
  const processedStreamRef = useRef(null);
  const sourceVideoRef = useRef(null);
  const bgImageElementRef = useRef(null);

  const [activeEffect, setActiveEffect] = useState(null);
  const effectTimeoutRef = useRef(null);

  const triggerEffect = (effectType) => {
    if (effectTimeoutRef.current) clearTimeout(effectTimeoutRef.current);
    setActiveEffect(effectType);
    effectTimeoutRef.current = setTimeout(() => {
      setActiveEffect(null);
    }, 4000);
  };

  const initSegmentation = async () => {
    if (selfieSegmentationRef.current) return;

    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });

    const selfieSegmentation = new window.SelfieSegmentation({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
      selfieMode: true,
    });

    selfieSegmentation.onResults((results) => {
      if (!canvasRef.current || !processingRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const type = canvas.dataset.bgType;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-over';

      if (type === 'blur') {
        ctx.filter = 'blur(15px)';
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      } else if (type === 'color') {
        ctx.fillStyle = canvas.dataset.bgColor || '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (type === 'image') {
        if (bgImageElementRef.current) {
          ctx.drawImage(bgImageElementRef.current, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else if (type === 'grayscale') {
        ctx.filter = 'grayscale(1)';
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      } else if (type === 'sepia') {
        ctx.filter = 'sepia(1)';
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
    });

    selfieSegmentationRef.current = selfieSegmentation;
  };

  useEffect(() => {
    let animationFrameId;
    
    const processLoop = async () => {
      if (processingRef.current && sourceVideoRef.current && selfieSegmentationRef.current) {
        if (sourceVideoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA
          try {
            await selfieSegmentationRef.current.send({ image: sourceVideoRef.current });
          } catch (e) {
            console.error("Segmentation error:", e);
          }
        }
      }
      animationFrameId = requestAnimationFrame(processLoop);
    };

    if (bubbleType === 'camera') {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
          streamRef.current = stream;
          
          if (['blur', 'color', 'image', 'grayscale', 'sepia'].includes(virtualBg)) {
            await initSegmentation();
            
            if (!canvasRef.current) {
              const canvas = document.createElement('canvas');
              canvas.width = 1280; // Higher res for "HD" as requested
              canvas.height = 720;
              canvasRef.current = canvas;
              processedStreamRef.current = canvas.captureStream(30);
            }
            
            canvasRef.current.dataset.bgType = virtualBg;
            canvasRef.current.dataset.bgColor = virtualBgColor;

            if (virtualBg === 'image' && virtualBgImage) {
              if (!bgImageElementRef.current) {
                bgImageElementRef.current = new Image();
              }
              bgImageElementRef.current.src = virtualBgImage;
            }
            
            if (!sourceVideoRef.current) {
              const tempVideo = document.createElement('video');
              tempVideo.muted = true;
              tempVideo.playsInline = true;
              sourceVideoRef.current = tempVideo;
            }
            
            sourceVideoRef.current.srcObject = stream;
            sourceVideoRef.current.play();
            
            processingRef.current = true;
            if (videoRef.current) videoRef.current.srcObject = processedStreamRef.current;
            
            if (!animationFrameId) processLoop();
          } else {
            processingRef.current = false;
            if (videoRef.current) videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera access error:", err);
          alert("Could not access camera.");
          setBubbleType('none');
        }
      };
      startCamera();
    } else {
      processingRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (sourceVideoRef.current) {
        sourceVideoRef.current.srcObject = null;
      }
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [bubbleType, setBubbleType, virtualBg, virtualBgColor, virtualBgImage]);

  // Ensure video stream is re-attached on every render if active
  useEffect(() => {
    if (bubbleType === 'camera' && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      if (['blur', 'color', 'image', 'grayscale', 'sepia'].includes(virtualBg)) {
        videoRef.current.srcObject = processedStreamRef.current;
      } else {
        videoRef.current.srcObject = streamRef.current;
      }
    }
  });

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingBubble) {
        setBubblePos({
          x: window.innerWidth - e.clientX - dragOffset.x,
          y: window.innerHeight - e.clientY - dragOffset.y
        });
      }
    };
    const handleMouseUp = () => setIsDraggingBubble(false);

    if (isDraggingBubble) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingBubble, dragOffset, setIsDraggingBubble, setBubblePos]);

  return (
    <div className="app-container">
      {bubbleType !== 'none' && (
        <LecturerBubbleContent 
          bubbleType={bubbleType}
          videoRef={videoRef}
          photoUrl={photoUrl}
          isMaximized={isMaximized}
          setIsMaximized={setIsMaximized}
          setBubbleType={setBubbleType}
          isRecording={isRecording}
          recordingTime={recordingTime}
          isPaused={isPaused}
          resumeRecording={resumeRecording}
          pauseRecording={pauseRecording}
          stopRecording={stopRecording}
          bubblePos={bubblePos}
          setBubblePos={setBubblePos}
          isDraggingBubble={isDraggingBubble}
          setIsDraggingBubble={setIsDraggingBubble}
          setDragOffset={setDragOffset}
          dragOffset={dragOffset}
          togglePip={togglePip}
          isPipActive={isPipActive}
          pipWindow={pipWindow}
          container={isPipActive && pipWindow ? pipWindow.document.body : null}
          virtualBg={virtualBg}
          activeEffect={activeEffect}
          triggerEffect={triggerEffect}
        />
      )}

      {progress > 0 && (
        <div className="progress-beam-container">
          <div className="progress-beam-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {isLoading && !['transcribing', 'downloading', 'audio-download'].includes(loadingType) && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}

      {isLoading && ['downloading', 'audio-download'].includes(loadingType) && (
        <div className="bottom-progress-bar">
          <div className="progress-content">
            <div className="spinner small-spinner"></div>
            <span style={{ fontWeight: '600', letterSpacing: '0.5px' }}>
              {loadingType === 'audio-download' ? 'Downloading Audio...' : 'Downloading Video...'}
            </span>
          </div>
          <div className="progress-beam-container bottom-beam">
            <div className="progress-beam-fill"></div>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="logo-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-vids">Downloader</span>
          <span className="logo-save">Studio.ai</span>
        </div>
        <ul className="nav-links">
          <li className="nav-item-dropdown">
            <span className="nav-dropdown-trigger">
              Solutions <ChevronDown size={16} />
            </span>
            <div className="nav-dropdown-menu">
              <div className="nav-dropdown-grid">
                <div className="nav-dropdown-group">
                  <h4>Video & Audio</h4>
                  <NavLink to="/downloader" className="dropdown-link" onClick={() => navigate('/downloader')}>Media Downloader</NavLink>
                  <NavLink to="/meeting" className="dropdown-link" onClick={() => navigate('/meeting')}>AI Video Meetings</NavLink>
                  <NavLink to="/video-to-mp3" className="dropdown-link" onClick={() => navigate('/video-to-mp3')}>Video to MP3</NavLink>
                  <NavLink to="/screen-recorder" className="dropdown-link" onClick={() => navigate('/screen-recorder')}>Screen Recorder</NavLink>
                  <NavLink to="/watermark" className="dropdown-link" onClick={() => navigate('/watermark')}>Watermark Studio</NavLink>
                </div>
                <div className="nav-dropdown-group">
                  <h4>AI & Utility</h4>
                  <NavLink to="/ai-notes" className="dropdown-link" onClick={() => navigate('/ai-notes')}>AI Video Notes</NavLink>
                  <NavLink to="/img-compressor" className="dropdown-link" onClick={() => navigate('/img-compressor')}>Image Compressor</NavLink>
                  <NavLink to="/emi-calculator" className="dropdown-link" onClick={() => navigate('/emi-calculator')}>EMI Calculator</NavLink>
                  <NavLink to="/qr-generator" className="dropdown-link" onClick={() => navigate('/qr-generator')}>QR Generator</NavLink>
                </div>
              </div>
            </div>
          </li>
          <li><NavLink to="/" className={({ isActive }) => isActive ? 'active-nav' : ''}>Tools Hub</NavLink></li>
          <li><NavLink to="/how-to-use" className={({ isActive }) => isActive ? 'active-nav' : ''}>Guide</NavLink></li>
          <li><span>API</span></li>
        </ul>
        <div className="nav-actions">
          <button className="nav-btn-login">Log in</button>
          <button className="nav-btn-signup">Sign up</button>
        </div>
      </nav>

      <main className="hero-section">
        <Routes>
          <Route path="/" element={
            <>
              <div style={{ background: '#FFFFFF', padding: '0 2rem 4rem' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                  <Dashboard onSelectTool={handleToolSelection} />

                  {/* Premium Vertical Feature Sections */}
                  <div style={{ marginTop: '10rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
                      <h2 style={{ fontSize: '3.5rem', fontWeight: '950', color: 'var(--zoom-dark)', marginBottom: '1.5rem', letterSpacing: '-2px' }}>
                        Next-Gen <span style={{ color: 'var(--zoom-blue)' }}>AI Workspace.</span>
                      </h2>
                      <p style={{ fontSize: '1.3rem', color: 'var(--zoom-gray)', maxWidth: '700px', margin: '0 auto' }}>
                        Unlocking the future of media processing with cloud-native intelligence and precision.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12rem' }}>
                      {/* Feature 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <img src="/images/premium_ai_downloader_icon_1777475804135.png" alt="Downloader" style={{ width: '100%', borderRadius: '40px', boxShadow: '0 40px 100px rgba(11, 92, 255, 0.15)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Global Media Extraction</h3>
                          <p style={{ fontSize: '1.2rem', color: 'var(--zoom-gray)', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                            Download high-fidelity content from over 1,000+ global platforms with a single click. Our AI-driven engine selects the best available resolution for your device instantly.
                          </p>
                          <button onClick={() => navigate('/downloader')} style={{ background: 'var(--zoom-blue)', color: 'white', padding: '1rem 2.5rem', borderRadius: '100px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Get Started</button>
                        </div>
                      </div>

                      {/* Feature 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6rem', flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <img src="/images/premium_ai_intelligence_icon_1777475822656.png" alt="AI intelligence" style={{ width: '100%', borderRadius: '40px', boxShadow: '0 40px 100px rgba(11, 92, 255, 0.15)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>AI Video Intelligence</h3>
                          <p style={{ fontSize: '1.2rem', color: 'var(--zoom-gray)', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                            Transform videos into knowledge. Generate full transcriptions, AI-curated study notes, and deep summaries from any video URL in seconds.
                          </p>
                          <button onClick={() => navigate('/ai-notes')} style={{ background: 'var(--zoom-dark)', color: 'white', padding: '1rem 2.5rem', borderRadius: '100px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Try AI Notes</button>
                        </div>
                      </div>

                      {/* Feature 3 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <img src="/images/premium_ai_editor_icon_1777475850637.png" alt="Editor" style={{ width: '100%', borderRadius: '40px', boxShadow: '0 40px 100px rgba(11, 92, 255, 0.15)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Creative Suite & Editors</h3>
                          <p style={{ fontSize: '1.2rem', color: 'var(--zoom-gray)', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                            A full studio at your fingertips. From lossless image compression to advanced PDF editing and screen recording—all native, all secure, all free.
                          </p>
                          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: '#F5F5F7', color: 'var(--zoom-dark)', padding: '1rem 2.5rem', borderRadius: '100px', border: '1px solid #E2E2E7', fontWeight: '700', cursor: 'pointer' }}>Explore Tools</button>
                        </div>
                      </div>

                      {/* Feature 4: Screen Sharing */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6rem', flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <img src="/images/premium_ai_screen_sharing_icon_1777476226133.png" alt="Screen Sharing" style={{ width: '100%', borderRadius: '40px', boxShadow: '0 40px 100px rgba(11, 92, 255, 0.15)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>AI Screen Sharing & Recording</h3>
                          <p style={{ fontSize: '1.2rem', color: 'var(--zoom-gray)', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                            Capture and share your digital experience in ultra-high definition. Our browser-native recorder allows for seamless system audio and screen capture without any plugins.
                          </p>
                          <button onClick={() => navigate('/screen-recorder')} style={{ background: 'var(--zoom-blue)', color: 'white', padding: '1rem 2.5rem', borderRadius: '100px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Explore Screen Sharing</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          } />
          <Route path="/tools" element={
            <Dashboard onSelectTool={handleToolSelection} />
          } />
          <Route path="/downloader" element={
            <Downloader
              url={url} setUrl={setUrl} isLoading={isLoading}
              handleLoadMedia={handleLoadMedia} videoData={videoData}
              activeLoadingId={activeLoadingId} handleDownloadFormat={handleDownloadFormat}
              handleDownloadAudioOriginal={handleDownloadAudioOriginal}
              formatSize={formatSize} API_BASE={API_BASE}
              transcription={transcription} downloadPdf={downloadPdf}
              handleExportZip={handleExportZip} targetLanguage={targetLanguage}
              setTargetLanguage={setTargetLanguage} handleTranscribe={handleTranscribe}
              studyNote={studyNote} aiNote={aiNote} handleCreateStudyNote={handleCreateStudyNote}
              voiceConfig={voiceConfig} setVoiceConfig={setVoiceConfig}
              customVoices={customVoices} handlePreviewVoice={handlePreviewVoice}
              handleCreateAudio={handleCreateAudio} cloneName={cloneName}
              setCloneName={setCloneName} setCloneAudioFile={setCloneAudioFile}
              handleCloneVoice={handleCloneVoice}
              generatedAudio={generatedAudio}
              handleInstallApp={handleInstallApp}
              isInstallAvailable={isInstallAvailable}
            />
          } />
          <Route path="/screen-recorder" element={
            <ScreenRecorder
              isRecording={isRecording} recordingName={recordingName}
              setRecordingName={setRecordingName} audioEnabled={audioEnabled}
              setAudioEnabled={setAudioEnabled} startRecording={startRecording}
              stopRecording={stopRecording}
              countdown={countdown}
              selectionArea={selectionArea}
              setSelectionArea={setSelectionArea}
              isSelectionMode={isSelectionMode}
              setIsSelectionMode={setIsSelectionMode}
              bubbleType={bubbleType}
              setBubbleType={setBubbleType}
              photoUrl={photoUrl}
              setPhotoUrl={setPhotoUrl}
              virtualBg={virtualBg}
              setVirtualBg={setVirtualBg}
              virtualBgColor={virtualBgColor}
              setVirtualBgColor={setVirtualBgColor}
              virtualBgImage={virtualBgImage}
              setVirtualBgImage={setVirtualBgImage}
              isPaused={isPaused}
              pauseRecording={pauseRecording}
              resumeRecording={resumeRecording}
              recordingTime={recordingTime}
            />
          } />
          <Route path="/meeting" element={<Meeting />} />
          <Route path="/qr-generator" element={<QRCodeGenerator />} />
          <Route path="/watermark" element={<WatermarkEditor />} />
          <Route path="/emi-calculator" element={<EMICalculator />} />
          <Route path="/video-to-mp3" element={<VideoToMP3 />} />
          <Route path="/img-compressor" element={<ImageCompressor />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/ai-notes" element={
            <div className="ai-notes-page">
              <header className="hero">
                <h1>AI <span className="highlight">Video Intelligence</span> Hub</h1>
                <p className="hero-subtitle">Generate deep-study notes and transcripts from any video instantly.</p>
              </header>

              <div className="search-container">
                <input
                  type="text"
                  placeholder="Paste YouTube, Instagram, or X URL for AI analysis..."
                  className="pill-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <button className="download-btn" onClick={() => handleTranscribe()} disabled={isLoading}>
                  {isLoading ? 'ANALYZING...' : 'GENERATE AI NOTES'}
                </button>
              </div>

              {(transcription || aiNote || studyNote) && (
                <div className="ai-results-container results-card">
                  <div className="tabs">
                    <div className="tab active">TRANSCRIPTION & NOTES</div>
                  </div>
                  <div className="tab-content" style={{ display: 'block', padding: '2rem' }}>
                    {aiNote && (
                      <div className="note-section">
                        <h3>AI Summary</h3>
                        <div className="ai-text-box">{aiNote}</div>
                      </div>
                    )}
                    {transcription && (
                      <div className="note-section" style={{ marginTop: '2rem' }}>
                        <h3>Full Transcription</h3>
                        <div className="ai-text-box" style={{ maxHeight: '400px', overflowY: 'auto' }}>{transcription}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          } />
        </Routes>
      </main>

      <footer className="zoom-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="logo-brand" style={{ marginBottom: '1.5rem' }}>
              <span className="logo-vids" style={{ color: 'white' }}>Downloader</span>
              <span className="logo-save" style={{ color: 'var(--zoom-blue)' }}>Studio.ai</span>
            </div>
            <p style={{ color: 'var(--zoom-gray)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              The all-in-one platform for media professionals. Download, convert, and enhance your digital workspace with AI intelligence.
            </p>
          </div>
          <div className="footer-col">
            <h4>Products</h4>
            <ul>
              <li><Link to="/">Media Downloader</Link></li>
              <li><Link to="/video-to-mp3">Video to MP3</Link></li>
              <li><Link to="/watermark">Watermark Studio</Link></li>
              <li><Link to="/screen-recorder">Screen Recorder</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>AI Solutions</h4>
            <ul>
              <li><Link to="/ai-notes">AI Video Notes</Link></li>
              <li><Link to="/ai-notes">Transcription</Link></li>
              <li><Link to="/ai-notes">Summarization</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/how-to-use">User Guide</Link></li>
              <li><Link to="/">API Docs</Link></li>
              <li><Link to="/">Status</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link to="/">Help Center</Link></li>
              <li><Link to="/">Contact Us</Link></li>
              <li><Link to="/">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom" style={{ flexDirection: 'column', gap: '1.5rem', padding: '3rem 0' }}>
          <div className="bharat-badge" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'rgba(255,255,255,0.03)', 
            padding: '8px 24px', 
            borderRadius: '100px', 
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '900', letterSpacing: '1px' }}>
              <span style={{ color: '#FF4D00' }}>MADE</span> 
              <span style={{ color: '#FFFFFF', margin: '0 6px' }}>IN</span> 
              <span style={{ color: '#2E7D32' }}>BHARAT</span>
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', opacity: '0.6', fontSize: '0.9rem' }}>
            <div>© 2026 Downloader Studio. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <span>English</span>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
        </footer>
    </div>
  );
}

export default App;

function FeaturedToolsSlider({ onSelectTool }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) setSlidesToShow(1);
      else if (window.innerWidth <= 1024) setSlidesToShow(2);
      else setSlidesToShow(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = TOOLS.length - slidesToShow;

  const nextSlide = () => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  const prevSlide = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  return (
    <div className="slider-container">
      <div className="slider-track" style={{ transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)` }}>
        {TOOLS.map((tool) => (
          <div key={tool.id} className="slide-card" onClick={() => onSelectTool(tool.id)}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(11, 92, 255, 0.1), rgba(11, 92, 255, 0.05))',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--zoom-blue)',
              marginBottom: '2rem',
              margin: '0 auto 2rem'
            }}>
              <tool.icon size={40} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--zoom-dark)' }}>{tool.title}</h3>
            <p style={{ color: 'var(--zoom-gray)', fontSize: '0.95rem', lineHeight: '1.6' }}>{tool.description}</p>
          </div>
        ))}
      </div>

      <div className="slider-controls">
        <button className="slider-arrow" onClick={prevSlide} disabled={currentIndex === 0} style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}>
          <ChevronLeft size={24} />
        </button>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          {Array.from({ length: Math.min(TOOLS.length - slidesToShow + 1, 10) }).map((_, i) => (
            <div key={i} className={`nav-dot ${currentIndex === i ? 'active' : ''}`} onClick={() => setCurrentIndex(i)} />
          ))}
        </div>

        <button className="slider-arrow" onClick={nextSlide} disabled={currentIndex === maxIndex} style={{ opacity: currentIndex === maxIndex ? 0.3 : 1 }}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

