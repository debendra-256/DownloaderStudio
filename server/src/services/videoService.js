const ytdlp = require('yt-dlp-exec');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

/**
 * Fetches video metadata and available formats without downloading
 */
exports.getVideoInfo = async (url) => {
  try {
    const isTwitter = url.includes('twitter.com') || url.includes('x.com');
    const referer = isTwitter ? 'https://x.com/' : 'https://www.youtube.com/';
    
    const info = await ytdlp(url, {
      dumpJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      noPlaylist: true,
      addHeader: [
        `referer:${referer}`,
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    // Curate formats: include some with both v+a, or just good ones
    const formats = info.formats
      .filter(f => f.vcodec !== 'none' || f.acodec !== 'none')
      .map(f => ({
        format_id: f.format_id,
        resolution: f.resolution || (f.height ? `${f.height}p` : 'audio'),
        quality: f.format_note || f.resolution || 'Standard',
        ext: f.ext,
        filesize: f.filesize || f.filesize_approx || 0,
        vcodec: f.vcodec,
        acodec: f.acodec
      }))
      .sort((a, b) => (b.filesize || 0) - (a.filesize || 0));

    return {
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      formats: formats.slice(0, 10) // Limit to top 10 relevant formats
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw error;
  }
};

/**
 * Downloads a video using yt-dlp
 */
exports.downloadVideo = async (url, outputDir, formatId = null) => {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(outputDir)){
          fs.mkdirSync(outputDir, { recursive: true });
      }
      const uid = Date.now() + Math.random().toString(36).substring(2, 6);
      // Use YouTube's actual title and extension
      const outputTemplate = path.join(outputDir, `%(title)s_[${uid}].%(ext)s`);
      
      console.log('Starting download for URL:', url, 'Format:', formatId || 'auto');
      
      const isTwitter = url.includes('twitter.com') || url.includes('x.com');
      const referer = isTwitter ? 'https://x.com/' : 'https://www.youtube.com/';

      let resolvedFormat;
      if (!formatId || formatId === 'best' || formatId === 'bestvideo+bestaudio/best') {
        resolvedFormat = 'bestvideo+bestaudio/best';
      } else if (!formatId.includes('+') && !formatId.includes('/')) {
        // Specific format ID requested: merge with bestaudio
        resolvedFormat = `${formatId}+bestaudio/${formatId}`;
      } else {
        resolvedFormat = formatId;
      }

      ytdlp(url, {
        output: outputTemplate,
        format: resolvedFormat,
        ffmpegLocation: ffmpegStatic,
        noCheckCertificates: true,
        noWarnings: true,
        noPlaylist: true,
        addHeader: [
          `referer:${referer}`,
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      }).then(() => {
        // Scan for the file containing the UID indicator
        const actualFilename = (() => {
          const files = fs.readdirSync(outputDir).filter(fn =>
            fn.includes(`[${uid}]`) &&
            !fn.endsWith('.part') &&
            !fn.endsWith('.ytdl') &&
            !fn.endsWith('.tmp')
          );
          return files.length > 0 ? files[0] : null;
        })();

        if (!actualFilename || !fs.existsSync(path.join(outputDir, actualFilename))) {
          return reject(new Error('Downloaded file not found on disk.'));
        }

        console.log('Download completed:', actualFilename);
        resolve({
            message: 'Video downloaded successfully',
            filename: actualFilename,
            requestedUrl: url
        });
      }).catch(err => {
        console.error('yt-dlp error:', err.message || err);
        reject(err);
      });

    } catch (error) {
      console.error('Download setup error:', error);
      reject(error);
    }
  });
};

/**
 * Downloads only the audio track using yt-dlp (bestaudio)
 */
exports.downloadAudioOnly = async (url, outputDir) => {
  return new Promise((resolve, reject) => {
    try {
      const uid = Date.now() + Math.random().toString(36).substring(2, 6);
      const outputTemplate = path.join(outputDir, `%(title)s_[${uid}].%(ext)s`);

      const isTwitter = url.includes('twitter.com') || url.includes('x.com');
      const referer = isTwitter ? 'https://x.com/' : 'https://www.youtube.com/';

      ytdlp(url, {
        output: outputTemplate,
        format: 'bestaudio/best', // fallback to best if no separate audio stream
        extractAudio: true,
        audioFormat: 'mp3',
        ffmpegLocation: ffmpegStatic, // Crucial for conversion to MP3
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: [
          `referer:${referer}`,
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      }).then(() => {
        // Find the actual mp3 file written
        const actualFilename = (() => {
          const files = fs.readdirSync(outputDir).filter(fn =>
            fn.includes(`[${uid}]`) &&
            fn.endsWith('.mp3')
          );
          return files.length > 0 ? files[0] : null;
        })();

        if (!actualFilename || !fs.existsSync(path.join(outputDir, actualFilename))) {
          // If for some reason audioFormat: mp3 didn't output .mp3, return whatever we got
          const fallback = fs.readdirSync(outputDir).find(fn => fn.includes(`[${uid}]`) && !fn.endsWith('.part') && !fn.endsWith('.ytdl'));
          if (fallback) return resolve({ filename: fallback });
          return reject(new Error('Downloaded audio not found on disk.'));
        }

        resolve({ filename: actualFilename });
      }).catch(err => {
        console.error('yt-dlp audio error:', err);
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Extracts audio from a given video file
 */
exports.extractAudio = (videoPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(outputPath)
      .noVideo()
      .format('mp3')
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

/**
 * Trims a video segment
 */
exports.trimVideo = (videoPath, outputPath, startTime, duration) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

/**
 * Extracts frames (thumbnails) from a video
 */
exports.extractFrames = (videoPath, outputDir, filenamePrefix) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)){
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Extract 3 frames at 10%, 50%, and 90% marks
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['10%', '50%', '90%'],
        filename: `${filenamePrefix}-%i.jpg`,
        folder: outputDir,
        size: '640x360'
      })
      .on('end', () => {
         // Return the filenames it generated
         const files = [`${filenamePrefix}-1.jpg`, `${filenamePrefix}-2.jpg`, `${filenamePrefix}-3.jpg`];
         resolve(files);
      })
      .on('error', (err) => reject(err));
  });
};

/**
 * Replaces the original audio track with a synthetic audio file
 */
exports.dubVideo = (originalVideoPath, syntheticAudioPath, outputDubbedPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(originalVideoPath)
      .input(syntheticAudioPath)
      .outputOptions([
        '-c:v copy',
        '-c:a aac',
        '-map 0:v:0',
        '-map 1:a:0',
        '-shortest'
      ])
      .save(outputDubbedPath)
      .on('end', () => resolve(outputDubbedPath))
      .on('error', (err) => {
        console.error('Dubbing error:', err);
        reject(err);
      });
  });
};

/**
 * Modifies the pitch and speed of an audio file to simulate voice variants
 */
exports.pitchAudio = (inputAudioPath, outputAudioPath, pitchMultiplier) => {
  return new Promise((resolve, reject) => {
    // Basic math for compensation: if we increase pitch by 1.15, the duration SHRINKS 
    // and tempo INCREASES. To restore timing we apply atempo = 1 / pitchMultiplier.
    // Example: asetrate=44100*1.15,atempo=1/1.15
    const atempo = (1 / pitchMultiplier).toFixed(2);
    
    ffmpeg(inputAudioPath)
      .audioFilters([
        `asetrate=44100*${pitchMultiplier}`,
        `atempo=${atempo}`
      ])
      .save(outputAudioPath)
      .on('end', () => resolve(outputAudioPath))
      .on('error', (err) => {
         console.error('Pitch error:', err);
         reject(err);
      });
  });
};
