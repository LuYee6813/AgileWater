// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const waterDispenserRoutes = require('./routes/waterDispensers');
const reviewRoutes = require('./routes/reviews');
const feedbackRoutes = require('./routes/feedbacks');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // 提供圖片靜態資源

// Swagger UI 路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API 路由前綴
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waterdispensers', waterDispenserRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/feedbacks', feedbackRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`後端服務運行在 http://localhost:${PORT}`);
  console.log(`API 文檔可在 http://localhost:${PORT}/api-docs 查看`);
});
