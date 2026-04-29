import React from 'react';
import saveAs from 'file-saver';

const Downloader = ({ 
  url, setUrl, isLoading, handleLoadMedia, videoData, activeLoadingId, 
  handleDownloadFormat, handleDownloadAudioOriginal, formatSize, API_BASE,
  transcription, downloadPdf, handleExportZip, targetLanguage, setTargetLanguage,
  handleTranscribe, studyNote, aiNote, handleCreateStudyNote, voiceConfig, 
  setVoiceConfig, customVoices, handlePreviewVoice, handleCreateAudio, 
  cloneName, setCloneName, setCloneAudioFile, handleCloneVoice, generatedAudio,
  handleInstallApp, isInstallAvailable
}) => {
  return (
    <div className="downloader-page animate-premium">
      <header className="hero" style={{ padding: '6rem 2rem 4rem', background: 'var(--bg-gradient)' }}>
        <h1 style={{ fontSize: '4.5rem', fontWeight: '800', color: 'var(--zoom-dark)', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
          Media <span style={{ color: 'var(--zoom-blue)' }}>Downloader.</span>
        </h1>
        <p style={{ fontSize: '1.4rem', color: 'var(--zoom-gray)', maxWidth: '800px', margin: '0 auto 4rem', lineHeight: '1.5' }}>
          High-speed extraction from your favorite platforms. Instantly save video and audio to your device.
        </p>

        <div className="search-container">
          <input
            type="text"
            placeholder="Paste your video or post link here..."
            className="pill-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button 
             className="download-btn"
             onClick={() => handleLoadMedia('video')}
             disabled={isLoading}
          >
            {isLoading ? '...' : 'Get Started ⚡'}
          </button>
        </div>

        <div className="button-group-mobile" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="quick-action-chip" style={{ background: '#F5F5F7', color: '#1e293b', padding: '0.8rem 1.5rem', borderRadius: '100px', border: '1px solid #E2E2E7' }} onClick={() => handleLoadMedia('audio')}>🎵 MP3 Extract</button>
          <button className="quick-action-chip" style={{ background: '#F5F5F7', color: '#1e293b', padding: '0.8rem 1.5rem', borderRadius: '100px', border: '1px solid #E2E2E7' }} onClick={() => handleLoadMedia('video')}>🎬 MP4 Video</button>
        </div>

        {/* Zoom-style Trust Bar */}
        <div style={{ marginTop: '6rem', borderTop: '1px solid #E2E2E7', paddingTop: '3rem' }}>
          <p style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '800', color: 'var(--zoom-gray)', letterSpacing: '2px', marginBottom: '2rem' }}>Trusted by Industry Leaders</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', opacity: 0.5, filter: 'grayscale(100%)', flexWrap: 'wrap' }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" height="24" alt="google" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" height="24" alt="facebook" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" height="24" alt="amazon" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" height="24" alt="netflix" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" height="24" alt="microsoft" />
          </div>
        </div>
      </header>

      {/* Installer Section (Redesigned for Zoom Theme) */}
      <div style={{ background: '#F5F5F7', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem' }}>Work from Anywhere</h2>
          <p style={{ color: 'var(--zoom-gray)', marginBottom: '3rem', fontSize: '1.1rem' }}>Download our desktop client for a faster, more integrated experience.</p>
          
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
             <button 
                onClick={handleInstallApp}
                style={{ 
                  background: 'var(--zoom-blue)', 
                  color: 'white', 
                  padding: '1rem 2.5rem', 
                  borderRadius: '100px', 
                  border: 'none', 
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/10/Google_Chrome_icon_%282022%29.svg" width="20" alt="chrome" />
                Install Chrome App
              </button>
              <a 
                href="/DownloaderStudioSetup.exe" 
                style={{ 
                  background: 'white', 
                  color: 'var(--zoom-dark)', 
                  padding: '1rem 2.5rem', 
                  borderRadius: '100px', 
                  border: '1px solid #E2E2E7', 
                  fontWeight: '700',
                  fontSize: '1rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>
                Download EXE
              </a>
          </div>
        </div>
      </div>

      {videoData && (
        <div className="result-container animate-premium" style={{ marginTop: '4rem' }}>
          {/* Result Content */}
          <div className="white-card premium-shadow">
            <div className="video-info-grid">
              <div className="thumbnail-area">
                <div className="thumbnail-wrap">
                  {videoData.videoUrl && videoData.videoUrl.startsWith('/uploads') ? (
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
                <div style={{ marginTop: '1.5rem' }}>
                  <button 
                    className="download-btn-secondary" 
                    onClick={handleDownloadAudioOriginal}
                  >
                     🎵 Download Original Audio
                  </button>
                </div>
              </div>

              <div className="info-content">
                <h2 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '1.5rem' }}>{videoData.title || "Detected Video Content"}</h2>
                
                <div className="premium-table-wrapper">
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
                        .filter(f => f.vcodec && f.vcodec !== 'none') 
                        .map((f, i) => (
                        <tr key={i}>
                          <td><strong>{f.quality || f.resolution}</strong></td>
                          <td><span className="badge-format">{f.ext && f.ext.toUpperCase()}</span></td>
                          <td>{formatSize(f.filesize)}</td>
                          <td>
                            <button 
                              className="table-btn-premium" 
                              onClick={() => handleDownloadFormat(f.format_id)}
                              disabled={isLoading}
                            >
                              {isLoading && activeLoadingId === f.format_id ? 'Wait...' : 'DOWNLOAD'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {videoData.videoUrl && videoData.videoUrl.startsWith('/uploads') && (
                  <div style={{ marginTop: '2rem' }}>
                    <button 
                      className="download-btn-main"
                      onClick={() => {
                        const cleanTitle = (videoData.title || 'video').replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
                        saveAs(`${API_BASE}${videoData.videoUrl}`, `${cleanTitle}.mp4`);
                      }}
                    >
                       🚀 DOWNLOAD TO MY DEVICE
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Intelligence Hub (same as before) */}
          {transcription && (
            <div className="fullscreen-ai-card animate-premium" style={{ marginTop: '3rem' }}>
               {/* ... (rest of AI hub remains unchanged for logic consistency) ... */}
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
              
              {/* Voice Module */}
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
                 {generatedAudio && (
                   <audio controls src={generatedAudio} style={{ width: '100%', marginTop: '2rem' }} />
                 )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* How to Use Section */}
      <article className="how-to-use-section" style={{ marginTop: '8rem', padding: '4rem 3rem', background: '#fcfcfc', borderRadius: '32px', border: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center', color: '#1e293b', fontWeight: '800' }}>How to use Media Downloader</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          <div>
            <h3 style={{ color: '#0277bd', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
              <span style={{ background: '#0277bd', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>1</span>
              Copy the Link
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Navigate to YouTube, Instagram, Facebook, or X. Copy the URL of the video, reel, or post you want to save.
            </p>
          </div>

          <div>
            <h3 style={{ color: '#0277bd', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
              <span style={{ background: '#0277bd', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>2</span>
              Paste and Analyze
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Paste the link into the search box above. Click <strong>Analyze ⚡</strong> to fetch all available quality formats and metadata.
            </p>
          </div>

          <div>
            <h3 style={{ color: '#0277bd', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
              <span style={{ background: '#0277bd', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>3</span>
              Choose and Save
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Select your desired quality (720p, 1080p, etc.) or choose MP3 for audio only. Your file will be processed and downloaded instantly.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '4rem', padding: '2rem', background: '#e3f2fd', borderRadius: '20px', border: '1px solid #bbdefb', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '2rem' }}>💡</div>
          <p style={{ margin: 0, fontSize: '1.05rem', color: '#01579b', lineHeight: '1.6' }}>
            <strong>Advanced Tip:</strong> Want to study the video? Use the <strong>AI Notes</strong> chip to generate a full transcription and summary of any video in seconds!
          </p>
        </div>
      </article>
    </div>
  );
};

export default Downloader;
