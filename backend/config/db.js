// config/db.js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, '連接數據庫失敗：'));
db.once('open', () => {
  console.log('成功連接到數據庫');
});

module.exports = db;
