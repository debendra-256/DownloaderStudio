const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Initialize env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage for temporary uploads
const upload = multer({ dest: 'uploads/' });

// Ensure uploads dir exists
if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
  fs.mkdirSync(path.join(__dirname, '../uploads'), { recursive: true });
}

// Serve uploaded/downloaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend build
const clientBuildPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    // Only serve index.html for non-API routes
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const videoService = require('./services/videoService');
const aiService = require('./services/aiService');
const { clearUploadFolder } = require('./services/cleanupService');

// Analyze URL and return metadata + formats
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const info = await videoService.getVideoInfo(url);
    res.json({
      success: true,
      ...info,
      // No videoUrl yet
      videoUrl: null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/api/download', async (req, res) => {
  const { url, formatId } = req.body;

  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const uploadDir = path.join(__dirname, '../uploads');

    const result = await videoService.downloadVideo(
      url,
      uploadDir,
      formatId || 'bestvideo+bestaudio/best'
    );

    res.json({
      success: true,
      videoUrl: `/api/download-file/${encodeURIComponent(result.filename)}`, // ✅ FIXED
      originalFilename: result.filename // ✅ unchanged
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/download-file/:filename', (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    // 🔥 This is the actual fix
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) res.status(500).send('Error downloading file');
      } else {
        console.log(`[Server] Download completed for ${filename}. Executing cleanup routine...`);
        // clearUploadFolder(path.join(__dirname, '../uploads'));
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// // Actual Download route for specific format
// app.post('/api/download', async (req, res) => {
//   const { url, formatId } = req.body;
//   if (!url) return res.status(400).json({ error: 'URL required' });

//   try {
//     const uploadDir = path.join(__dirname, '../uploads');
//     const result = await videoService.downloadVideo(url, uploadDir, formatId || 'bestvideo+bestaudio/best');
//     res.json({
//       success: true,
//       videoUrl: `/uploads/${encodeURIComponent(result.filename)}`,
//       originalFilename: result.filename
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// Original Audio only route
app.post('/api/audio-only', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const uploadDir = path.join(__dirname, '../uploads');
    const result = await videoService.downloadAudioOnly(url, uploadDir);
    res.json({ success: true, audioUrl: `/api/download-file/${encodeURIComponent(result.filename)}`, originalFilename: result.filename });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transcribe and Extract Images
app.post('/api/transcribe', async (req, res) => {
  const { url, targetLanguage } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const uploadDir = path.join(__dirname, '../uploads');

    // 1. Download
    const downloadResult = await videoService.downloadVideo(url, uploadDir);
    const videoPath = path.join(uploadDir, downloadResult.filename);

    // 2. Extract Audio
    console.log('Extracting audio from:', videoPath);
    const audioFilename = `audio_${Date.now()}.mp3`;
    const audioPath = path.join(uploadDir, audioFilename);
    await videoService.extractAudio(videoPath, audioPath);

    // 3. Transcribe Audio (Base English)
    console.log('Starting transcription for:', audioPath);
    let transcription = await aiService.transcribeAudio(audioPath);
    console.log('Transcription successful.');

    // 4. Analyze to Note
    let aiNote = await aiService.generateSummary(transcription);
    let finalVideoFilename = downloadResult.filename;

    // X. Optional Translations & Dubbing
    if (targetLanguage && targetLanguage !== 'English') {
      transcription = await aiService.translateText(transcription, targetLanguage);
      aiNote = await aiService.translateText(aiNote, targetLanguage);

      // Render TTS
      const syntheticAudioName = `dub_${Date.now()}.mp3`;
      const syntheticAudioPath = path.join(uploadDir, syntheticAudioName);
      await aiService.generateSpeech(transcription, syntheticAudioPath);

      // Dub Video
      const dubbedVideoName = `dubbed_${Date.now()}.mp4`; // or mkv depending on source, mp4 is safer browser fallback
      const dubbedVideoPath = path.join(uploadDir, dubbedVideoName);
      await videoService.dubVideo(videoPath, syntheticAudioPath, dubbedVideoPath);

      finalVideoFilename = dubbedVideoName; // Replace original stream with dubbed version
    }

    // 5. Extract Thumbnails/Images
    const imagePrefix = `frame_${Date.now()}`;
    const images = await videoService.extractFrames(videoPath, uploadDir, imagePrefix);

    res.json({
      success: true,
      transcription,
      aiNote,
      videoUrl: `/uploads/${encodeURIComponent(finalVideoFilename)}`,
      audioUrl: `/uploads/${encodeURIComponent(audioFilename)}`,
      originalFilename: finalVideoFilename,
      images: images.map(img => `/uploads/${encodeURIComponent(img)}`)
    });
  } catch (error) {
    console.error("Transcription pipeline error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Deep Study Note
app.post('/api/generate-study-note', async (req, res) => {
  const { transcription } = req.body;
  if (!transcription) return res.status(400).json({ error: 'Transcription text required' });

  try {
    const studyNote = await aiService.generateStudyNote(transcription);
    res.json({ success: true, studyNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Pitch-Shifted TTS
app.post('/api/generate-audio', async (req, res) => {
  const { text, voiceConfig } = req.body; // e.g. { voice: 'nova', pitch: 1.15 }
  if (!text) return res.status(400).json({ error: 'Text required' });

  try {
    const uploadDir = path.join(__dirname, '../uploads');
    const baseAudioPath = path.join(uploadDir, `tts_base_${Date.now()}.mp3`);

    // 1. Synthesize
    if (voiceConfig && voiceConfig.voiceId) {
      // Custom ElevenLabs Voice
      await aiService.generateElevenLabsSpeech(text, voiceConfig.voiceId, baseAudioPath);
    } else {
      // Standard OpenAI voice
      const requestedVoice = (voiceConfig && voiceConfig.voice) ? voiceConfig.voice : 'nova';
      await aiService.generateSpeech(text, baseAudioPath, requestedVoice);
    }

    // 2. Pitch shifting (Optional, usually not needed for cloned voices but we can keep the logic)
    let finalAudioPath = baseAudioPath;
    let finalFileName = path.basename(baseAudioPath);

    if (voiceConfig && voiceConfig.pitch && voiceConfig.pitch !== 1.0) {
      const pitchedPath = path.join(uploadDir, `tts_pitched_${Date.now()}.mp3`);
      await videoService.pitchAudio(baseAudioPath, pitchedPath, voiceConfig.pitch);
      finalAudioPath = pitchedPath;
      finalFileName = path.basename(pitchedPath);
    }

    res.json({ success: true, audioUrl: `/uploads/${encodeURIComponent(finalFileName)}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clone Voice from Sample
app.post('/api/clone-voice', upload.single('sample'), async (req, res) => {
  const { name } = req.body;
  const sampleFile = req.file;

  if (!name || !sampleFile) {
    return res.status(400).json({ error: 'Name and audio sample are required' });
  }

  try {
    const result = await aiService.cloneElevenLabsVoice(name, sampleFile.path);
    // Cleanup temporary upload
    fs.unlinkSync(sampleFile.path);
    res.json({ success: true, voiceId: result.voice_id });
  } catch (error) {
    console.error("Cloning error details:", error.response ? error.response.data : error.message);
    const errorDetail = error.response && error.response.data && error.response.data.detail
      ? error.response.data.detail.message || JSON.stringify(error.response.data.detail)
      : error.message;
    res.status(500).json({ success: false, error: `Cloning failed: ${errorDetail}` });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
