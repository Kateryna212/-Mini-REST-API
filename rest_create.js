const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2] || 3000;
const DATA_PATH = path.join(process.cwd(), 'data.json');

const server = http.createServer((req, res) => {
  // Перевіряємо метод POST та шлях /items
  if (req.method === 'POST' && req.url === '/items') {
    let body = '';

    // Збираємо дані з потоку запиту
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const newItem = JSON.parse(body);

        // 1. Читаємо поточні дані з файлу
        fs.readFile(DATA_PATH, 'utf8', (err, data) => {
          let items = [];
          if (!err && data) {
            items = JSON.parse(data);
          }

          // 2. Додаємо новий елемент
          items.push(newItem);

          // 3. Записуємо оновлений масив назад у файл
          fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), (writeErr) => {
            if (writeErr) {
              res.writeHead(500);
              return res.end('Error writing data');
            }

            // 4. Повертаємо 201 (Created) та створений об'єкт
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newItem));
          });
        });
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });

  } else {
    // Всі інші маршрути або методи (наприклад, GET /items) повертають не 200
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(port);
