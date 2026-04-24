import React, { useState } from 'react';
import { 
  Calculator, 
  Image, 
  FileText, 
  Music, 
  Download, 
  Trash2, 
  Monitor, 
  QrCode, 
  Link, 
  Merge, 
  Split, 
  Type, 
  FilePlus, 
  Search,
  Clock,
  Layers,
  CheckCircle, 
  Star, 
  Zap, 
  Shield, 
  PlayCircle, 
  HelpCircle
} from 'lucide-react';
import './Dashboard.css';

const TOOLS = [
  { id: 'age-calc', title: 'Age Calculator', icon: Clock, description: 'Calculate exact age in years, months, and days.' },
  { id: 'emi-calc', title: 'EMI Calculator', icon: Calculator, description: 'Calculate your monthly loan repayments easily.' },
  { id: 'img-compress', title: 'Image Compressor', icon: Image, description: 'Reduce image file size without losing quality.' },
  { id: 'pdf-editor', title: 'PDF Editor', icon: FileText, description: 'Edit text, images, and pages in your PDF files.' },
  { id: 'v-to-mp3', title: 'Video to MP3', icon: Music, description: 'Extract high-quality audio from any video.' },
  { id: 'downloader', title: 'Downloader', icon: Download, description: 'Download media from YouTube, IG, and Twitter.' },
  { id: 'watermark-rem', title: 'Watermark Remover', icon: Trash2, description: 'Remove unwanted watermarks from your videos.' },
  { id: 'screen-rec', title: 'Screen Recorder', icon: Monitor, description: 'Record your screen with high resolution and audio.' },
  { id: 'qr-gen', title: 'QR Code Generator', icon: QrCode, description: 'Create custom QR codes for any link or text.' },
  { id: 'url-shortener', title: 'URL Shortener', icon: Link, description: 'Shorten long URLs into manageable links.' },
  { id: 'merge-pdf', title: 'Merge PDF', icon: Merge, description: 'Combine multiple PDF files into one document.' },
  { id: 'split-pdf', title: 'Split PDF', icon: Split, description: 'Split a PDF into separate pages or sections.' },
  { id: 'add-watermark', title: 'Add Watermark', icon: Layers, description: 'Protect your content with custom watermarks.' },
  { id: 'notes-from-v', title: 'Video Notes', icon: FilePlus, description: 'Generate AI study notes from any video URL.' },
  { id: 'sub-gen', title: 'Subtitle Generator', icon: Type, description: 'Automatically generate subtitles for your videos.' },
];

const ToolCard = ({ title, icon: Icon, description, onClick }) => (
  <div className="tool-card" onClick={onClick}>
    <div className="icon-wrapper">
      <Icon size={32} />
    </div>
    <h3 className="tool-title">{title}</h3>
    <p className="tool-description">{description}</p>
  </div>
);

const Dashboard = ({ onSelectTool }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = TOOLS.filter(tool => 
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <div className="search-bar-wrapper">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Search for a tool (e.g. PDF, Video...)" 
          className="dashboard-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="tools-grid">
        {filteredTools.map((tool) => (
          <ToolCard 
            key={tool.id}
            title={tool.title}
            icon={tool.icon}
            description={tool.description}
            onClick={() => onSelectTool(tool.id)}
          />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.5 }}>
          <p>No tools found matching your search.</p>
        </div>
      )}

      {/* Premium User Guide Section - Apowersoft Inspired */}
      <div style={{ marginTop: '6rem', paddingTop: '4rem', borderTop: '1px solid #f1f5f9' }}>
        
        {/* Step-by-Step Guide */}
        <section style={{ marginBottom: '6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>One-click to start using tools without installation</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Select any tool from our comprehensive suite to process your media effortlessly right in your browser.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            <div style={{ textAlign: 'center', padding: '2rem', background: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f8fafc' }}>
              <div style={{ width: '64px', height: '64px', background: '#0277bd', color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>1</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>Select a Tool</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>Browse the grid above and click on the tool that fits your current media editing or processing needs.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem', background: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f8fafc' }}>
              <div style={{ width: '64px', height: '64px', background: '#0277bd', color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>2</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>Process Your File</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>Upload your media or paste your link. Our advanced AI and client-side processing will handle the rest.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem', background: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f8fafc' }}>
              <div style={{ width: '64px', height: '64px', background: '#0277bd', color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>3</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>Export & Share</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>Instantly download your high-quality output to your local disk, completely free and securely processed.</p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section style={{ marginBottom: '6rem', padding: '4rem', background: '#f8fafc', borderRadius: '40px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '3rem', textAlign: 'center' }}>Why Choose Downloader Studio</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Zap size={32} color="#0277bd" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>Lightning Fast Processing</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>We utilize cutting-edge browser-native technologies and optimized backend servers to ensure your tools run instantly.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Shield size={32} color="#0277bd" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>100% Secure & Private</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>Many of our tools run entirely in your browser. When server processing is required, your files are never logged or stored permanently.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Star size={32} color="#0277bd" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>Free & Unlimited</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>Enjoy a professional suite of tools without a time limit or hidden fees. We believe premium software should be accessible to everyone.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <CheckCircle size={32} color="#0277bd" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>No Watermarks</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>Export your videos, compressed images, and PDFs in HD quality without any forced branding or watermarks ruining your content.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section style={{ maxWidth: '800px', margin: '0 auto 4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <HelpCircle size={36} color="#0277bd" /> FAQS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Do I need to install any software?</h4>
              <p style={{ color: '#64748b' }}>No. Downloader Studio is a 100% web-based application. Everything runs directly in your Chrome, Edge, or Safari browser.</p>
            </div>
            <div style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Which platforms are supported by the Media Downloader?</h4>
              <p style={{ color: '#64748b' }}>We currently support high-quality extractions from over 1,000+ sites, prominently including YouTube, X (Twitter), Facebook, and Instagram.</p>
            </div>
            <div style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Are my uploaded files safe?</h4>
              <p style={{ color: '#64748b' }}>Yes. Tools like the Image Compressor and QR Generator work entirely offline on your device. For server-backed tools, files are automatically cleared from our servers immediately after your download finishes.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
