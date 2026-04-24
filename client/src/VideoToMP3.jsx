import React, { useState } from 'react';
import { Music, Search, Download, RefreshCcw, Headphones, Share2, Globe, Video, Play, Radio } from 'lucide-react';
import saveAs from 'file-saver';

const API_BASE = ''; // Relative paths

const VideoToMP3 = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [audioResult, setAudioResult] = useState(null);

  const handleConvert = async () => {
    if (!url) return;
    setIsLoading(true);
    setAudioResult(null);
    setProgress(0);
    setStatus('Initializing AI Extraction...');

    // Improved simulated progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) {
          setStatus('Connecting to media servers...');
          return prev + 2;
        } else if (prev < 70) {
          setStatus('Downloading high-quality audio stream...');
          return prev + 0.5;
        } else if (prev < 90) {
          setStatus('Converting to 320kbps MP3 format...');
          return prev + 0.2;
        } else if (prev < 98) {
          setStatus('Finalizing file for download...');
          return prev + 0.05;
        }
        return prev;
      });
    }, 200);

    try {
      const response = await fetch(`${API_BASE}/api/audio-only`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (data.success) {
        setProgress(100);
        setStatus('Ready for download!');
        setAudioResult(data);
      } else {
        alert("Error converting to MP3: " + data.error);
        setProgress(0);
        setStatus('');
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect to backend. Please check your internet connection.");
      setProgress(0);
      setStatus('');
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const downloadAudio = () => {
    if (audioResult) {
      saveAs(`${API_BASE}${audioResult.audioUrl}`, audioResult.originalFilename || 'audio.mp3');
    }
  };

  return (
    <div className="video-to-mp3-page" style={{
      padding: '4rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#1e293b',
      textAlign: 'center'
    }}>
      {/* Global Progress Bar */}
      {progress > 0 && progress < 100 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '6px',
          background: 'rgba(241, 245, 249, 0.5)',
          zIndex: 9999
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #f43f5e, #fb7185)',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 15px rgba(244, 63, 94, 0.6)'
          }}></div>
        </div>
      )}

      <header style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '950', marginBottom: '1.5rem', letterSpacing: '-2px' }}>
          Video to <span className="highlight" style={{
            background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>MP3 Converter</span>
        </h1>
        <p style={{ opacity: 0.6, fontSize: '1.4rem', fontWeight: '500', maxWidth: '700px', margin: '0 auto' }}>
          Extract high-quality audio from any video platform in seconds.
        </p>
      </header>

      <div className="search-container" style={{
        maxWidth: '900px',
        margin: '0 auto 1rem',
        padding: '12px',
        background: 'white',
        borderRadius: '100px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid #f1f5f9',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '0 1.5rem', color: '#f43f5e' }}>
           <Search size={28} />
        </div>
        <input 
          type="text" 
          placeholder="Paste YouTube, X, Insta, or FB video link..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '1.25rem',
            padding: '1rem 0',
            fontWeight: '500',
            color: '#1e293b'
          }}
        />
        <button 
          onClick={handleConvert}
          disabled={isLoading || !url}
          className="download-btn"
          style={{
            background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
            padding: '1.2rem 2.5rem',
            borderRadius: '50px',
            fontSize: '1.1rem',
            fontWeight: '800',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'all 0.3s ease',
            minWidth: '220px',
            justifyContent: 'center'
          }}
        >
          {isLoading ? <RefreshCcw size={24} className="spin-hover" /> : <Music size={24} />}
          {isLoading ? 'PROCESSING...' : 'CONVERT NOW'}
        </button>
      </div>

      <div style={{ height: '2rem', marginBottom: '4rem' }}>
        {isLoading && (
          <p style={{ color: '#f43f5e', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
             {status} ({Math.round(progress)}%)
          </p>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '6rem', opacity: 0.4 }}>
        <Globe size={32} />
        <Video size={32} />
        <Play size={32} />
        <Radio size={32} />
        <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>1000+ Sites</span>
      </div>

      {audioResult && (
        <div className="results-card animate-premium" style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '3rem',
          borderRadius: '40px',
          background: 'white',
          boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
          textAlign: 'center',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: '#fff1f2',
            color: '#f43f5e',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <Headphones size={48} />
          </div>
          
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {audioResult.originalFilename || 'Audio Extracted Successfully'}
          </h3>
          <p style={{ opacity: 0.5, marginBottom: '2.5rem', fontWeight: '600' }}>High Quality MP3 • 320kbps</p>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <button 
              onClick={downloadAudio}
              className="download-btn"
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                padding: '1.5rem',
                borderRadius: '24px',
                fontSize: '1.2rem',
                boxShadow: '0 10px 20px rgba(244, 63, 94, 0.2)'
              }}
            >
              <Download size={24} /> Download MP3
            </button>
            <button 
              className="download-btn audio-btn"
              style={{
                padding: '1.5rem 2.5rem',
                borderRadius: '24px',
                background: '#1e293b'
              }}
            >
              <Share2 size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <section style={{ marginTop: '8rem', padding: '4rem 2rem', background: '#fff1f2', borderRadius: '40px', border: '1px solid #ffe4e6' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '3rem', color: '#9f1239' }}>How to Convert Video to MP3</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
          <div>
            <div style={{ width: '48px', height: '48px', background: '#f43f5e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '900', margin: '0 auto 1.5rem' }}>1</div>
            <h4 style={{ fontWeight: '800', marginBottom: '1rem' }}>Copy URL</h4>
            <p style={{ opacity: 0.7, lineHeight: '1.6' }}>Copy the link of the video you want to convert from any supported platform.</p>
          </div>
          <div>
            <div style={{ width: '48px', height: '48px', background: '#f43f5e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '900', margin: '0 auto 1.5rem' }}>2</div>
            <h4 style={{ fontWeight: '800', marginBottom: '1rem' }}>Paste & Process</h4>
            <p style={{ opacity: 0.7, lineHeight: '1.6' }}>Paste the link into the search bar above and click on "Convert Now".</p>
          </div>
          <div>
            <div style={{ width: '48px', height: '48px', background: '#f43f5e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '900', margin: '0 auto 1.5rem' }}>3</div>
            <h4 style={{ fontWeight: '800', marginBottom: '1rem' }}>Get MP3</h4>
            <p style={{ opacity: 0.7, lineHeight: '1.6' }}>Wait a few seconds for our AI to extract the audio and hit the download button.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VideoToMP3;
