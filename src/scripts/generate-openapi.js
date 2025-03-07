import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API Documentation',
      version: '1.0.0',
      description: 'RESTful API for blog management with Express, PostgreSQL and JWT authentication',
      contact: {
        name: 'API Support',
        email: 'esdrasirion1@gmail.com',
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://blog-nodejs-api-s679.onrender.com/' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js', './src/models/*.js', './src/swagger/*.js']
};

const specs = swaggerJsdoc(options);
const outputPath = path.resolve(__dirname, '../../openapi.json');

fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));
console.log(`OpenAPI specification generated at ${outputPath}`);