require('dotenv').config();

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const cors = require('cors');
const app = express();
const sequelize = require('./sequelize');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        servers: [
            {
                url: process.env.REACT_APP_API_URL + ":" + process.env.REACT_APP_API_PORT + '/api/'
            }
        ]
    },
    apis: ['./api/v1/swagger.yml'] 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

sequelize.sync().then(() => {
    console.log('Database synchronized');
});

app.use(express.json());

app.use(cors());

const deviceRoutes = require('./v1/routes/deviceRoutes');
const scheduleRoutes = require('./v1/routes/scheduleRoutes');
const userRoutes = require('./v1/routes/userRoutes');

app.use('/api', deviceRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', userRoutes);

module.exports = app;