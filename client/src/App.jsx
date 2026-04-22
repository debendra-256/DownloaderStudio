import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { jsPDF } from "jspdf";
import saveAs from 'file-saver';
import * as XLSX from 'xlsx';

const API_BASE = ''; // Use relative paths. Vite proxy handles local dev, same-origin handles production.

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState('');
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
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'ai-notes'
  const [cloneAudioFile, setCloneAudioFile] = useState(null);
  const [cloneName, setCloneName] = useState('');
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [recordingName, setRecordingName] = useState('');
  const [mediaType, setMediaType] = useState(null); // 'audio' or 'video'
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

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
      alert(`Failed to connect to backend at ${API_BASE}/api/analyze. Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFormat = async (formatId) => {
    if (!url) return;
    setIsLoading(true);
    setLoadingType('downloading');
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
      alert("Failed to connect to backend.");
    } finally {
      setIsLoading(false);
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
    // Check for mobile/browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert("Screen recording is only supported on Desktop browsers (Chrome, Edge, Firefox). Mobile browsers do not allow screen capture for security reasons.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: audioEnabled
      });

      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        let fileName = recordingName || `screen-recording-${new Date().getTime()}`;
        if (!fileName.endsWith('.webm')) fileName += '.webm';

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setRecordingName(''); // Reset for next time
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting screen recording:", err);
      alert("Could not start screen recording. Make sure you have granted permissions.");
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

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      let fileName = recordingName || `screen-recording-${Date.now()}`;
      if (!fileName.endsWith('.webm')) fileName += '.webm';

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();

      URL.revokeObjectURL(url);

      combinedStream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecordingName('');
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

  return (
    <div className="app-container">
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
            <span style={{fontWeight: '600', letterSpacing: '0.5px'}}>
              {loadingType === 'audio-download' ? 'Downloading Audio...' : 'Downloading Video...'}
            </span>
          </div>
          <div className="progress-beam-container bottom-beam">
            <div className="progress-beam-fill"></div>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="logo-brand" onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer' }}>
          <span className="logo-vids">Downloader</span>
          <span className="logo-save">Studio.ai</span>
        </div>
        <ul className="nav-links">
          <li onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer', color: currentPage === 'home' ? 'var(--accent-green)' : 'white' }}>HOME</li>
          <li onClick={() => setCurrentPage('ai-notes')} style={{ cursor: 'pointer', color: currentPage === 'ai-notes' ? 'var(--accent-green)' : 'white' }}>AI VIDEO NOTES</li>
          <li>API</li>
        </ul>
      </nav>

      <main className="hero-section">
        {currentPage === 'home' ? (
          <>
            <header className="hero">
              <h1>Transfrom Any video into <span className="highlight">Note or Mp3</span> in a Click.</h1>
              <p className="hero-subtitle">High-quality YouTube, Instagram, and X/Twitter media processing powered by AI.</p>
            </header>

            <div className="search-container">
              <input
                type="text"
                placeholder="Paste URL here..."
                className="pill-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ width: '100%', paddingRight: '1rem' }}
              />
            </div>
            <div className="button-group-mobile" style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="download-btn audio-btn" 
                onClick={() => handleLoadMedia('audio')} 
                disabled={isLoading}
                style={{ flex: '1', minWidth: '160px' }}
              >
                <span style={{ fontSize: '1.2rem' }}>🎵</span> AUDIO
              </button>
              <button 
                className="download-btn" 
                onClick={() => handleLoadMedia('video')} 
                disabled={isLoading}
                style={{ flex: '1', minWidth: '160px' }}
              >
                <span style={{ fontSize: '1.2rem' }}>🎬</span> VIDEO
              </button>
            </div>
          </>
        ) : (
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
        )}

        {currentPage === 'home' && (
          <>
            {/* Screen Recorder Module */}
            <div className="recorder-panel animate-premium">
              <div className="recorder-header">
                <div className="status-dot-container">
                  <div className={`status-dot ${isRecording ? 'pulse' : ''}`}></div>
                  <span>{isRecording ? 'LIVE RECORDING' : 'SCREEN RECORDER'}</span>
                </div>
                
                <div className="recorder-options">
                  <input 
                    type="text" 
                    placeholder="Enter your Recording Name.." 
                    className="pill-input recorder-name-input"
                    value={recordingName}
                    onChange={(e) => setRecordingName(e.target.value)}
                    disabled={isRecording}
                  />

                  <label className="switch-label">
                    <input 
                      type="checkbox" 
                      checked={audioEnabled} 
                      onChange={(e) => setAudioEnabled(e.target.checked)}
                      disabled={isRecording}
                    />
                    <span className="slider"></span>
                    <span style={{ marginLeft: '10px' }}>{audioEnabled ? 'Audio On' : 'Audio Off'}</span>
                  </label>

                  {!isRecording ? (
                    <button className="record-btn start" onClick={startRecording}>
                      START RECORDING
                    </button>
                  ) : (
                    <button className="record-btn stop" onClick={stopRecording}>
                      STOP & SAVE
                    </button>
                  )}
                </div>
              </div>
            </div>

            {videoData && (
              <div className="result-container">
                <div className="white-card">
                  <div className="video-info-grid">
                    <div className="thumbnail-area">
                      <div className="thumbnail-wrap">
                        {mediaType === 'video' && videoData.videoUrl && videoData.videoUrl.startsWith('/uploads') ? (
                          <video 
                            controls 
                            autoPlay
                            src={`${API_BASE}${videoData.videoUrl}`} 
                            className="video-preview-img"
                          />
                        ) : (
                          <img src={videoData.thumbnail} className="video-preview-img" alt="thumbnail" />
                        )}
                      </div>
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                        <button 
                          className="download-btn" 
                          style={{ width: '100%', padding: '0.6rem', background: '#222' }} 
                          onClick={handleDownloadAudioOriginal}
                        >
                           🎵 Download Original Audio
                        </button>
                      </div>
                    </div>

                    <div className="info-content">
                      <h2>{videoData.title || "Detected Video Content"}</h2>
                      
                      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '12px' }}>
                        <table className="options-table">
                          <thead>
                            <tr>
                              <th>Quality</th>
                              <th>Format</th>
                              <th>Size</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {videoData.formats && videoData.formats
                              .filter(f => f.vcodec && f.vcodec !== 'none') // Only show video formats
                              .map((f, i) => (
                              <tr key={i}>
                                <td>{f.quality || f.resolution}</td>
                                <td>{f.ext && f.ext.toUpperCase()}</td>
                                <td>{formatSize(f.filesize)}</td>
                                <td>
                                  <button 
                                    className="table-btn" 
                                    onClick={() => handleDownloadFormat(f.format_id)}
                                    disabled={isLoading}
                                  >
                                    {isLoading && loadingType === 'downloading' ? 'LOADING...' : 'DOWNLOAD'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {(!videoData.formats || videoData.formats.filter(f => f.vcodec && f.vcodec !== 'none').length === 0) && (
                              <tr><td colSpan="4">No video formats detected.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {videoData.videoUrl && videoData.videoUrl.startsWith('/uploads') && (
                        <div style={{ marginTop: '1rem' }}>
                          <button 
                            className="download-btn" 
                            style={{ width: '100%', background: '#ffeb3b', color: '#000' }}
                            onClick={() => saveAs(`${API_BASE}${videoData.videoUrl}`, "video.mp4")}
                          >
                             🔥 DOWNLOAD FILE TO DEVICE
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full Screen AI Intelligence Hub */}
                {transcription && (
                  <div className="fullscreen-ai-card animate-premium">
                    <div className="ai-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ margin: 0, color: '#0277bd', fontSize: '1.8rem' }}>AI Intelligence Hub</h2>
                        <select 
                          className="ai-lang-select" 
                          value={targetLanguage} 
                          onChange={(e) => {
                            setTargetLanguage(e.target.value);
                            handleTranscribe(e.target.value);
                          }}
                        >
                          <option value="English">Translate to English</option>
                          <option value="Hindi">Translate to Hindi</option>
                          <option value="Odia">Translate to Odia</option>
                          <option value="Spanish">Translate to Spanish</option>
                          <option value="French">Translate to French</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="table-btn" style={{ background: '#f44336', padding: '0.8rem 1.5rem' }} onClick={downloadPdf}>EXPORT PDF</button>
                        <button className="table-btn" style={{ background: '#0277bd', padding: '0.8rem 1.5rem' }} onClick={handleExportZip}>DOWNLOAD ZIP</button>
                      </div>
                    </div>

                    <div className="note-box" style={{ fontSize: '1.1rem', padding: '2rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#333' }}>Summary & Study Notes</span>
                          {!studyNote && (
                            <button className="table-btn" style={{ fontSize: '0.85rem' }} onClick={handleCreateStudyNote}>
                              REGENERATE INTELLIGENCE
                            </button>
                          )}
                       </div>
                       {studyNote || aiNote || transcription}
                    </div>

                    {/* Voice Synthesis Module */}
                    <div style={{ marginTop: '3rem', padding: '2rem', background: '#f8f9fa', borderRadius: '16px', border: '1px solid #eee' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <div style={{ flex: 1 }}>
                             <h3 style={{ margin: '0 0 0.5rem' }}>Synthetic Audio Foundry</h3>
                             <p style={{ margin: 0, color: '#666' }}>Engineered vocal synthesis from your generated context.</p>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                             <select 
                                className="pill-input" 
                                style={{ padding: '0.6rem', width: '200px', background: 'white', border: '1px solid #ddd' }}
                                value={JSON.stringify(voiceConfig)}
                                onChange={(e) => setVoiceConfig(JSON.parse(e.target.value))}
                             >
                                <option value='{"voiceId":"FmBhnvP58BK0vz65OOj7"}'>Viraj (Premium Narrator)</option>
                                <option value='{"voice":"nova"}'>Nova (Natural Clarity)</option>
                                {customVoices.map((v, i) => (
                                  <option key={i} value={JSON.stringify({ voiceId: v.voiceId })}>
                                    Cloned: {v.name}
                                  </option>
                                ))}
                             </select>
                             <button className="table-btn" onClick={handlePreviewVoice} style={{ background: '#222', padding: '0.8rem' }}>DEMO</button>
                             <button className="table-btn" onClick={handleCreateAudio} style={{ background: '#00c853', padding: '0.8rem 1.5rem' }}>GENERATE SPEECH</button>
                          </div>
                       </div>
                       
                       {/* Voice Cloning Sub-Module */}
                       <div style={{ marginTop: '2rem', borderTop: '2px dashed #ddd', paddingTop: '2rem' }}>
                          <h4 style={{ margin: '0 0 1rem', color: '#14b8a6' }}>Quantum Voice Cloning</h4>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                             <input 
                               type="text" 
                               placeholder="Vocal Profile Name" 
                               className="pill-input" 
                               style={{ padding: '0.8rem', flex: 1, border: '1px solid #ddd' }}
                               value={cloneName}
                               onChange={(e) => setCloneName(e.target.value)}
                             />
                             <input 
                               type="file" 
                               accept="audio/*" 
                               style={{ flex: 1 }}
                               onChange={(e) => setCloneAudioFile(e.target.files[0])}
                             />
                             <button className="table-btn" onClick={handleCloneVoice} style={{ background: '#14b8a6' }}>MAP VOICE</button>
                          </div>
                       </div>

                       {generatedAudio && (
                         <audio controls src={generatedAudio} style={{ width: '100%', marginTop: '2rem' }} />
                       )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', opacity: 0.8, fontSize: '0.9rem' }}>
         © 2026 Downloader Studio - Advanced AI Media Workspace
      </footer>
    </div>
  );
}

export default App;

