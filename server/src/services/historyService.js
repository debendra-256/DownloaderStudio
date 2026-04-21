const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const historyFile = path.join(__dirname, '../../history.xlsx');

/**
 * Initializes the history excel file if it doesn't exist
 */
const initHistory = () => {
    if (!fs.existsSync(historyFile)) {
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet([]);
        xlsx.utils.book_append_sheet(wb, ws, "History");
        xlsx.writeFile(wb, historyFile);
    }
};

/**
 * Adds an entry to the history file
 */
exports.addHistoryEntry = (entry) => {
    try {
        initHistory();
        const wb = xlsx.readFile(historyFile);
        const ws = wb.Sheets["History"];
        const data = xlsx.utils.sheet_to_json(ws);
        
        data.push({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            ...entry
        });
        
        const newWs = xlsx.utils.json_to_sheet(data);
        wb.Sheets["History"] = newWs;
        xlsx.writeFile(wb, historyFile);
        return true;
    } catch (error) {
        console.error("Error writing to history:", error);
        return false;
    }
};

/**
 * Retrieves all history entries
 */
exports.getHistory = () => {
    try {
        initHistory();
        const wb = xlsx.readFile(historyFile);
        const ws = wb.Sheets["History"];
        return xlsx.utils.sheet_to_json(ws);
    } catch (error) {
        console.error("Error reading history:", error);
        return [];
    }
};
