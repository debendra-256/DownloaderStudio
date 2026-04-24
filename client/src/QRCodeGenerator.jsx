import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode, Link as LinkIcon, RefreshCw } from 'lucide-react';

const QRCodeGenerator = () => {
  const [value, setValue] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const qrRef = useRef();

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'qrcode.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="qrcode-page animate-premium" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <header className="hero" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
          Instant <span className="highlight">QR Generator</span>
        </h1>
        <p className="hero-subtitle" style={{ color: '#64748b' }}>
          Create professional, customizable QR codes for any link or text in seconds.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        {/* Left Side: Controls */}
        <div className="white-card premium-shadow" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: '#1e293b' }}>
              <LinkIcon size={16} style={{ marginRight: '8px' }} /> Enter Link or Text
            </label>
            <textarea
              placeholder="https://example.com"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="pill-input"
              style={{ 
                width: '100%', 
                height: '100px', 
                borderRadius: '16px', 
                padding: '1rem',
                border: '2px solid #e2e8f0',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: '#1e293b' }}>QR Color</label>
              <input 
                type="color" 
                value={qrColor} 
                onChange={(e) => setQrColor(e.target.value)}
                style={{ width: '100%', height: '45px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: '#1e293b' }}>Background</label>
              <input 
                type="color" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: '100%', height: '45px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
            </div>
          </div>

          <button 
            className="download-btn-main" 
            style={{ background: '#1e293b' }}
            onClick={() => setValue('')}
          >
            <RefreshCw size={18} style={{ marginRight: '8px' }} /> CLEAR ALL
          </button>
        </div>

        {/* Right Side: Preview */}
        <div className="white-card premium-shadow" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div 
            style={{ 
              padding: '2rem', 
              background: bgColor, 
              borderRadius: '24px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid #f1f5f9',
              marginBottom: '2rem'
            }}
            ref={qrRef}
          >
            {value ? (
              <QRCodeSVG 
                id="qr-code-svg"
                value={value} 
                size={size} 
                fgColor={qrColor} 
                bgColor={bgColor}
                level="H"
                includeMargin={false}
              />
            ) : (
              <div style={{ width: size, height: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                <QrCode size={80} strokeWidth={1} />
                <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Awaiting Input...</p>
              </div>
            )}
          </div>

          {value && (
            <button 
              className="download-btn-main" 
              onClick={downloadQRCode}
              style={{ background: '#10b981' }}
            >
              <Download size={18} style={{ marginRight: '8px' }} /> DOWNLOAD PNG
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Premium How to Use Section */}
      <div className="fullscreen-guide-wrapper" style={{ margin: '8rem -2rem -2rem -2rem', padding: '6rem 2rem', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', borderTop: '1px solid #e2e8f0' }}>
        <article className="how-to-use-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3rem', color: '#1e293b', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
              Mastering the <span style={{ color: '#0277bd' }}>QR Experience</span>
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
              Create, customize, and deploy professional QR codes for your business or personal projects with our advanced generation engine.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
            <div className="guide-step-card" style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.3s ease' }}>
              <div style={{ background: '#0277bd', color: 'white', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>1</div>
              <h3 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '1.2rem' }}>Enter Your URL</h3>
              <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Paste your website link, social media profile, or any text into the input field above. The QR code updates instantly as you type.
              </p>
            </div>

            <div className="guide-step-card" style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.3s ease' }}>
              <div style={{ background: '#0277bd', color: 'white', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>2</div>
              <h3 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '1.2rem' }}>Customize Design</h3>
              <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Match your brand by choosing custom colors for the QR pattern and background. Our generator ensures maximum scannability and reliability.
              </p>
            </div>

            <div className="guide-step-card" style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.3s ease' }}>
              <div style={{ background: '#0277bd', color: 'white', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>3</div>
              <h3 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '1.2rem' }}>Download & Share</h3>
              <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Click the download button to get a high-quality PNG file. You can then use this QR code on your business cards, flyers, or digital displays.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '5rem', padding: '3rem', background: '#1e293b', borderRadius: '40px', display: 'flex', alignItems: 'center', gap: '30px', color: 'white', boxShadow: '0 30px 60px rgba(30, 41, 59, 0.2)' }}>
            <div style={{ fontSize: '3rem' }}>💎</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Premium Scanning Technology</h4>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '1.1rem', lineHeight: '1.6' }}>
                Our QR engine generates SVG-native patterns that remain sharp at any scale. Whether it's a small business card or a massive outdoor banner, your QR code will always maintain perfect legibility.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
