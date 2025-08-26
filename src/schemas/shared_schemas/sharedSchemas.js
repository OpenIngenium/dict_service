// src/schemas/sharedSchemas.js

// Helper function to create a standard error schema matching ErrorModel (message only)
const createErrorSchema = (description, exampleMessage) => ({
  description: description,
  type: 'object',
  properties: {
    message: { type: 'string', description: 'A human-readable error message' }
  },
  required: ['message'],
  example: {
    message: exampleMessage
  }
});

export const badRequestErrorSchema = createErrorSchema(
  'Bad Request - The request could not be understood by the server due to malformed syntax.',
  'Invalid input provided.'
);

export const unauthorizedErrorSchema = createErrorSchema(
  'Unauthorized - Authentication is required and has failed or has not yet been provided.',
  'Authentication token is missing or invalid.'
);

export const forbiddenErrorSchema = createErrorSchema(
  'Forbidden - The server understood the request but refuses to authorize it.',
  'You do not have permission to perform this action.'
);

export const notFoundErrorSchema = createErrorSchema(
  'Not Found - The server cannot find the requested resource.',
  'The requested resource was not found.'
);

export const internalServerErrorSchema = createErrorSchema(
  'Internal Server Error - The server encountered an unexpected condition that prevented it from fulfilling the request.',
  'An unexpected error occurred on the server.'
);

export const validationErrorSchema = {
  description: 'Validation Error - The request data failed validation.',
  type: 'object',
  properties: {
    message: {
      type: 'string',
      description: 'A human-readable error message'
    },
    details: {
      type: 'array',
      description: 'Array of validation issues',
      items: {
        type: 'object',
        properties: {
          instancePath: { type: 'string' },
          message: { type: 'string' },
          keyword: { type: 'string' },
          params: { type: 'object' }
        },
        required: ['message']
      }
    }
  },
  required: ['message'],
  example: {
    message: 'Request data validation failed. One or more fields are invalid.',
    details: [
      {
        instancePath: '/email',
        message: 'must be a valid email',
        keyword: 'format',
        params: { format: 'email' }
      }
    ]
  }
};


// A convenient object to spread into route schemas
export const commonErrorResponses = {
  400: validationErrorSchema,
  401: unauthorizedErrorSchema,
  403: forbiddenErrorSchema,
  404: notFoundErrorSchema,
  500: internalServerErrorSchema
};
