const fs = require('fs');
const path = require('path');

/**
 * Clears all files in the specified uploads directory.
 * This can be called after a download is finished to ensure the server storage doesn't bloat.
 * 
 * @param {string} directoryPath - The absolute or relative path to the directory to clean. 
 * Defaults to the typical uploads folder in the server root.
 */
const clearUploadFolder = (directoryPath = path.join(__dirname, '../../uploads')) => {
  if (!fs.existsSync(directoryPath)) {
    console.log(`[Cleanup] Directory does not exist: ${directoryPath}`);
    return;
  }

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(`[Cleanup] Error reading directory ${directoryPath}:`, err);
      return;
    }

    if (files.length === 0) {
      console.log(`[Cleanup] Uploads directory is already empty.`);
      return;
    }

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      
      fs.lstat(filePath, (err, stats) => {
        if (err) {
          console.error(`[Cleanup] Error getting stats for file ${filePath}:`, err);
          return;
        }

        // Only remove files (keeps subdirectories or gitkeep if they exist)
        if (stats.isFile()) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`[Cleanup] Failed to delete file ${filePath}:`, err);
            } else {
              console.log(`[Cleanup] Successfully deleted file: ${file}`);
            }
          });
        }
      });
    }
  });
};

module.exports = {
  clearUploadFolder,
};
