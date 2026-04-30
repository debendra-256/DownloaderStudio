import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Download, RefreshCcw, CheckCircle, AlertCircle, Trash2, Sparkles, ArrowRight } from 'lucide-react';

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
      maxWidth: '1300px',
      margin: '0 auto',
      color: '#1e293b',
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.03), transparent), radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.03), transparent)'
    }}>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {!selectedFile ? (
          <div 
            onClick={() => fileInputRef.current.click()}
            style={{
              border: '2px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '48px',
              padding: '3rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(30px)',
              boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.1), 0 20px 40px rgba(59, 130, 246, 0.05)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '600px',
              margin: '0 auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.15), 0 30px 60px rgba(59, 130, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59, 130, 246, 0.1), 0 20px 40px rgba(59, 130, 246, 0.05)';
            }}
          >
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              marginBottom: '1.5rem',
              boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
            }}>
              <Upload size={28} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.4rem', color: '#0f172a' }}>Tap to upload image</h2>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', fontWeight: '600' }}>JPEG, PNG, WEBP • Max 25MB</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>
        ) : (
          <div className="animate-premium" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
              {/* Preview Card */}
              <div style={{ 
                padding: '2rem', 
                borderRadius: '32px', 
                background: 'white', 
                border: '2px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.04)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ 
                  position: 'relative', 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  background: '#f8fafc', 
                  aspectRatio: '1.2', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '2rem',
                  border: '1px solid #f1f5f9'
                }}>
                  <img src={previewUrl} alt="Original" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  <div style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    right: '1rem', 
                    background: 'rgba(15, 23, 42, 0.9)', 
                    backdropFilter: 'blur(8px)', 
                    color: 'white', 
                    padding: '8px 16px', 
                    borderRadius: '100px', 
                    fontSize: '0.7rem', 
                    fontWeight: '800',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    ORIGINAL • {formatSize(originalSize)}
                  </div>
                </div>

                <div style={{ marginBottom: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', alignItems: 'center' }}>
                    <label style={{ fontWeight: '800', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Optimization Power</label>
                    <span style={{ 
                      color: '#3b82f6', 
                      fontWeight: '900', 
                      fontSize: '1.3rem',
                      background: 'rgba(59, 130, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '8px'
                    }}>{Math.round((1 - quality) * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1" 
                    value={quality} 
                    onChange={(e) => setQuality(parseFloat(e.target.value))} 
                    style={{ 
                      width: '100%', 
                      accentColor: '#3b82f6', 
                      cursor: 'pointer',
                      height: '6px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={compressImage} 
                    disabled={isCompressing}
                    className="download-btn" 
                    style={{ 
                      flex: 1, 
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                      padding: '1.2rem', 
                      borderRadius: '20px', 
                      boxShadow: '0 12px 30px rgba(59, 130, 246, 0.3)',
                      fontWeight: '800',
                      letterSpacing: '0.5px',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                  >
                    {isCompressing ? <RefreshCcw size={20} className="spin-hover" /> : <RefreshCcw size={20} />} 
                    {isCompressing ? 'ANALYZING...' : 'COMPRESS IMAGE'}
                  </button>
                  <button 
                    onClick={clearAll}
                    style={{ 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '20px', 
                      background: '#fff1f2', 
                      color: '#f43f5e', 
                      border: '1px solid #fecdd3', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(244, 63, 94, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ffe4e6';
                      e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff1f2';
                      e.currentTarget.style.transform = 'rotate(0deg)';
                    }}
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>

              {/* Results Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {compressedUrl ? (
                  <div style={{ 
                    padding: '2.5rem', 
                    borderRadius: '40px', 
                    textAlign: 'center', 
                    background: 'linear-gradient(145deg, #ffffff, #f0fdf4)', 
                    border: '2px solid #22c55e',
                    boxShadow: '0 30px 60px rgba(34, 197, 94, 0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: '-20px', 
                      right: '-20px', 
                      width: '100px', 
                      height: '100px', 
                      background: 'rgba(34, 197, 94, 0.05)', 
                      borderRadius: '50%',
                      filter: 'blur(30px)'
                    }}></div>

                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      background: '#22c55e', 
                      borderRadius: '22px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white', 
                      margin: '0 auto 1.5rem',
                      boxShadow: '0 12px 24px rgba(34, 197, 94, 0.25)'
                    }}>
                      <CheckCircle size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '0.5rem', color: '#064e3b' }}>Optimization Done!</h3>
                    <p style={{ opacity: 0.7, marginBottom: '2.5rem', fontWeight: '600', fontSize: '1.1rem' }}>
                      Shrunk by <span style={{ color: '#16a34a', fontWeight: '900' }}>{Math.round((1 - compressedSize / originalSize) * 100)}%</span>
                    </p>

                    <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', background: 'white', aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
                      <img src={compressedUrl} alt="Compressed" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '1rem', 
                        right: '1rem', 
                        background: 'rgba(34, 197, 94, 0.95)', 
                        backdropFilter: 'blur(10px)', 
                        color: 'white', 
                        padding: '8px 18px', 
                        borderRadius: '100px', 
                        fontSize: '0.75rem', 
                        fontWeight: '800',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }}>
                        NEW SIZE • {formatSize(compressedSize)}
                      </div>
                    </div>

                    <a 
                      href={compressedUrl} 
                      download={`optimized_${selectedFile.name}`} 
                      className="download-btn" 
                      style={{ 
                        width: '100%', 
                        padding: '1.3rem', 
                        borderRadius: '20px', 
                        background: '#22c55e',
                        fontWeight: '900',
                        fontSize: '1.05rem',
                        boxShadow: '0 12px 30px rgba(34, 197, 94, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                      }}
                    >
                      <Download size={22} /> DOWNLOAD NOW
                    </a>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '5rem 3rem', 
                    borderRadius: '40px', 
                    textAlign: 'center', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '2rem', 
                    background: 'white',
                    border: '2px dashed #e2e8f0',
                    opacity: 0.6,
                    height: '100%',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.01)'
                  }}>
                    <div style={{ 
                      width: '100px', 
                      height: '100px', 
                      background: '#f8fafc', 
                      borderRadius: '30px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#94a3b8' 
                    }}>
                      <ImageIcon size={48} />
                    </div>
                    <p style={{ fontWeight: '800', color: '#64748b', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>Result analysis will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Formats Banner */}
      <section style={{ marginTop: '6rem', position: 'relative', borderRadius: '48px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.06)' }}>
        <img 
          src="/images/image_formats_banner.png" 
          alt="Digital Image Formats" 
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '450px', objectFit: 'cover' }}
        />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8), transparent)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '4rem' 
        }}>
          <h2 style={{ color: 'white', fontSize: '3.5rem', fontWeight: '950', letterSpacing: '-2px', marginBottom: '1rem' }}>
            The Digital <span style={{ color: '#3b82f6' }}>Spectrum.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', maxWidth: '500px', lineHeight: '1.6' }}>
            Understanding the architecture of modern imagery and how to optimize every pixel for the future of the web.
          </p>
        </div>
      </section>

      {/* Educational Content Blocks */}
      <section style={{ marginTop: '8rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          {/* Block 1: What are images? */}
          <div style={{ padding: '3.5rem', borderRadius: '40px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '60px', height: '60px', background: '#eff6ff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '2rem' }}>
              <ImageIcon size={32} />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginBottom: '1.5rem' }}>What are Images?</h3>
            <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1.05rem' }}>
              Digital images are complex grids of millions of tiny squares called <strong>pixels</strong>. Each pixel stores color and intensity data, which your screen interprets to recreate visual reality. The more pixels an image has, the higher its resolution, but also its file size.
            </p>
          </div>

          {/* Block 2: Different Types */}
          <div style={{ padding: '3.5rem', borderRadius: '40px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '60px', height: '60px', background: '#f0fdf4', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '2rem' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginBottom: '1.5rem' }}>Image Formats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>JPEG:</strong> Best for photos with complex colors.
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>PNG:</strong> Ideal for graphics with transparency.
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>WebP:</strong> The modern standard for high compression.
              </div>
            </div>
          </div>

          {/* Block 3: Why Reduce Size? */}
          <div style={{ padding: '3.5rem', borderRadius: '40px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '60px', height: '60px', background: '#fff7ed', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '2rem' }}>
              <RefreshCcw size={32} />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginBottom: '1.5rem' }}>Why Reduce Size?</h3>
            <ul style={{ color: '#475569', lineHeight: '2', fontSize: '1.05rem', paddingLeft: '1.2rem' }}>
              <li><strong>Speed:</strong> Websites load up to 3x faster.</li>
              <li><strong>Storage:</strong> Save precious space on your devices.</li>
              <li><strong>SEO:</strong> Search engines rank optimized sites higher.</li>
              <li><strong>Cost:</strong> Reduce bandwidth and data transfer costs.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section style={{ 
        marginTop: '8rem', 
        padding: '5rem', 
        borderRadius: '48px', 
        background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
        color: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '3rem', fontWeight: '950', marginBottom: '1.5rem', letterSpacing: '-1.5px' }}>
          Why Use <span style={{ color: '#3b82f6' }}>Downloader Studio AI?</span>
        </h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.7, maxWidth: '800px', margin: '0 auto 4rem', lineHeight: '1.8' }}>
          We don't just "compress" files. Our local-first AI engine analyzes pixel density to find the perfect equilibrium between file size and visual fidelity.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem' }}>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem' }}>Privacy First</h4>
            <p style={{ opacity: 0.6 }}>Files never leave your browser. All processing is 100% local.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem' }}>Instant Results</h4>
            <p style={{ opacity: 0.6 }}>Sub-second compression using browser-native Canvas acceleration.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💎</div>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem' }}>Retina Quality</h4>
            <p style={{ opacity: 0.6 }}>Maintain HD clarity while achieving up to 90% size reduction.</p>
          </div>
        </div>
      </section>

      {/* Premium Blog Section (Existing) */}
      <section style={{ marginTop: '10rem', borderTop: '1px solid #f1f5f9', paddingTop: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '950', color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '-1.5px' }}>
            The Science of <span style={{ color: '#3b82f6' }}>Visual Integrity.</span>
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            Exploring how modern AI and browser-native compression technologies are redefining the digital experience.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '5rem', 
          alignItems: 'center',
          background: 'white',
          padding: '4rem',
          borderRadius: '48px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.03)',
          border: '1px solid #f8fafc'
        }}>
          <div>
            <img 
              src="/images/creative_ai_blog_image.png" 
              alt="AI Creative Visualization" 
              style={{ 
                width: '100%', 
                borderRadius: '32px', 
                boxShadow: '0 30px 60px rgba(59, 130, 246, 0.15)',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="blog-hero-img"
            />
          </div>
          <div>
            <span style={{ color: '#3b82f6', fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Editorial • May 2026</span>
            <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '1.5rem 0', lineHeight: '1.2' }}>
              Why Size Matters in the Era of Infinite Content
            </h3>
            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
              In a digital world where attention is the ultimate currency, speed is everything. A fraction of a second delay in page load can lead to a 20% drop in user engagement. That's where <strong>Downloader Studio's</strong> proprietary compression algorithms come in.
            </p>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#3b82f6' }}>90%</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Avg. Reduction</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#3b82f6' }}>0.2s</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Proc. Speed</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#3b82f6' }}>100%</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Local Security</div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', marginTop: '4rem' }}>
          {[
            { title: 'The SEO Advantage', desc: 'Google loves fast sites. Optimized images are your #1 way to boost Core Web Vitals.' },
            { title: 'Beyond PNG & JPG', desc: 'Understanding why WebP is the future of the web and how to leverage it today.' },
            { title: 'Privacy by Design', desc: 'Why client-side processing is the only way to ensure your sensitive media stays yours.' }
          ].map((post, i) => (
            <div key={i} style={{ padding: '3rem', borderRadius: '32px', background: '#f8fafc', border: '1px solid #f1f5f9', transition: 'all 0.3s' }} className="blog-card-hover">
              <h4 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem' }}>{post.title}</h4>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '1rem' }}>{post.desc}</p>
              <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: '700', cursor: 'pointer' }}>
                Read Article <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Responsive Styles (Inline) */}
      <style>{`
        @media (max-width: 768px) {
          .image-compressor-container { padding: 1.5rem !important; }
          section { padding: 2.5rem !important; margin-top: 5rem !important; }
          h2 { fontSize: 2.2rem !important; }
          h3 { fontSize: 1.5rem !important; }
          .blog-hero-img { marginBottom: 2rem; }
          div[style*="padding: 4rem"] { padding: 2rem !important; }
          div[style*="gridTemplateColumns: 1.2fr 1fr"] { gridTemplateColumns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ImageCompressor;
