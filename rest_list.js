const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // 1. Strict Route and Method Check
  if (req.method === 'GET' && req.url === '/items') {
    const dataPath = path.join(process.cwd(), 'data.json');

    // 2. Read the JSON file
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        // If file is missing or unreadable
        res.writeHead(500);
        return res.end(JSON.stringify({ error: 'Could not read data' }));
      }

      // 3. Send successful response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
    
  } else {
    // 4. Handle 404 for unknown routes or wrong methods (e.g., POST /items)
    res.writeHead(404);
    res.end();
  }
});

const port = process.argv[2] || 3000;
server.listen(port);
