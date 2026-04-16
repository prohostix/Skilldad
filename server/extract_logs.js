const fs = require('fs');
const lines = fs.readFileSync('backend.log', 'utf8').split('\n');
fs.writeFileSync('last_logs.txt', lines.slice(-50).join('\n'));
