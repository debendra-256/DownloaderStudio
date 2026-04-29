import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MessageSquare, 
  Users, 
  Settings, 
  PhoneOff, 
  Calendar, 
  Share2, 
  Mail, 
  MessageCircle, 
  Copy,
  Clock,
  MoreVertical,
  Layers,
  Layout,
  Camera,
  Download
} from 'lucide-react';
import './Meeting.css';

const Meeting = () => {
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [meetingId, setMeetingId] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [virtualBg, setVirtualBg] = useState('none');
  
  const localVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Generate a random meeting ID
  useEffect(() => {
    const id = Math.random().toString(36).substring(2, 10).toUpperCase();
    setMeetingId(id);
  }, []);

  const handleJoin = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsJoined(true);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Please allow camera and microphone access to join the meeting.");
    }
  };

  const toggleMic = () => {
    const stream = localVideoRef.current.srcObject;
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    const stream = localVideoRef.current.srcObject;
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsCameraOff(!isCameraOff);
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      const stream = localVideoRef.current.srcObject;
      if (!stream) return;
      
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-record-${meetingId}.webm`;
        a.click();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  };

  const shareViaWhatsApp = () => {
    const text = `Join my Zoom-AI meeting!\nLink: https://downloader-studio.ai/meeting/${meetingId}\nMeeting ID: ${meetingId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = "Meeting Invitation";
    const body = `You are invited to a Zoom-AI meeting.\n\nLink: https://downloader-studio.ai/meeting/${meetingId}\nMeeting ID: ${meetingId}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyLink = () => {
    const link = `https://downloader-studio.ai/meeting/${meetingId}`;
    navigator.clipboard.writeText(link);
    alert("Meeting link copied to clipboard!");
  };

  return (
    <div className="meeting-workspace">
      {!isJoined ? (
        <div className="meeting-lobby animate-premium">
          <div className="lobby-content">
             <div className="lobby-video-preview">
                {!isCameraOff ? (
                  <div className="camera-placeholder">
                    <Camera size={64} color="var(--zoom-blue)" />
                    <p>Camera is starting...</p>
                  </div>
                ) : (
                  <div className="camera-off-msg">Camera is Off</div>
                )}
             </div>
             <div className="lobby-controls">
                <h1>Ready to Join?</h1>
                <p>Meeting ID: <span className="highlight-id">{meetingId}</span></p>
                <div className="lobby-buttons">
                   <button className="lobby-btn btn-secondary" onClick={() => setIsCameraOff(!isCameraOff)}>
                      {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
                   </button>
                   <button className="lobby-btn btn-secondary" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                   </button>
                </div>
                <button className="join-btn-primary" onClick={handleJoin}>Join Meeting Now</button>
                <div className="lobby-extra">
                   <button onClick={() => setShowScheduleModal(true)}><Calendar size={18} /> Schedule for later</button>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="meeting-room">
          <header className="meeting-header">
             <div className="meeting-info">
                <span className="meeting-status-dot"></span>
                <span>Meeting: {meetingId}</span>
                <span className="rec-indicator" style={{ display: isRecording ? 'flex' : 'none' }}>
                   <span className="rec-dot"></span> REC
                </span>
             </div>
             <div className="meeting-top-btns">
                <button className="header-icon-btn" onClick={() => setShowInviteModal(true)}><Share2 size={18} /></button>
                <button className="header-icon-btn"><Settings size={18} /></button>
             </div>
          </header>

          <main className="meeting-main">
             <div className="video-grid">
                <div className="video-container primary-video">
                   <video 
                     ref={localVideoRef} 
                     autoPlay 
                     muted={isMuted} 
                     className={`local-video ${virtualBg !== 'none' ? 'with-filter' : ''}`}
                     style={{ filter: virtualBg === 'blur' ? 'blur(10px)' : virtualBg === 'grayscale' ? 'grayscale(1)' : 'none' }}
                   />
                   <div className="video-label">You (Host)</div>
                </div>
             </div>

             {chatOpen && (
               <div className="meeting-sidebar animate-slide-in">
                  <div className="sidebar-header">
                     <h3>Chat</h3>
                     <button onClick={() => setChatOpen(false)}>&times;</button>
                  </div>
                  <div className="chat-messages">
                     <div className="msg-system">Welcome to the meeting!</div>
                  </div>
                  <div className="chat-input">
                     <input type="text" placeholder="Type message..." />
                  </div>
               </div>
             )}
          </main>

          <footer className="meeting-toolbar">
             <div className="toolbar-left">
                <div className="control-group">
                   <button className={`control-btn ${isMuted ? 'active' : ''}`} onClick={toggleMic}>
                      {isMuted ? <MicOff /> : <Mic />}
                      <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                   </button>
                   <button className={`control-btn ${isCameraOff ? 'active' : ''}`} onClick={toggleCamera}>
                      {isCameraOff ? <VideoOff /> : <Video />}
                      <span>{isCameraOff ? 'Start Video' : 'Stop Video'}</span>
                   </button>
                </div>
             </div>

             <div className="toolbar-center">
                <button className="control-btn" onClick={() => setShowInviteModal(true)}>
                   <Users />
                   <span>Participants</span>
                </button>
                <button className="control-btn" onClick={() => setChatOpen(!chatOpen)}>
                   <MessageSquare />
                   <span>Chat</span>
                </button>
                <button className="control-btn">
                   <Monitor />
                   <span>Share Screen</span>
                </button>
                <button className={`control-btn ${isRecording ? 'recording' : ''}`} onClick={handleRecord}>
                   <Download />
                   <span>{isRecording ? 'Stop Rec' : 'Record'}</span>
                </button>
                <div className="toolbar-divider"></div>
                <div className="bg-dropdown">
                   <button className="control-btn">
                      <Layers />
                      <span>Background</span>
                   </button>
                   <div className="bg-options">
                      <div onClick={() => setVirtualBg('none')}>None</div>
                      <div onClick={() => setVirtualBg('blur')}>Blur</div>
                      <div onClick={() => setVirtualBg('grayscale')}>B&W</div>
                   </div>
                </div>
             </div>

             <div className="toolbar-right">
                <button className="leave-btn" onClick={() => window.location.reload()}>End Meeting</button>
             </div>
          </footer>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="meeting-modal-overlay" onClick={() => setShowInviteModal(false)}>
           <div className="meeting-modal" onClick={e => e.stopPropagation()}>
              <h2>Invite People</h2>
              <p>Share this link with participants to join your meeting.</p>
              <div className="link-copy-box">
                 <code>https://downloader-studio.ai/meeting/{meetingId}</code>
                 <button onClick={copyLink}><Copy size={16} /></button>
              </div>
              <div className="invite-actions">
                 <button className="invite-option wa" onClick={shareViaWhatsApp}>
                    <MessageCircle size={24} /> WhatsApp
                 </button>
                 <button className="invite-option mail" onClick={shareViaEmail}>
                    <Mail size={24} /> Email
                 </button>
              </div>
              <button className="modal-close-btn" onClick={() => setShowInviteModal(false)}>Close</button>
           </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="meeting-modal-overlay" onClick={() => setShowScheduleModal(false)}>
           <div className="meeting-modal" onClick={e => e.stopPropagation()}>
              <h2>Schedule Meeting</h2>
              <div className="schedule-form">
                 <div className="form-group">
                    <label>Meeting Topic</label>
                    <input type="text" defaultValue="New AI Strategy Meeting" />
                 </div>
                 <div className="form-group">
                    <label>Date & Time</label>
                    <input type="datetime-local" />
                 </div>
                 <button className="join-btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => {
                   alert("Meeting Scheduled and added to Google Calendar!");
                   setShowScheduleModal(false);
                 }}>Add to Calendar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Meeting;
