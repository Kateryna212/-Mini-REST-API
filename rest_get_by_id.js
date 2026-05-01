const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2] || 3000;
const DATA_PATH = path.join(process.cwd(), 'data.json');

const server = http.createServer((req, res) => {
  // Розбиваємо шлях на частини, щоб отримати ID
  // Наприклад: "/items/1" -> ["", "items", "1"]
  const urlParts = req.url.split('/');
  const isItemsRoute = urlParts[1] === 'items';
  const id = urlParts[2];

  if (req.method === 'GET' && isItemsRoute && id) {
    // 1. Читаємо файл з даними
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error reading data');
      }

      try {
        const items = JSON.parse(data);
        // 2. Шукаємо елемент за ID (враховуйте, що ID в JSON може бути числом або рядком)
        const item = items.find(i => String(i.id) === String(id));

        if (item) {
          // 3. Якщо знайдено — повертаємо 200 та об'єкт
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(item));
        } else {
          // 4. Якщо не знайдено — повертаємо 404
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Item not found' }));
        }
      } catch (parseErr) {
        res.writeHead(500);
        res.end('JSON parse error');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Route not found');
  }
});

server.listen(port);
