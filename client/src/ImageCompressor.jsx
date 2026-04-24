import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Download, RefreshCcw, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

const ImageCompressor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setOriginalSize(file.size);
      setPreviewUrl(URL.createObjectURL(file));
      setCompressedUrl(null);
      setCompressedSize(0);
    }
  };

  const compressImage = () => {
    if (!selectedFile) return;
    setIsCompressing(true);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Maintain aspect ratio
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedUrl(URL.createObjectURL(blob));
              setCompressedSize(blob.size);
              setIsCompressing(false);
            }
          },
          selectedFile.type,
          quality
        );
      };
    };
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCompressedUrl(null);
    setOriginalSize(0);
    setCompressedSize(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="image-compressor-container" style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#1e293b'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-1px' }}>
          Image <span className="highlight" style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Compressor</span>
        </h1>
        <p style={{ opacity: 0.6, fontSize: '1.2rem', fontWeight: '500' }}>Optimize your images instantly without losing visual quality</p>
      </header>

      {!selectedFile ? (
        <div 
          onClick={() => fileInputRef.current.click()}
          style={{
            border: '3px dashed #e2e8f0',
            borderRadius: '32px',
            padding: '5rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <Upload size={64} style={{ color: '#3b82f6', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Click to Upload Image</h2>
          <p style={{ opacity: 0.5 }}>Supports JPG, PNG, WEBP up to 20MB</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
          {/* Preview & Controls */}
          <div className="results-card" style={{ padding: '2rem', borderRadius: '32px' }}>
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', background: '#f8fafc', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
              <img src={previewUrl} alt="Original" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700' }}>
                ORIGINAL: {formatSize(originalSize)}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label style={{ fontWeight: '700', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>Compression Quality</label>
                <span style={{ color: '#3b82f6', fontWeight: '800' }}>{Math.round(quality * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="1.0" 
                step="0.1" 
                value={quality} 
                onChange={(e) => setQuality(parseFloat(e.target.value))} 
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={compressImage} 
                disabled={isCompressing}
                className="download-btn" 
                style={{ flex: 1, background: 'linear-gradient(90deg, #3b82f6, #2563eb)', padding: '1rem', borderRadius: '16px' }}
              >
                {isCompressing ? <RefreshCcw className="spin-hover" /> : <RefreshCcw size={20} />} 
                {isCompressing ? 'Compressing...' : 'Compress Now'}
              </button>
              <button 
                onClick={clearAll}
                style={{ padding: '1rem', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer' }}
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {compressedUrl ? (
              <div className="results-card" style={{ padding: '2rem', borderRadius: '32px', textAlign: 'center', background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Compression Complete!</h3>
                <p style={{ opacity: 0.6, marginBottom: '2rem' }}>
                  Reduced by <span style={{ color: '#22c55e', fontWeight: '700' }}>{Math.round((1 - compressedSize / originalSize) * 100)}%</span>
                </p>

                <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', background: 'white', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                  <img src={compressedUrl} alt="Compressed" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(34, 197, 94, 0.9)', color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700' }}>
                    NEW SIZE: {formatSize(compressedSize)}
                  </div>
                </div>

                <a 
                  href={compressedUrl} 
                  download={`compressed_${selectedFile.name}`} 
                  className="download-btn" 
                  style={{ width: '100%', padding: '1.2rem', borderRadius: '16px', background: '#22c55e' }}
                >
                  <Download size={20} /> Download Compressed Image
                </a>
              </div>
            ) : (
              <div className="results-card" style={{ padding: '3rem', borderRadius: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', opacity: 0.5, border: '2px dashed #e2e8f0' }}>
                <ImageIcon size={48} />
                <p style={{ fontWeight: '600' }}>Compressed result will appear here</p>
              </div>
            )}

            <div className="results-card" style={{ padding: '2rem', borderRadius: '32px' }}>
              <h4 style={{ fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} style={{ color: '#3b82f6' }} /> Why use this?
              </h4>
              <ul style={{ paddingLeft: '1.5rem', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.8' }}>
                <li>Faster website loading speeds</li>
                <li>Reduce storage space consumption</li>
                <li>Easy sharing on social media & email</li>
                <li>Maintain high visual fidelity</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* How to Use Section for Image Compressor */}
      <article className="how-to-use-section" style={{ marginTop: '8rem', padding: '4rem 3rem', background: '#fcfcfc', borderRadius: '32px', border: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center', color: '#1e293b', fontWeight: '800' }}>How to use Image Compressor</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          <div>
            <h3 style={{ color: '#3b82f6', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
              <span style={{ background: '#3b82f6', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>1</span>
              Upload Image
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Click on the upload area or drag and drop your image files. We support JPG, PNG, and WebP formats up to 20MB.
            </p>
          </div>

          <div>
            <h3 style={{ color: '#3b82f6', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
              <span style={{ background: '#3b82f6', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>2</span>
              Set Quality
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Adjust the quality slider. A setting of 80% is usually perfect for maintaining visual clarity while significantly reducing file size.
            </p>
          </div>

          <div>
            <h3 style={{ color: '#3b82f6', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
              <span style={{ background: '#3b82f6', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>3</span>
              Compress & Save
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Click "Compress Now" to process your image. Once finished, preview the results and download your optimized file instantly.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '4rem', padding: '2rem', background: '#eff6ff', borderRadius: '20px', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '2rem' }}>⚡</div>
          <p style={{ margin: 0, fontSize: '1.05rem', color: '#1e40af', lineHeight: '1.6' }}>
            <strong>Optimization Tip:</strong> For web use, converting large PNG files to WebP or high-quality JPG can often reduce file sizes by over 90% with zero visible quality loss!
          </p>
        </div>
      </article>
    </div>
  );
};

export default ImageCompressor;
