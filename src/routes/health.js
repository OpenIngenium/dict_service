import { healthCheckSchema } from '../schemas/healthSchema.js';

export default async function healthRoutes(fastify, options) {
  fastify.get('/health', {
    schema: healthCheckSchema,
    handler: async (request, reply) => {
      return { 
        status: 'OK', 
      };
    }
  });
}
