import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { getEnv } from './config/env.js';
import { getJWTConfig } from './lib/jwt.js';
import { authenticate } from './middleware/auth.js';
import { setGlobalErrorHandler } from './middleware/error-handler.js';
import { authRoutes } from './routes/auth.js';
import { bookingsRoutes } from './routes/bookings.js';
import { servicesRoutes } from './routes/services.js';

async function build() {
  const env = getEnv();
  const jwtConfig = getJWTConfig();
  const frontendUrl = process.env.FRONTEND_URL || 'https://skalevskyi.github.io';

  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Plugins
  // CORS налаштування - origin має бути без шляху (тільки протокол + домен)
  const allowedOrigins =
    env.NODE_ENV === 'production'
      ? [
        'https://skalevskyi.github.io', // Основний домен GitHub Pages
        frontendUrl && !frontendUrl.includes('/booking-system')
          ? frontendUrl
          : 'https://skalevskyi.github.io', // Якщо frontendUrl містить шлях, використовуємо базовий домен
      ].filter(Boolean)
      : ['http://localhost:5173'];

  await fastify.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await fastify.register(jwt, {
    secret: jwtConfig.secret,
  });

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Booking System API',
        description: 'API documentation for the Booking System',
        version: '1.0.0',
      },
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'services', description: 'Service management endpoints' },
        { name: 'bookings', description: 'Booking management endpoints' },
        { name: 'health', description: 'Health check endpoints' },
      ],
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // Global error handler
  setGlobalErrorHandler(fastify);

  // Decorate fastify with authenticate
  fastify.decorate('authenticate', async function (request: any, reply: any) {
    await authenticate(request, reply);
  });

  // Health check endpoint для Render (швидкий відгук)
  fastify.get('/health', async (_request, reply) => {
    // Швидкий відгук для health check
    return reply.code(200).send({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(servicesRoutes, { prefix: '/api' });
  await fastify.register(bookingsRoutes, { prefix: '/api' });

  return fastify;
}

async function start() {
  try {
    const fastify = await build();
    const env = getEnv();

    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
