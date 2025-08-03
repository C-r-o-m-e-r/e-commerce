// backend/src/index.js (Виправлена версія)

const app = require('./app'); // 1. Імпортуємо наш налаштований додаток з app.js
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});