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
      
      {/* Removed Internal Navbar to use Global Header/Footer */}

      {/* Main Content Split */}
      <div className="veed-workspace">
        
        {/* Left Sidebar - Settings */}
        <aside className="veed-sidebar">
          <div className="veed-sidebar-section">
            <h3 className="veed-section-title">Recording Details</h3>
            <input 
              type="text" 
              placeholder="Recording Title..." 
              className="veed-project-name-sidebar"
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              disabled={isRecording}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#161822',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                marginBottom: '1rem',
                outline: 'none'
              }}
            />
          </div>
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

      {/* Premium Guide Section (Blog Style) */}
      <section className="recorder-guide-section">
        <div className="guide-content-wrapper">
          <div className="guide-text-area">
            <span className="guide-badge">PRO TUTORIAL</span>
            <h2 className="guide-title">Master the Art of <span className="text-gradient">Professional Recording</span></h2>
            <p className="guide-intro">
              Whether you're creating a lecture, a product demo, or a quick update, our Studio Recorder 
              provides the cinematic tools you need to stand out.
            </p>
            
            <div className="guide-steps">
              <div className="guide-step">
                <div className="step-num">01</div>
                <div className="step-info">
                  <h4>Configure Your Workspace</h4>
                  <p>Choose your layout from the left sidebar. Use 'Screen & Camera' to stay visible and build trust with your audience.</p>
                </div>
              </div>
              <div className="guide-step">
                <div className="step-num">02</div>
                <div className="step-info">
                  <h4>Studio-Grade Audio</h4>
                  <p>Our noise-suppression engine automatically cleans up background hum. Make sure your mic is toggled 'ON' for maximum impact.</p>
                </div>
              </div>
              <div className="guide-step">
                <div className="step-num">03</div>
                <div className="step-info">
                  <h4>Engage with Reactions</h4>
                  <p>Bring your presentations to life. Hover over your camera bubble to trigger festive emojis, flowers, or celebration effects.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="guide-image-area">
            <div className="guide-img-card">
              <img src="/indian_girl_recorder.png" alt="Indian creator using the Studio Recorder" className="guide-hero-img" />
              <div className="img-overlay-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Removed floating sticker as per request to keep it in footer */}

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
