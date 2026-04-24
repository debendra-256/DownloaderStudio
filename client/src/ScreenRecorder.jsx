import React from 'react';

const ScreenRecorder = ({ 
  isRecording, recordingName, setRecordingName, audioEnabled, 
  setAudioEnabled, startRecording, stopRecording 
}) => {
  return (
    <div className="recorder-page animate-premium">
      <header className="hero">
        <h1>High-Performance <span className="highlight">Screen Recording</span></h1>
        <p className="hero-subtitle">Capture your screen with crystal clear audio and video instantly.</p>
      </header>

      <div className="recorder-panel" style={{ margin: '0 auto', maxWidth: '800px' }}>
        <div className="recorder-header">
          <div className="status-dot-container">
            <div className={`status-dot ${isRecording ? 'pulse' : ''}`}></div>
            <span>{isRecording ? 'LIVE RECORDING' : 'SCREEN RECORDER READY'}</span>
          </div>
        </div>
        
        <div className="recorder-body" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>Recording Name</label>
            <input 
              type="text" 
              placeholder="Enter your Recording Name.." 
              className="pill-input recorder-name-input"
              style={{ width: '100%', maxWidth: 'none' }}
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              disabled={isRecording}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8f9fa', padding: '1rem', borderRadius: '12px' }}>
            <span style={{ fontWeight: '600' }}>Capture Audio</span>
            <label className="switch-label">
              <input 
                type="checkbox" 
                checked={audioEnabled} 
                onChange={(e) => setAudioEnabled(e.target.checked)}
                disabled={isRecording}
              />
              <span className="slider"></span>
              <span style={{ marginLeft: '10px' }}>{audioEnabled ? 'Mic & System On' : 'Muted'}</span>
            </label>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {!isRecording ? (
              <button 
                className="record-btn start" 
                onClick={startRecording}
                style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}
              >
                START RECORDING
              </button>
            ) : (
              <button 
                className="record-btn stop" 
                onClick={stopRecording}
                style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}
              >
                STOP & SAVE RECORDING
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="recorder-features" style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <div className="feature-item" style={{ textAlign: 'center', padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎥</div>
          <h3 style={{ marginBottom: '0.5rem' }}>4K Quality</h3>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Record in the highest resolution supported by your display.</p>
        </div>
        <div className="feature-item" style={{ textAlign: 'center', padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎙️</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Dual Audio</h3>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Capture both system sounds and microphone simultaneously.</p>
        </div>
      </div>

      <article className="how-to-use-section" style={{ marginTop: '5rem', padding: '3rem', background: '#fcfcfc', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: '#1e293b' }}>How to use the Screen Recorder</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          <div>
            <h3 style={{ color: '#0277bd', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#0277bd', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span>
              Configure Your Setup
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.8' }}>
              Enter a name for your recording to keep your files organized. Toggle the <strong>Capture Audio</strong> switch if you need to record your microphone or system sounds alongside the video.
            </p>
          </div>

          <div>
            <h3 style={{ color: '#0277bd', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#0277bd', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span>
              Select Your Source
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.8' }}>
              Click <strong>Start Recording</strong>. Your browser will prompt you to choose between your Entire Screen, a specific Window, or a single Browser Tab. Make sure to check "Share system audio" if prompted.
            </p>
          </div>

          <div>
            <h3 style={{ color: '#0277bd', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#0277bd', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>3</span>
              Capture & Save
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.8' }}>
              Once you're finished, return to this tab and click <strong>Stop & Save</strong>. Your high-quality recording will be processed and downloaded to your device automatically with your chosen name.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#fff9c4', borderRadius: '12px', border: '1px solid #fff59d' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#827717', textAlign: 'center' }}>
            <strong>Pro Tip:</strong> Use the "Window" sharing mode if you only want to record a specific application like VS Code or a Media Player without showing your desktop.
          </p>
        </div>
      </article>
    </div>
  );
};

export default ScreenRecorder;
