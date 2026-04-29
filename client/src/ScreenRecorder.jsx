import React from 'react';
import { Monitor, Mic, Download, Shield, Zap, CheckCircle, Video, Clock } from 'lucide-react';

const ScreenRecorder = ({ 
  isRecording, recordingName, setRecordingName, audioEnabled, 
  setAudioEnabled, startRecording, stopRecording,
  countdown 
}) => {

  return (
    <div className="recorder-page animate-premium" style={{ background: '#FFFFFF', minHeight: '100vh', position: 'relative' }}>
      {/* Countdown Overlay (Triggered from App.jsx after selection) */}
      {countdown > 0 && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,3,31,0.95)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '15rem', fontWeight: '950', color: 'var(--zoom-blue)', animation: 'pulse 1s infinite' }}>
            {countdown}
          </div>
          <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', marginTop: '2rem', letterSpacing: '2px' }}>GET READY TO RECORD...</p>
        </div>
      )}

      {/* Premium Hero Section */}
      <header className="hero" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(11, 92, 255, 0.1)', color: 'var(--zoom-blue)', padding: '6px 16px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '800', marginBottom: '2rem' }}>
           <Zap size={14} /> PRO RECORDING SUITE
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--zoom-dark)', marginBottom: '1rem' }}>
           The Studio <span style={{ color: 'var(--zoom-blue)' }}>Screen Recorder.</span>
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1.2rem', color: 'var(--zoom-gray)' }}>Capture your digital workspace in stunning high-fidelity with zero lag.</p>
      </header>

      {/* Recorder Panel */}
      <div className="recorder-panel" style={{ 
        margin: '0 auto 4rem', 
        maxWidth: '850px',
        background: 'white',
        borderRadius: '32px',
        border: '1px solid #E2E2E7',
        boxShadow: '0 30px 80px rgba(0, 3, 31, 0.08)',
        overflow: 'hidden'
      }}>
        <div style={{ background: '#00031F', padding: '1.2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isRecording ? '#FF3B30' : '#4CD964', animation: isRecording ? 'pulse 1.5s infinite' : 'none' }}></div>
            <span style={{ color: 'white', fontWeight: '800', letterSpacing: '1px', fontSize: '0.8rem' }}>
               {isRecording ? 'LIVE RECORDING' : 'STUDIO READY'}
            </span>
          </div>
        </div>
        
        <div className="recorder-body" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '800', color: 'var(--zoom-dark)', fontSize: '0.85rem' }}>RECORDING NAME</label>
            <input 
              type="text" 
              placeholder="e.g. Marketing Dashboard Walkthrough" 
              className="pill-input"
              style={{ width: '100%', maxWidth: 'none', padding: '1rem 1.5rem', borderRadius: '12px' }}
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              disabled={isRecording}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F5F5F7', padding: '1.2rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Mic size={20} color="var(--zoom-blue)" />
               <span style={{ fontWeight: '700', color: 'var(--zoom-dark)' }}>Capture Audio</span>
            </div>
            <label className="switch-label">
              <input 
                type="checkbox" 
                checked={audioEnabled} 
                onChange={(e) => setAudioEnabled(e.target.checked)}
                disabled={isRecording}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {!isRecording ? (
              <button 
                className="record-btn start" 
                onClick={startRecording}
                style={{ width: '100%', padding: '1.5rem', fontSize: '1.2rem', fontWeight: '900', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <Video size={24} /> START RECORDING
              </button>
            ) : (
              <button 
                className="record-btn stop" 
                onClick={stopRecording}
                style={{ width: '100%', padding: '1.5rem', fontSize: '1.2rem', fontWeight: '900', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <Download size={24} /> STOP & EXPORT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Section Below Recorder: Image Left, Text Right */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 8rem', padding: '0 2rem' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '5rem', flexWrap: 'wrap' }}>
            {/* Left: Image */}
            <div style={{ flex: 1, minWidth: '400px' }}>
               <img 
                  src="/images/premium_screen_recorder_hero_1777479416151.png" 
                  alt="Screen Recorder Studio Preview" 
                  style={{ width: '100%', borderRadius: '40px', boxShadow: '0 50px 100px rgba(11, 92, 255, 0.15)' }} 
               />
            </div>

            {/* Right: Text */}
            <div style={{ flex: 1, minWidth: '400px', textAlign: 'left' }}>
               <div style={{ display: 'inline-block', background: 'rgba(11, 92, 255, 0.08)', color: 'var(--zoom-blue)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '1px' }}>
                  CORE CAPABILITIES
               </div>
               <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--zoom-dark)', marginBottom: '2rem', lineHeight: '1.2' }}>
                  Professional Grade <span style={{ color: 'var(--zoom-blue)' }}>Capture.</span>
               </h2>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                     <div style={{ background: '#F5F5F7', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'fit-content' }}>
                        <Zap size={24} color="var(--zoom-blue)" />
                     </div>
                     <div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Cloud-Native Intelligence</h4>
                        <p style={{ color: 'var(--zoom-gray)', lineHeight: '1.6' }}>Zero installation required. Record directly from your browser with hardware-accelerated processing for zero lag.</p>
                     </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                     <div style={{ background: '#F5F5F7', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'fit-content' }}>
                        <Mic size={24} color="var(--zoom-blue)" />
                     </div>
                     <div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Multi-Source Audio Mixing</h4>
                        <p style={{ color: 'var(--zoom-gray)', lineHeight: '1.6' }}>Seamlessly blend system audio with your microphone input for crystal clear narrations and presentation audio.</p>
                     </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                     <div style={{ background: '#F5F5F7', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'fit-content' }}>
                        <Shield size={24} color="var(--zoom-blue)" />
                     </div>
                     <div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Studio-Grade Security</h4>
                        <p style={{ color: 'var(--zoom-gray)', lineHeight: '1.6' }}>Your recordings are processed entirely on your local machine. We never see or store your screen data—100% privacy guaranteed.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <article className="how-to-use-section" style={{ paddingBottom: '6rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
           <div>
              <h3 style={{ color: 'var(--zoom-blue)', marginBottom: '1rem' }}>01. Setup</h3>
              <p style={{ color: 'var(--zoom-gray)', lineHeight: '1.6' }}>Name your session and choose if you want to include system audio.</p>
           </div>
           <div>
              <h3 style={{ color: 'var(--zoom-blue)', marginBottom: '1rem' }}>02. Window Selection</h3>
              <p style={{ color: 'var(--zoom-gray)', lineHeight: '1.6' }}>Select the specific window or screen you wish to capture via the browser picker.</p>
           </div>
           <div>
              <h3 style={{ color: 'var(--zoom-blue)', marginBottom: '1rem' }}>03. Delay & Capture</h3>
              <p style={{ color: 'var(--zoom-gray)', lineHeight: '1.6' }}>A 3-second delay starts **after** selection, giving you time to prepare before the recording begins.</p>
           </div>
        </div>
      </article>
    </div>
  );
};

export default ScreenRecorder;
