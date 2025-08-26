import { commonErrorResponses } from './shared_schemas/sharedSchemas.js';

export const healthCheckSchema = {
  description: 'Health check endpoint for the service.',
  tags: ['Health'],
  response: {
    200: {
      description: 'Received service status',
      type: 'object',
      properties: {
        status: { 
          type: 'string',
          description: 'Current status of service',
        }
      },
      required: ['status'] 
    },
    ...commonErrorResponses 
  }
};
