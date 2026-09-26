const inputText = document.getElementById("inputText");
const processButton = document.getElementById("processButton");
const downloadLink = document.getElementById("downloadLink");

processButton.addEventListener("click", async () => {
    const text = inputText.value

    if (!text) {
        alert("Please select a file.");
        return;
    }

    // Read the uploaded file

    // Extract/process information
    const title = processText(text);

    // Create a new file
    const outputFile = new Blob(
        [text],
        { type: "text/plain" }
    );

    // Create download URL
    const url = URL.createObjectURL(outputFile);

    downloadLink.href = url;
    downloadLink.download = `${title}.txt`;
    downloadLink.hidden = false;
});

const prefix = "Battle Date";
const pattern = /^Battle Date\s+(.+)$/;

const pad = (num, count) => String(num).padStart(count, '0');

function formatDateTime(date) {

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1, 2); // getMonth() is 0-indexed
    const day = pad(date.getDate(), 2);

    return `${year}_${month}_${day}`
}

function parseCustomDate(str, tz) {
    // 1. Map month abbreviations to their 0-based indices
    const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    // 2. Use regex to split out the components
    // Matches: [1]Month, [2]Day, [3]Year, [4]Hour, [5]Minute
    const match = str.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})\s+(\d{2}):(\d{2})$/);

    if (!match) return null; // Or handle invalid format

    const [_, monthStr, day, year, hour, minute] = match;
    const monthIndex = months[monthStr];

    // 3. Construct and return the Date object
    // Note: This treats the date string as local time. 
    let date = new Date(year, monthIndex, day, hour, minute);
    date.setHours(date.getHours() - tz);
    return formatDateTime(date);
}

function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = (h * 33) ^ str.charCodeAt(i);
    }
    return h >>> 0; // Ensures the result is a positive, unsigned integer
}

function processText(text) {
    // Your processing logic here
    let title = "result";
    const lines = text.split(/\r?\n/);
    let str_hash = "";
    let active = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(prefix)) {
            const match = lines[i].match(pattern);
            if (match) {
                title = parseCustomDate(match[1], 0)
            } else {
                console.log("not matched");
            }
        } else if (lines[i].startsWith("Total Enemies")) {
            active = true;
        } else if (lines[i].startsWith("Coins")) {
            active = false;
        } else if (active) {
            str_hash += lines[i];
        }
    }
    return `${title}_${pad(hash(str_hash), 10)}`;
}