const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Set paths for the binaries
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

async function applyWatermarkToVideo(inputPath, outputPath, options) {
    return new Promise((resolve, reject) => {
        const { text, watermarkImage, opacity, position } = options;
        
        // Ensure input files exist
        if (!fs.existsSync(inputPath)) return reject(new Error("Input file not found"));

        let command = ffmpeg(inputPath);

        // Position logic for ffmpeg
        let overlayFilter = '';
        switch(position) {
            case 'center': overlayFilter = '(W-w)/2:(H-h)/2'; break;
            case 'top-left': overlayFilter = '20:20'; break;
            case 'top-right': overlayFilter = 'W-w-20:20'; break;
            case 'bottom-left': overlayFilter = '20:H-h-20'; break;
            case 'bottom-right': overlayFilter = 'W-w-20:H-h-20'; break;
            default: overlayFilter = 'W-w-20:H-h-20';
        }

        if (watermarkImage && fs.existsSync(watermarkImage)) {
            // Image Watermark
            command
                .input(watermarkImage)
                .complexFilter([
                    `[1:v]format=rgba,colorchannelmixer=aa=${opacity}[logo]`,
                    `[0:v][logo]overlay=${overlayFilter}`
                ])
                .videoCodec('libx264')
                .audioCodec('copy')
                .output(outputPath)
                .on('start', (cmd) => console.log('FFmpeg started:', cmd))
                .on('end', () => resolve(outputPath))
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    reject(err);
                })
                .run();
        } else if (text) {
            // Text Watermark
            // We use a simplified drawtext. If it fails due to font issues, we'll know.
            command
                .videoFilters({
                    filter: 'drawtext',
                    options: {
                        text: text,
                        fontsize: 48,
                        fontcolor: `white@${opacity}`,
                        fontfile: 'C\\:/Windows/Fonts/arial.ttf', // Escape colon for FFmpeg filter
                        x: position.includes('left') ? 40 : (position.includes('right') ? 'w-tw-40' : '(w-tw)/2'),
                        y: position.includes('top') ? 40 : (position.includes('bottom') ? 'h-th-40' : '(h-th)/2'),
                        shadowcolor: 'black',
                        shadowx: 2,
                        shadowy: 2
                    }
                })
                .videoCodec('libx264')
                .audioCodec('copy')
                .output(outputPath)
                .on('start', (cmd) => console.log('FFmpeg started:', cmd))
                .on('end', () => resolve(outputPath))
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    reject(err);
                })
                .run();
        } else {
            reject(new Error("No watermark text or image provided"));
        }
    });
}

async function applyWatermarkToPdf(inputPath, outputPath, options) {
    const { text, opacity, position } = options;
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
        const { width, height } = page.getSize();
        
        let x = 50, y = 50;
        if (position === 'center') { x = width / 2 - 50; y = height / 2; }
        else if (position === 'top-left') { x = 50; y = height - 50; }
        else if (position === 'top-right') { x = width - 150; y = height - 50; }
        else if (position === 'bottom-left') { x = 50; y = 50; }
        else if (position === 'bottom-right') { x = width - 150; y = 50; }

        page.drawText(text || 'Watermark', {
            x: x,
            y: y,
            size: 30,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
            opacity: parseFloat(opacity),
        });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    return outputPath;
}

module.exports = {
    applyWatermarkToVideo,
    applyWatermarkToPdf
};
