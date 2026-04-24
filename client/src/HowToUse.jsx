import React from 'react';
import { 
  Download, 
  Zap, 
  Shield, 
  Cpu, 
  Layers, 
  Smartphone, 
  CheckCircle2, 
  HelpCircle,
  PlayCircle,
  FileText,
  Calculator,
  Image as ImageIcon,
  QrCode,
  Monitor
} from 'lucide-react';

const HowToUse = () => {
  return (
    <div className="how-to-use-page" style={{
      padding: '4rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#1e293b',
      textAlign: 'left'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '950', marginBottom: '1.5rem', letterSpacing: '-2px', lineHeight: '1.1' }}>
          Master <span className="highlight" style={{
            background: 'linear-gradient(135deg, #0277bd, #00c853)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Downloader Studio</span>
        </h1>
        <p style={{ opacity: 0.6, fontSize: '1.4rem', fontWeight: '500', maxWidth: '800px', margin: '0 auto' }}>
          Your comprehensive guide to using the world's most advanced AI-powered media workspace.
        </p>
      </header>

      {/* Core Workflow */}
      <section style={{ marginBottom: '6rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <PlayCircle size={40} color="var(--accent-green)" /> The Core Workflow
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          {[
            { step: 1, title: 'Extract URL', desc: 'Copy the link of any video or post from YouTube, Instagram, X, or Facebook.', icon: Smartphone },
            { step: 2, title: 'Analyze Media', desc: 'Paste the link and hit "Analyze". Our AI fetches all available quality formats instantly.', icon: Zap },
            { step: 3, title: 'Download & Save', desc: 'Choose your quality (up to 4K) or extract just the audio in high-quality MP3.', icon: Download },
          ].map((item) => (
            <div key={item.step} className="results-card" style={{ padding: '2.5rem', borderRadius: '32px', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', top: '-1.5rem', left: '2.5rem', 
                width: '3rem', height: '3rem', background: 'var(--accent-green)', 
                color: 'white', borderRadius: '50%', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem',
                boxShadow: '0 8px 16px rgba(0, 200, 83, 0.3)'
              }}>
                {item.step}
              </div>
              <item.icon size={32} style={{ marginBottom: '1.5rem', color: 'var(--accent-green)' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '800' }}>{item.title}</h3>
              <p style={{ opacity: 0.7, lineHeight: '1.8', fontSize: '1.05rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools Deep Dive */}
      <section style={{ marginBottom: '6rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '3rem' }}>Power Tools Deep Dive</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {[
            { title: 'AI Video Intelligence', icon: Cpu, desc: 'Generate full transcriptions and study notes from any video URL. Perfect for students and creators.' },
            { title: 'Image Compressor', icon: ImageIcon, desc: 'Optimize your images for the web without losing visual quality. Native processing for maximum speed.' },
            { title: 'Watermark Studio', icon: Layers, desc: 'Add or design custom watermarks to protect your intellectual property across videos and documents.' },
            { title: 'EMI Calculator', icon: Calculator, desc: 'Advanced financial planning with real-time interest breakdowns and exportable repayment schedules.' },
            { title: 'QR Generator', icon: QrCode, desc: 'Create branded QR codes for URLs, WiFi, or contact details with high-resolution downloads.' },
            { title: 'Screen Recorder', icon: Monitor, desc: 'Capture your screen and system audio directly from the browser with no software installation required.' }
          ].map((tool, index) => (
            <div key={index} style={{ 
              display: 'grid', gridTemplateColumns: '80px 1fr', gap: '2rem', 
              padding: '2.5rem', borderRadius: '24px', background: '#f8fafc',
              border: '1px solid #f1f5f9', transition: 'all 0.3s ease'
            }} className="hover-lift">
              <div style={{ 
                width: '80px', height: '80px', background: 'white', 
                borderRadius: '20px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', color: 'var(--accent-green)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <tool.icon size={36} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem' }}>{tool.title}</h3>
                <p style={{ opacity: 0.7, fontSize: '1.1rem', lineHeight: '1.7' }}>{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pro Tips Section */}
      <section style={{ 
        padding: '4rem', borderRadius: '40px', 
        background: 'linear-gradient(135deg, #1e293b, #0f172a)', 
        color: 'white', marginBottom: '6rem' 
      }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Zap size={32} color="#ffeb3b" /> Pro Tips for Power Users
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem' }}>
          <div style={{ borderLeft: '3px solid #ffeb3b', paddingLeft: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ffeb3b' }}>High Resolution</h4>
            <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.6' }}>Always look for the [Best] tag in the downloader to get the highest available resolution for your device.</p>
          </div>
          <div style={{ borderLeft: '3px solid #ffeb3b', paddingLeft: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ffeb3b' }}>Audio Extraction</h4>
            <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.6' }}>Use the MP3 option to convert long videos into podcasts or music files instantly.</p>
          </div>
          <div style={{ borderLeft: '3px solid #ffeb3b', paddingLeft: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ffeb3b' }}>Zero Logs</h4>
            <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.6' }}>Our platform processes everything in-memory. We do not store your private media links or downloads.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '3rem', textAlign: 'center' }}>
          <HelpCircle size={40} style={{ verticalAlign: 'middle', marginRight: '1rem', color: 'var(--accent-green)' }} /> 
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[
            { q: 'Is it free to use?', a: 'Yes, Downloader Studio.ai is a community project and is completely free to use for personal purposes.' },
            { q: 'Which sites are supported?', a: 'We support over 1,000+ sites including YouTube, Instagram (Reels & Stories), TikTok, Facebook, X (Twitter), and Pinterest.' },
            { q: 'What is the maximum download quality?', a: 'Depending on the source video, we support up to 4K (Ultra HD) resolution for most major platforms.' },
            { q: 'Do I need to install any software?', a: 'No. Everything works directly in your browser using our advanced server-side processing engine.' }
          ].map((faq, i) => (
            <div key={i} className="results-card" style={{ padding: '2rem', borderRadius: '24px' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: '#1e293b' }}>{faq.q}</h4>
              <p style={{ opacity: 0.7, fontSize: '1.05rem', lineHeight: '1.7' }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: '8rem', textAlign: 'center', opacity: 0.5 }}>
        <p>© 2026 Downloader Studio.ai Knowledge Base. Last updated: April 2026</p>
      </footer>
    </div>
  );
};

export default HowToUse;
