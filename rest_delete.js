const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2] || 3000;
const DATA_PATH = path.join(process.cwd(), 'data.json');

const server = http.createServer((req, res) => {
  const urlParts = req.url.split('/');
  const isItemsRoute = urlParts[1] === 'items';
  const id = urlParts[2];

  if (req.method === 'DELETE' && isItemsRoute && id) {
    // 1. Читаємо файл
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error reading data');
      }

      let items = JSON.parse(data);
      // Перевіряємо, чи існує елемент перед видаленням
      const itemExists = items.some(i => String(i.id) === String(id));

      if (itemExists) {
        // 2. Фільтруємо масив, залишаючи всі елементи, крім обраного
        const updatedItems = items.filter(i => String(i.id) !== String(id));

        // 3. Записуємо оновлений список у файл
        fs.writeFile(DATA_PATH, JSON.stringify(updatedItems, null, 2), (writeErr) => {
          if (writeErr) {
            res.writeHead(500);
            return res.end('Error saving data');
          }

          // 4. Успіх — повертаємо 200
          res.writeHead(200);
          res.end('Deleted successfully');
        });
      } else {
        // Якщо ID не знайдено — 404
        res.writeHead(404);
        res.end('Item not found');
      }
    });
  } else {
    // Неправильний метод або шлях
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(port);
