export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PayRescue NG API',
    version: '1.0.0',
    description:
      "Nigeria's Transaction Recovery & Payment Reconciliation Infrastructure. Core Promise: **One transaction → one rescue case.**",
    contact: {
      name: 'PayRescue Engineering Team',
      email: 'dev@payrescue.ng',
      url: 'https://payrescue.ng',
    },
    license: {
      name: 'Proprietary',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
    {
      url: 'https://api.payrescue.ng',
      description: 'Production API Gateway',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer Access Token in Authorization header',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'Secure HTTP-Only session cookie',
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Api-Key',
        description: 'TrustPay Developer Secret Key (e.g. pr_live_... or pr_test_...)',
      },
    },
    schemas: {
      ApiResponseEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string', example: 'Operation successful' },
          requestId: { type: 'string', example: 'req_b34ef982-1234-4567' },
        },
      },
      ApiErrorEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Request validation failed' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
          requestId: { type: 'string', example: 'req_b34ef982-1234-4567' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Liveness Probe',
        description: 'Returns operational status and basic process metrics.',
        responses: {
          '200': { description: 'Service is alive' },
        },
      },
    },
    '/ready': {
      get: {
        summary: 'Readiness Probe',
        description: 'Validates database and external connectivity.',
        responses: {
          '200': { description: 'Service is ready to handle traffic' },
          '503': { description: 'Database or dependencies unavailable' },
        },
      },
    },
    '/api/v1/public/platform': {
      get: {
        summary: 'Platform Information',
        description: 'Returns platform mission, legal disclaimers, and supported regional currencies.',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/public/features': {
      get: {
        summary: 'Platform Features',
        description: 'Returns consumer and merchant feature breakdown.',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/public/pricing': {
      get: {
        summary: 'Pricing Tiers',
        description: 'Returns consumer and enterprise pricing packages in NGN.',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/public/faq': {
      get: {
        summary: 'Frequently Asked Questions',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/public/providers': {
      get: {
        summary: 'Supported Providers Directory',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/auth/register': {
      post: {
        summary: 'Register Consumer or Business Account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', example: 'chidi.okafor@example.ng' },
                  password: { type: 'string', example: 'StrongP@ss2026' },
                  firstName: { type: 'string', example: 'Chidi' },
                  lastName: { type: 'string', example: 'Okafor' },
                  phone: { type: 'string', example: '08031234567' },
                  businessName: { type: 'string', example: 'Okafor Logistics Ltd' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Authenticate User and Set HTTP-Only Session Cookies',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'chidi.okafor@example.ng' },
                  password: { type: 'string', example: 'StrongP@ss2026' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Authenticated' } },
      },
    },
    '/api/v1/cases': {
      post: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: 'Create Transaction Rescue Case ("One Transaction -> One Rescue Case")',
        responses: { '201': { description: 'Rescue Case Created' } },
      },
      get: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: 'List User or Business Rescue Cases',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/reconciliation/{businessId}/csv': {
      post: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: 'Upload and Reconcile Bank Settlement CSV',
        responses: { '200': { description: 'Reconciliation Completed' } },
      },
    },
    '/api/v1/verification/{businessId}/verify': {
      post: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: 'Verify Customer Payment Claim Against Ledger',
        responses: { '200': { description: 'Claim Verified' } },
      },
    },
  },
};
