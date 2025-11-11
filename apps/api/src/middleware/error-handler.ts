import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export function setGlobalErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    // Log error details for debugging
    app.log.error({
      err: error,
      url: request.url,
      method: request.method,
      body: request.body,
      statusCode: error.statusCode || 500,
    }, 'Request error');

    if (error instanceof ZodError) {
      reply.status(400).send({
        error: 'ValidationError',
        message: 'Invalid request data',
        details: error.errors,
      });
    } else if (error.statusCode) {
      reply.status(error.statusCode).send({
        error: error.name || 'Error',
        message: error.message,
      });
    } else {
      // Log full error details in development, but hide in production
      const isDevelopment = process.env.NODE_ENV !== 'production';
      reply.status(500).send({
        error: 'InternalServerError',
        message: isDevelopment ? error.message : 'Unexpected error',
        ...(isDevelopment && { stack: error.stack }),
      });
    }
  });
}


