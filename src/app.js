import fastify from './server.js';
import { APP_PORT, APP_HOST, NODE_ENV } from './config/env.js';

const start = async () => {
  try {
    await fastify.listen({ port: APP_PORT, host: APP_HOST });
    fastify.log.info(`Node Environment: ${NODE_ENV}`);
    fastify.log.info(`Swagger UI available at http://${APP_HOST}:${APP_PORT}/api-docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
