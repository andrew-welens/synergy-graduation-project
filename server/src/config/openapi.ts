export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Разработка многопользовательского веб-приложения API',
    version: '1.0'
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'auth' },
    { name: 'users' },
    { name: 'clients' },
    { name: 'catalog' },
    { name: 'orders' },
    { name: 'interactions' },
    { name: 'audit' },
    { name: 'reports' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' }
        },
        required: ['code', 'message']
      },
      ApiEnvelope: {
        type: 'object',
        properties: {
          data: {}
        },
        required: ['data']
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        },
        required: ['email', 'password']
      },
      LoginResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              permissions: { type: 'array', items: { type: 'string' } }
            },
            required: ['id', 'email', 'role', 'permissions']
          }
        },
        required: ['accessToken', 'refreshToken', 'user']
      },
      RefreshRequest: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' }
        }
      },
      RefreshResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              permissions: { type: 'array', items: { type: 'string' } }
            },
            required: ['id', 'email', 'role', 'permissions']
          }
        },
        required: ['accessToken', 'user']
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string', nullable: true },
          role: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'email', 'role', 'createdAt']
      },
      CreateUserRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string' }
        },
        required: ['email', 'password', 'role']
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string' }
        }
      },
      Client: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          managerId: { type: 'string', nullable: true },
          tags: { type: 'array', items: { type: 'string' } },
          type: { type: 'string' },
          inn: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          ordersCount: { type: 'number', nullable: true },
          interactionsCount: { type: 'number', nullable: true }
        },
        required: ['id', 'name', 'tags', 'type', 'createdAt', 'updatedAt']
      },
      CreateClientRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          city: { type: 'string' },
          address: { type: 'string' },
          managerId: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          type: { type: 'string' },
          inn: { type: 'string' }
        },
        required: ['name', 'type']
      },
      UpdateClientRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          city: { type: 'string' },
          address: { type: 'string' },
          managerId: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          type: { type: 'string' },
          inn: { type: 'string' }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'name', 'createdAt', 'updatedAt']
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          categoryId: { type: 'string' },
          price: { type: 'number' },
          unit: { type: 'string' },
          isAvailable: { type: 'boolean' },
          sku: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'name', 'categoryId', 'price', 'unit', 'isAvailable', 'createdAt', 'updatedAt']
      },
      CreateCategoryRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' }
        },
        required: ['name']
      },
      UpdateCategoryRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' }
        }
      },
      CreateProductRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          categoryId: { type: 'string' },
          price: { type: 'number' },
          unit: { type: 'string' },
          isAvailable: { type: 'boolean' },
          sku: { type: 'string' }
        },
        required: ['name', 'categoryId', 'price', 'unit', 'isAvailable']
      },
      UpdateProductRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          categoryId: { type: 'string' },
          price: { type: 'number' },
          unit: { type: 'string' },
          isAvailable: { type: 'boolean' },
          sku: { type: 'string' }
        }
      },
      OrderItem: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          quantity: { type: 'number' },
          price: { type: 'number' }
        },
        required: ['productId', 'quantity', 'price']
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          clientId: { type: 'string' },
          clientName: { type: 'string', nullable: true },
          status: { type: 'string' },
          total: { type: 'number' },
          totalAmount: { type: 'number', nullable: true },
          comments: { type: 'string', nullable: true },
          managerId: { type: 'string', nullable: true },
          managerName: { type: 'string', nullable: true },
          managerEmail: { type: 'string', nullable: true },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time', nullable: true }
        },
        required: ['id', 'clientId', 'status', 'total', 'items', 'createdAt', 'updatedAt']
      },
      CreateOrderRequest: {
        type: 'object',
        properties: {
          clientId: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          status: { type: 'string' },
          managerId: { type: 'string' },
          comments: { type: 'string' }
        },
        required: ['clientId', 'items']
      },
      UpdateOrderRequest: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          managerId: { type: 'string' },
          comments: { type: 'string' }
        }
      },
      UpdateStatusRequest: {
        type: 'object',
        properties: {
          status: { type: 'string' }
        },
        required: ['status']
      },
      Interaction: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          clientId: { type: 'string' },
          channel: { type: 'string' },
          description: { type: 'string' },
          managerId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'clientId', 'channel', 'description', 'createdAt']
      },
      CreateInteractionRequest: {
        type: 'object',
        properties: {
          channel: { type: 'string' },
          description: { type: 'string' },
          managerId: { type: 'string' }
        },
        required: ['channel', 'description']
      },
      UpdateInteractionRequest: {
        type: 'object',
        properties: {
          channel: { type: 'string' },
          description: { type: 'string' }
        }
      },
      AuditLog: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          action: { type: 'string' },
          entityType: { type: 'string' },
          entityId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          metadata: { type: 'object', nullable: true }
        },
        required: ['id', 'userId', 'action', 'entityType', 'createdAt']
      },
      OrdersReportResponse: {
        type: 'object',
        properties: {
          groupBy: { type: 'string' },
          data: { type: 'array', items: { type: 'object' } }
        },
        required: ['groupBy', 'data']
      },
      OverdueReportResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { type: 'object' } },
          total: { type: 'number' },
          days: { type: 'number' }
        },
        required: ['data', 'total', 'days']
      }
    }
  },
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: {
          201: {
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiEnvelope' }, { properties: { data: { $ref: '#/components/schemas/LoginResponse' } } }] } } }
          },
          400: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          401: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } }
        }
      }
    },
    '/api/auth/refresh': {
      post: {
        tags: ['auth'],
        requestBody: {
          required: false,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } } }
        },
        responses: {
          200: {
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiEnvelope' }, { properties: { data: { $ref: '#/components/schemas/RefreshResponse' } } }] } } }
          },
          401: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['auth'],
        responses: {
          200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } }
        }
      }
    },
    '/api/users': {
      get: {
        tags: ['users'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } }
        }
      },
      post: {
        tags: ['users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } } }
        },
        responses: {
          201: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      },
      put: {
        tags: ['users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } }
        },
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      },
      delete: {
        tags: ['users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/clients': {
      get: {
        tags: ['clients'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      },
      post: {
        tags: ['clients'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateClientRequest' } } }
        },
        responses: { 201: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/clients/{id}': {
      get: {
        tags: ['clients'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      },
      put: {
        tags: ['clients'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateClientRequest' } } }
        },
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      },
      delete: {
        tags: ['clients'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/clients/{clientId}/interactions': {
      get: {
        tags: ['interactions'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'clientId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      },
      post: {
        tags: ['interactions'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'clientId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateInteractionRequest' } } }
        },
        responses: { 201: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/clients/{clientId}/interactions/{id}': {
      put: {
        tags: ['interactions'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateInteractionRequest' } } }
        },
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      },
      delete: {
        tags: ['interactions'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/orders': {
      get: {
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      },
      post: {
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderRequest' } } }
        },
        responses: { 201: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/orders/{id}': {
      get: {
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      },
      put: {
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateOrderRequest' } } }
        },
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/orders/{id}/status': {
      post: {
        tags: ['orders'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateStatusRequest' } } }
        },
        responses: { 201: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/audit': {
      get: {
        tags: ['audit'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/reports/orders': {
      get: {
        tags: ['reports'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiEnvelope' },
                    { properties: { data: { $ref: '#/components/schemas/OrdersReportResponse' } } }
                  ]
                }
              }
            }
          }
        }
      }
    },
    '/api/reports/overdue': {
      get: {
        tags: ['reports'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiEnvelope' },
                    { properties: { data: { $ref: '#/components/schemas/OverdueReportResponse' } } }
                  ]
                }
              }
            }
          }
        }
      }
    },
    '/api/categories': {
      get: {
        tags: ['catalog'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      },
      post: {
        tags: ['catalog'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCategoryRequest' } } }
        },
        responses: { 201: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/categories/{id}': {
      put: {
        tags: ['catalog'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCategoryRequest' } } }
        },
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/products': {
      get: {
        tags: ['catalog'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      },
      post: {
        tags: ['catalog'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductRequest' } } }
        },
        responses: { 201: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    },
    '/api/products/{id}': {
      put: {
        tags: ['catalog'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProductRequest' } } }
        },
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiEnvelope' } } } } }
      }
    }
  }
} as const
