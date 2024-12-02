const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const apiRoutes = require('./routes/api');

const swaggerDocument = yaml.load('./swagger.yaml');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// API 路由
app.use('/api', apiRoutes);

// Swagger 文檔
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
