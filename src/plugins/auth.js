// auth.js
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';

async function authPlugin(fastify, options) {
  const { secret } = options;

  if (!secret) {
    throw new Error('Secret must be provided for auth plugin');
  }

  // Add an authentication decorator
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
        return reply.code(401).send({ message: 'Missing or invalid Authorization header' });
      }

      const token = authHeader.slice(7); // remove "Bearer "

      // Verify the token (you can replace this logic with your own)
      const decoded = jwt.verify(token, secret);

      // Attach user info to request
      request.user = decoded;
    } catch (err) {
      return reply.code(401).send({ message: 'Invalid or expired token' });
    }
  });
}

export default fp(authPlugin);
