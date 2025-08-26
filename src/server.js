// Import Fastify
import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { APP_PORT, APP_HOST, PUBLIC_PEM, NODE_ENV  } from './config/env.js';
import healthRoutes from './routes/health.js';
import dictionaryRoutes from './routes/dictionary.js';
import dictionaryContentRoutes from './routes/dictionaryContent.js';
import vnvRoutes from './routes/vnv.js';
import customScriptRoutes from './routes/customScript.js';
import arangoPlugin from './plugins/arangodb.js';
import authPlugin from './plugins/auth.js';

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
}
const fastify = Fastify({
  logger: envToLogger[NODE_ENV] ?? true, // defaults to true if no entry matches in the map
  bodyLimit: 100 * 1024 * 1024 
})
// Register Auth Plugin
fastify.register(authPlugin, { secret: PUBLIC_PEM });
// Register ArangoDB Plugin
fastify.register(arangoPlugin);

// Register Swagger
fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Project Config Service API',
      description: 'API documentation for the Project Config Service',
      version: '0.1.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    servers: [{ url: `http://${APP_HOST}:${APP_PORT}` }],
  }
});

// Register Swagger UI
fastify.register(fastifySwaggerUi, {
  routePrefix: '/api-docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true
  },
  uiHooks: {
    onRequest: function (request, reply, next) { next() },
    preHandler: function (request, reply, next) { next() }
  },
  staticCSP: false,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
  transformSpecificationClone: true
});


// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error, 'An error occurred');

  const statusCode = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
  const response = {
    statusCode: statusCode,
    error: error.validation ? 'Validation Error' : (error.name && statusCode !== 500 ? error.name : 'Internal Server Error'),
    message: error.validation ? error.message : (statusCode === 500 && process.env.NODE_ENV !== 'development' ? 'An unexpected error occurred' : error.message)
  };

  if (error.validation) {
    response.details = error.validation;
  }

  reply.status(statusCode).send(response);
});

// Register health routes
fastify.register(healthRoutes, { prefix: '/api/v4' });
fastify.register(dictionaryRoutes, { prefix: 'api/v4'});
fastify.register(dictionaryContentRoutes, { prefix: 'api/v4'});
fastify.register(vnvRoutes, { prefix: 'api/v4'});
fastify.register(customScriptRoutes, { prefix: 'api/v4'});
export default fastify;
