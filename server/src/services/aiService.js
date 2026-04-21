// AI Service initialized with dotenv config
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Placeholder for OpenAI SDK usage
let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Transcribes audio using OpenAI Whisper
 */
exports.transcribeAudio = async (audioPath) => {
  if (!openai) {
      console.log('OpenAI API key missing. Returning mocked transcription.');
      return "This is a mock transcription of the audio.";
  }
  
  try {
      const fs = require('fs');
      const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(audioPath),
          model: "whisper-1",
      });
      return transcription.text;
  } catch (error) {
      console.error('Transcription error:', error);
      throw error;
  }
};

/**
 * Translates text
 */
exports.translateText = async (text, targetLanguage) => {
    if (!openai) {
        return `Translated [${targetLanguage}]: ${text}`;
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: `You are a translator. Translate the following text to ${targetLanguage}.` },
                { role: "user", content: text }
            ]
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
};

/**
 * Analyzes transcription text and creates a structured note
 */
exports.generateSummary = async (text) => {
    if (!openai) {
        // Mock if no key
        return "🔥 Key Takeaways:\n- Always configure API keys.\n- Transcriptions generate intelligence.\n\n💡 Summary:\nThis is a mocked auto-generated note summarizing the video content for quick consumption.";
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4", // or gpt-3.5-turbo depending on config
            messages: [
                { role: "system", content: `You are a video analysis assistant. Read the provided video transcription and create a clean, well-formatted structured note. Include a brief 'Summary' and a few 'Key Takeaways' in bullet points.` },
                { role: "user", content: text }
            ]
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Summary error:', error);
        throw error;
    }
};

/**
 * Analyzes transcription to create an exhaustive academic Study Note
 */
exports.generateStudyNote = async (text) => {
    if (!openai) {
        return "Study Note Mock\n\nGap filled info goes here.";
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an expert professor. Read the transcription given below. Infer the missing context, fill the logic gaps, and write a highly readable, comprehensive overarching academic Study Note. Use headings, bullet points, and numbered lists." },
                { role: "user", content: text }
            ]
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Study Note error:', error);
        throw error;
    }
};

/**
 * Synthesizes voice audio from text
 */
exports.generateSpeech = async (text, outputPath, selectedVoice = 'nova') => {
    if (!openai) {
        fs.writeFileSync(outputPath, "mock audio");
        return outputPath;
    }
    
    try {
        const response = await openai.audio.speech.create({
            model: "tts-1",
            voice: selectedVoice,
            input: text.substring(0, 4000), // constrain API input to prevent overflow
        });
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.promises.writeFile(outputPath, buffer);
        return outputPath;
    } catch (error) {
        console.error('Speech synthesis error:', error);
        throw error;
    }
};

/**
 * Uploads a voice sample to ElevenLabs to clone the resonance
 */
exports.cloneElevenLabsVoice = async (name, sampleFilePath) => {
    if (!ELEVENLABS_API_KEY) throw new Error("ElevenLabs API Key not configured");
    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('files', fs.createReadStream(sampleFilePath));
        
        const response = await axios.post('https://api.elevenlabs.io/v1/voices/add', formData, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                ...formData.getHeaders()
            }
        });
        return response.data; // { voice_id: 'xyz' }
    } catch (error) {
        console.error('ElevenLabs Clone Error:', error.response ? error.response.data : error);
        throw error;
    }
};

/**
 * Generates Speech using a custom ElevenLabs Voice
 */
exports.generateElevenLabsSpeech = async (text, voiceId, outputPath) => {
    if (!ELEVENLABS_API_KEY) throw new Error("ElevenLabs API Key not configured");
    try {
        const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            text: text,
            model_id: "eleven_multilingual_v2", // V2 handles Hindi beautifully
        }, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        });
        
        await fs.promises.writeFile(outputPath, response.data);
        return outputPath;
    } catch (error) {
        console.error('ElevenLabs Synth Error:', error.response ? error.response.data : error);
        throw error;
    }
};
