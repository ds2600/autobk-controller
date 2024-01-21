const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const app = express();
const port = 5050;
const sequelize = require('./sequelize');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AutoBkGUI API',
            version: '1.0.0',
            description: 'AutoBkGUI API'
        },
        servers: [
            {
                url: 'http://localhost:5050/api'
            }
        ],
        components: {
            securitySchemes: {
                basicAuth: {
                    type: 'http',
                    scheme: 'basic'
                }
            }
        },
        security: [
            {
                basicAuth: []
            }
        ],
        tags: [
            {
                name: 'devices',
                description: 'Device management'
            },
            {
                name: 'schedules',
                description: 'Schedule management'
            },
            {
                name: 'backups',
                description: 'Backup management'
            }
        ],
    },
    apis: ['./api/v1/swagger.yml'] 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

sequelize.sync().then(() => {
    console.log('Database synchronized');
});

app.use(express.json());

const deviceRoutes = require('./v1/routes/deviceRoutes');

app.use('/api', deviceRoutes);

app.listen(port, () => {
    console.log(`AutoBkGUI backend listening at http://localhost:${port}`);
});