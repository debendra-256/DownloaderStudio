import React, { useState, useRef } from 'react';
import { Upload, Type, Image as ImageIcon, Download, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import saveAs from 'file-saver';

const API_BASE = '';

const WatermarkEditor = () => {
  const [file, setFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFileUrl, setProcessedFileUrl] = useState(null);
  const [opacity, setOpacity] = useState(0.5);
  const [position, setPosition] = useState('bottom-right');
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef();
  const watermarkImgRef = useRef();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleWatermarkImageChange = (e) => {
    const img = e.target.files[0];
    if (img) setWatermarkImage(img);
  };

  const handleApplyWatermark = async () => {
    if (!file) {
      alert("Please upload a video or document first.");
      return;
    }
    if (!watermarkText && !watermarkImage) {
      alert("Please enter text or upload an image for the watermark.");
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);
    if (watermarkText) formData.append('text', watermarkText);
    if (watermarkImage) formData.append('watermarkImage', watermarkImage);
    formData.append('opacity', opacity);
    formData.append('position', position);

    try {
      const response = await fetch(`${API_BASE}/api/apply-watermark`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setProgress(100);
        setProcessedFileUrl(data.fileUrl);
      } else {
        alert("Watermarking failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during processing.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="watermark-page animate-premium" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header className="hero" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
          Secure <span className="highlight">Watermark Studio</span>
        </h1>
        <p className="hero-subtitle" style={{ color: '#64748b' }}>
          Protect your creative assets by adding custom text or image watermarks instantly.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem' }}>
        {/* Step 1: Upload */}
        <div className="white-card premium-shadow" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Upload size={24} color="#0277bd" /> 1. Upload Media
          </h2>
          <div 
            onClick={() => fileInputRef.current.click()}
            style={{ 
              border: '2px dashed #e2e8f0', 
              borderRadius: '20px', 
              padding: '3rem 2rem', 
              textAlign: 'center', 
              cursor: 'pointer',
              background: file ? '#f0fdf4' : '#f8fafc',
              transition: 'all 0.3s ease'
            }}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="video/*,application/pdf" />
            {file ? (
              <div>
                <CheckCircle size={40} color="#10b981" style={{ marginBottom: '1rem' }} />
                <p style={{ fontWeight: '600', color: '#1e293b' }}>{file.name}</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Click to change file</p>
              </div>
            ) : (
              <div>
                <Upload size={40} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                <p style={{ fontWeight: '600', color: '#1e293b' }}>Drop your video or PDF here</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Supports MP4, WEBM, PDF (up to 50MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Design */}
        <div className="white-card premium-shadow" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Type size={24} color="#0277bd" /> 2. Design Watermark
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Text Watermark</label>
              <input 
                type="text" 
                placeholder="e.g. © DownloaderStudio" 
                className="pill-input"
                style={{ width: '100%', border: '1px solid #e2e8f0' }}
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>- OR -</span>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Image Watermark</label>
              <button 
                onClick={() => watermarkImgRef.current.click()}
                className="quick-action-chip"
                style={{ width: '100%', padding: '1rem' }}
              >
                <ImageIcon size={18} style={{ marginRight: '8px' }} /> {watermarkImage ? watermarkImage.name : 'Choose Logo Image'}
              </button>
              <input type="file" ref={watermarkImgRef} onChange={handleWatermarkImageChange} hidden accept="image/*" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Position</label>
                <select 
                  className="pill-input" 
                  style={{ width: '100%', padding: '0.8rem' }}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  <option value="center">Center</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Opacity ({opacity})</label>
                <input 
                  type="range" 
                  min="0.1" max="1.0" step="0.1" 
                  value={opacity} 
                  onChange={(e) => setOpacity(e.target.value)}
                  style={{ width: '100%', marginTop: '10px' }}
                />
              </div>
            </div>

            {/* Live Preview Section */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>LIVE PREVIEW</label>
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                background: '#1e293b', 
                borderRadius: '16px', 
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: position === 'center' ? 'center' : (position.includes('top') ? 'flex-start' : 'flex-end'),
                justifyContent: position === 'center' ? 'center' : (position.includes('left') ? 'flex-start' : 'flex-end'),
                padding: '20px',
                border: '4px solid #334155'
              }}>
                {/* Mock Content */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(255,255,255,0.1)', fontSize: '4rem', fontWeight: '900' }}>VIDEO</div>
                
                {/* Watermark Overlay */}
                <div style={{ 
                  opacity: opacity, 
                  color: 'white', 
                  fontSize: '1.2rem', 
                  fontWeight: '700',
                  pointerEvents: 'none',
                  textAlign: 'center',
                  background: watermarkImage ? 'transparent' : 'rgba(0,0,0,0.2)',
                  padding: watermarkImage ? '0' : '8px 16px',
                  borderRadius: '8px',
                  zIndex: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                  {watermarkImage ? (
                    <img 
                      src={URL.createObjectURL(watermarkImage)} 
                      alt="watermark" 
                      style={{ maxWidth: '100px', maxHeight: '60px', objectFit: 'contain' }} 
                    />
                  ) : (
                    watermarkText || 'WATERMARK'
                  )}
                </div>
              </div>
            </div>

            <button 
              className="download-btn-main" 
              onClick={handleApplyWatermark}
              disabled={isProcessing}
              style={{ background: '#1e293b', marginTop: '1.5rem' }}
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} /> PROCESSING...</>
              ) : (
                <><ShieldCheck size={18} style={{ marginRight: '8px' }} /> APPLY & PROTECT</>
              )}
            </button>
          </div>
        </div>
      </div>

      {processedFileUrl && (
        <div className="result-container animate-premium" style={{ marginTop: '4rem', textAlign: 'center' }}>
          <div className="white-card premium-shadow" style={{ padding: '3rem', background: '#ecfdf5', border: '1px solid #10b981' }}>
             <h2 style={{ color: '#065f46', marginBottom: '1rem' }}>Protection Successful!</h2>
             <p style={{ color: '#047857', marginBottom: '2rem' }}>Your watermark has been integrated into the media.</p>
             <button 
                className="download-btn-main" 
                onClick={async () => {
                  try {
                    const resp = await fetch(`${API_BASE}${processedFileUrl}`);
                    const blob = await resp.blob();
                    saveAs(blob, `protected-${file.name}`);
                  } catch (err) {
                    console.error("Download failed", err);
                    alert("Download failed. Please try again.");
                  }
                }}
                style={{ background: '#10b981', maxWidth: '300px' }}
             >
                <Download size={18} style={{ marginRight: '8px' }} /> DOWNLOAD PROTECTED FILE
             </button>
          </div>
        </div>
      )}

      {/* How to Use Article */}
      <div className="fullscreen-guide-wrapper" style={{ margin: '8rem -2rem -2rem -2rem', padding: '6rem 2rem', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', borderTop: '1px solid #e2e8f0' }}>
        <article className="how-to-use-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3rem', color: '#1e293b', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
              How to use <span style={{ color: '#0277bd' }}>Watermark Studio</span>
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
              Add a layer of security and branding to your videos and documents with our high-fidelity watermarking engine.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
            <div className="guide-step-card" style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.3s ease' }}>
              <div style={{ background: '#0277bd', color: 'white', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>1</div>
              <h3 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '1.2rem' }}>Upload Your Media</h3>
              <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Select a video file (MP4, WEBM) or a document (PDF) from your device. Our studio supports files up to 50MB for instant processing.
              </p>
            </div>

            <div className="guide-step-card" style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.3s ease' }}>
              <div style={{ background: '#0277bd', color: 'white', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>2</div>
              <h3 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '1.2rem' }}>Design the Mark</h3>
              <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Type in your brand name or upload your transparent logo image. Adjust the opacity and position to ensure it protects your content without blocking key areas.
              </p>
            </div>

            <div className="guide-step-card" style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.3s ease' }}>
              <div style={{ background: '#0277bd', color: 'white', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>3</div>
              <h3 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '1.2rem' }}>Process & Download</h3>
              <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Click "Apply & Protect". Our engine will merge the watermark into your file. Once finished, download the protected version ready for sharing.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default WatermarkEditor;
