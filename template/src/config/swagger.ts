/**
 * @file swagger.ts
 * @description OpenAPI 3.0 documentation setup using swagger-jsdoc.
 *
 * HOW IT WORKS
 * ────────────
 * swagger-jsdoc reads @openapi JSDoc comments from your route and app files
 * and generates an OpenAPI spec object.
 * swagger-ui-express serves that spec as an interactive UI at /api-docs.
 *
 * WHERE TO WRITE DOCS
 * ───────────────────
 * Add @openapi JSDoc comments above your route definitions:
 *   - src/routes/*.ts  → for /api/v1 routes
 *   - src/app.ts       → for top-level routes like /health
 *
 * ACCESS THE DOCS
 * ───────────────
 * Start the server: http://localhost:5000/api-docs
 */

import path from 'path';

import swaggerJsdoc from 'swagger-jsdoc';

import { env } from '@config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node TypeScript API',
      version: '0.1.0',
      description:
        'A production-ready REST API built with Node.js, TypeScript, and Express — layered architecture template.',
      contact: {
        name: 'Kalyan Kashaboina',
        url: 'https://github.com/kalyankashaboina',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Local development server',
      },
    ],
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'integer', example: 200 },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Something went wrong.' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
            name: { type: 'string', example: 'Kalyan Kashaboina' },
            email: { type: 'string', format: 'email', example: 'kalyan@example.com' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUserInput: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', example: 'Kalyan Kashaboina' },
            email: { type: 'string', format: 'email', example: 'kalyan@example.com' },
          },
        },
        UpdateUserInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Kalyan Updated' },
            email: { type: 'string', format: 'email', example: 'updated@example.com' },
          },
        },
      },
    },
  },
  // Scan routes AND app.ts (which has the /health route doc)
  apis: [
    path.join(__dirname, '../app.ts'),
    path.join(__dirname, '../app.js'),
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
