import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Simple Product Search API',
      version: '1.0.0',
      description:
        'A comprehensive API for product search with authentication, categories, and product management',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User unique identifier',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              nullable: true,
              description: 'User full name',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'password123',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'number',
              example: 200,
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'JWT access token',
            },
            refreshToken: {
              type: 'string',
              description: 'Refresh token for getting new access tokens',
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Electronics',
            },
          },
        },
        ProductImage: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            url: {
              type: 'string',
              format: 'uri',
              example: 'https://picsum.photos/800/600',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Premium Laptop',
            },
            description: {
              type: 'string',
              example: 'High-performance laptop with latest specifications',
            },
            price: {
              type: 'number',
              format: 'decimal',
              example: 999.99,
            },
            rating: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              maximum: 5,
              example: 4.5,
            },
            inStock: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            images: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ProductImage',
              },
            },
            categories: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Category',
              },
            },
          },
        },
        PaginatedProducts: {
          type: 'object',
          properties: {
            code: {
              type: 'number',
              example: 200,
            },
            message: {
              type: 'string',
              example: 'Products retrieved successfully',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  example: 1,
                },
                pageSize: {
                  type: 'number',
                  example: 10,
                },
                total: {
                  type: 'number',
                  example: 1000,
                },
                totalPages: {
                  type: 'number',
                  example: 100,
                },
              },
            },
          },
        },
        CategoriesResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'number',
              example: 200,
            },
            message: {
              type: 'string',
              example: 'Categories retrieved successfully',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Category',
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'number',
              example: 400,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Categories',
        description: 'Product category management',
      },
      {
        name: 'Products',
        description: 'Product search and retrieval',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
