// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '敏捷喝水 API 文檔',
    version: '1.0.0',
    description: '使用 Express.js 和 Swagger 生成的 API 文檔',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: '開發環境服務器',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      // 定義模型
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '用戶 ID' },
          username: { type: 'string', description: '用戶名' },
          nickname: { type: 'string', description: '暱稱' },
          avatar: { type: 'string', description: '頭像 URL' },
        },
      },
      WaterDispenser: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '飲水機 ID' },
          name: { type: 'string', description: '飲水機名稱' },
          location: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['Point'], description: 'GeoJSON 類型' },
              coordinates: {
                type: 'array',
                items: { type: 'number' },
                description: '[經度, 緯度]',
              },
            },
          },
          hasHotWater: { type: 'boolean', description: '是否有熱水' },
          hasColdWater: { type: 'boolean', description: '是否有冷水' },
          status: { type: 'string', description: '飲水機狀態' },
          // 其他屬性...
        },
      },
      Feedback: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '反饋 ID' },
          waterDispenserId: { type: 'string', description: '飲水機 ID' },
          feedbackType: { type: 'string', description: '反饋類型' },
          description: { type: 'string', description: '描述' },
          images: {
            type: 'array',
            items: { type: 'string' },
            description: '圖片 URL 列表',
          },
        },
      },
      // 更多模型...
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // 指定路由文件的路徑
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
