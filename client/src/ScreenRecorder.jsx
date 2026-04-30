import React from 'react';
import { Monitor, Mic, MicOff, Download, Camera, Image as ImageIcon, Layers, Play, Pause, Square, Settings, Video } from 'lucide-react';
import './ScreenRecorder.css';

const ScreenRecorder = ({ 
  isRecording, recordingName, setRecordingName, audioEnabled, 
  setAudioEnabled, startRecording, stopRecording,
  countdown,
  bubbleType, setBubbleType, photoUrl, setPhotoUrl,
  virtualBg, setVirtualBg,
  virtualBgColor, setVirtualBgColor,
  virtualBgImage, setVirtualBgImage,
  isPaused, pauseRecording, resumeRecording, recordingTime
}) => {

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setBubbleType('photo');
    }
  };
  
  const handleBackgroundChange = (bgType) => {
    setVirtualBg(bgType);
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVirtualBgImage(url);
      setVirtualBg('image');
    }
  };

  return (
    <div className="veed-app-container">
      
      {/* Top Navbar */}
      <nav className="veed-navbar">
        <div className="veed-nav-left">
          <div className="veed-logo">
             <Video size={24} className="veed-brand-icon" /> <span>Studio Record</span>
          </div>
        </div>
        <div className="veed-nav-center">
          <input 
            type="text" 
            placeholder="Enter Recording Name" 
            className="veed-project-name"
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
            disabled={isRecording}
          />
        </div>
        <div className="veed-nav-right">
          <button className="veed-btn-outline" onClick={() => window.location.href = '/'}>Cancel</button>
        </div>
      </nav>

      {/* Main Content Split */}
      <div className="veed-workspace">
        
        {/* Left Sidebar - Settings */}
        <aside className="veed-sidebar">
          <div className="veed-sidebar-section">
            <h3 className="veed-section-title">Layout</h3>
            <div className="veed-layout-grid">
              <button 
                className={`veed-layout-btn ${bubbleType === 'none' ? 'active' : ''}`}
                onClick={() => setBubbleType('none')}
                disabled={isRecording}
              >
                <Monitor size={24} />
                <span>Screen</span>
              </button>
              <button 
                className={`veed-layout-btn ${bubbleType === 'camera' ? 'active' : ''}`}
                onClick={() => setBubbleType('camera')}
                disabled={isRecording}
              >
                <div className="veed-icon-group">
                  <Monitor size={20} />
                  <Camera size={14} className="veed-overlay-icon" />
                </div>
                <span>Screen & Camera</span>
              </button>
            </div>
          </div>

          <div className="veed-sidebar-section">
            <h3 className="veed-section-title">Audio & Devices</h3>
            
            <div className="veed-setting-item">
              <div className="veed-setting-info">
                {audioEnabled ? <Mic size={18} /> : <MicOff size={18} color="#f87171" />}
                <span>Microphone</span>
              </div>
              <label className="veed-toggle">
                <input 
                  type="checkbox" 
                  checked={audioEnabled} 
                  onChange={(e) => setAudioEnabled(e.target.checked)}
                  disabled={isRecording}
                />
                <span className="veed-toggle-slider"></span>
              </label>
            </div>

            <div className="veed-setting-item">
               <div className="veed-setting-info">
                 <ImageIcon size={18} />
                 <span>Photo Avatar</span>
               </div>
               <label className="veed-upload-btn">
                 Upload
                 <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={isRecording} />
               </label>
            </div>
          </div>

          {bubbleType === 'camera' && (
            <div className="veed-sidebar-section">
              <h3 className="veed-section-title">Camera Background</h3>
              <div className="veed-bg-options">
                <button 
                  className={`veed-bg-btn ${virtualBg === 'none' ? 'active' : ''}`}
                  onClick={() => handleBackgroundChange('none')}
                >
                  None
                </button>
                <button 
                  className={`veed-bg-btn ${virtualBg === 'blur' ? 'active' : ''}`}
                  onClick={() => handleBackgroundChange('blur')}
                >
                  Blur
                </button>
                <div className={`veed-bg-btn color-picker-wrap ${virtualBg === 'color' ? 'active' : ''}`}>
                  <span>Color</span>
                  <input 
                    type="color" 
                    value={virtualBgColor}
                    onChange={(e) => {
                      setVirtualBgColor(e.target.value);
                      setVirtualBg('color');
                    }}
                    className="veed-color-input"
                  />
                </div>
                <label className={`veed-bg-btn ${virtualBg === 'image' ? 'active' : ''}`}>
                  Image
                  <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          )}
        </aside>

        {/* Center Canvas */}
        <main className="veed-canvas-area">
          <div className="veed-preview-container">
            <div className="veed-preview-placeholder">
              {!isRecording ? (
                <div className="veed-preview-empty">
                  <Monitor size={48} className="veed-empty-icon" />
                  <p>Ready to record your screen</p>
                </div>
              ) : (
                <div className="veed-recording-active">
                  <div className="veed-pulse-ring"></div>
                  <span>Recording in progress...</span>
                </div>
              )}
            </div>

            {/* Floating Controls */}
            <div className="veed-floating-controls">
              {isRecording && (
                <div className="veed-timer-display">
                  <div className="veed-red-dot"></div>
                  {recordingTime || '00:00'}
                </div>
              )}

              <div className="veed-control-actions">
                {!isRecording ? (
                  <button className="veed-btn-record-main" onClick={startRecording}>
                    <div className="veed-record-circle"></div>
                    Record
                  </button>
                ) : (
                  <>
                    {isPaused ? (
                      <button className="veed-control-btn" onClick={resumeRecording} title="Resume">
                        <Play size={20} />
                      </button>
                    ) : (
                      <button className="veed-control-btn" onClick={pauseRecording} title="Pause">
                        <Pause size={20} />
                      </button>
                    )}
                    <button className="veed-control-btn veed-btn-stop" onClick={stopRecording} title="Stop & Export">
                      <Square size={20} fill="currentColor" />
                      <span>Done</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

      </div>

      {/* Full Screen Countdown Overlay */}
      {countdown > 0 && (
        <div className="veed-countdown-overlay">
          <div className="veed-countdown-circle">
             <span className="veed-countdown-number">{countdown}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenRecorder;
