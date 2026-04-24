import React from 'react';
import saveAs from 'file-saver';

const Downloader = ({ 
  url, setUrl, isLoading, handleLoadMedia, videoData, activeLoadingId, 
  handleDownloadFormat, handleDownloadAudioOriginal, formatSize, API_BASE,
  transcription, downloadPdf, handleExportZip, targetLanguage, setTargetLanguage,
  handleTranscribe, studyNote, aiNote, handleCreateStudyNote, voiceConfig, 
  setVoiceConfig, customVoices, handlePreviewVoice, handleCreateAudio, 
  cloneName, setCloneName, setCloneAudioFile, handleCloneVoice, generatedAudio
}) => {
  return (
    <div className="downloader-page animate-premium">
      <header className="hero">
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Ultimate <span className="highlight">Media Downloader</span></h1>
        <p className="hero-subtitle" style={{ fontSize: '1.2rem', color: '#64748b' }}>Download high-quality content from your favorite platforms instantly.</p>
        
        <div className="platform-badges" style={{ display: 'flex', gap: '20px', marginTop: '2rem', justifyContent: 'center', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            YouTube
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            Instagram
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X (Twitter)
          </div>
        </div>
      </header>

      <div className="search-container animate-premium" style={{ marginTop: '4rem' }}>
        <input
          type="text"
          placeholder="Paste video or post link here..."
          className="pill-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ 
            flex: 1,
            padding: '1rem 1.5rem', 
            fontSize: '1.2rem',
            border: 'none',
            background: 'transparent',
            outline: 'none'
          }}
        />
        <button 
           className="analyze-btn-premium"
           onClick={() => handleLoadMedia('video')}
           disabled={isLoading}
           style={{
             padding: '1rem 2.5rem',
             borderRadius: '40px',
             background: '#1e293b',
             color: 'white',
             border: 'none',
             cursor: 'pointer',
             fontWeight: '800',
             fontSize: '1rem',
             transition: 'all 0.2s ease',
             display: 'flex',
             alignItems: 'center',
             gap: '8px',
             whiteSpace: 'nowrap'
           }}
        >
          {isLoading ? '...' : 'DOWNLOAD ⚡'}
        </button>
      </div>

      <div className="button-group-mobile" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
        <button className="quick-action-chip" onClick={() => handleLoadMedia('audio')}>🎵 Extract MP3</button>
        <button className="quick-action-chip" onClick={() => handleLoadMedia('video')}>🎬 Get MP4</button>
        <button className="quick-action-chip" onClick={() => { setUrl(''); window.location.href='/ai-notes'; }}>🧠 AI Notes</button>
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
