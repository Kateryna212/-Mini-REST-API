const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2] || 3000;
const DATA_PATH = path.join(process.cwd(), 'data.json');

const server = http.createServer((req, res) => {
  const urlParts = req.url.split('/');
  const isItemsRoute = urlParts[1] === 'items';
  const id = urlParts[2];

  if (req.method === 'PUT' && isItemsRoute && id) {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const updates = JSON.parse(body);

        fs.readFile(DATA_PATH, 'utf8', (err, data) => {
          if (err) {
            res.writeHead(500);
            return res.end('Error reading data');
          }

          let items = JSON.parse(data);
          const itemIndex = items.findIndex(i => String(i.id) === String(id));

          if (itemIndex !== -1) {
            // Оновлюємо існуючий об'єкт, зберігаючи його оригінальний ID
            // Використовуємо Object.assign для злиття властивостей
            items[itemIndex] = { ...items[itemIndex], ...updates, id: items[itemIndex].id };

            fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), (writeErr) => {
              if (writeErr) {
                res.writeHead(500);
                return res.end('Error saving data');
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(items[itemIndex]));
            });
          } else {
            // Якщо ID не знайдено в базі
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Item not found' }));
          }
        });
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON body');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(port);
