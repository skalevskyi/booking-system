import { FastifyInstance, FastifyError } from 'fastify';
import { ZodError } from 'zod';

export function setGlobalErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    // _request is intentionally unused
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
      reply.status(500).send({
        error: 'InternalServerError',
        message: 'Unexpected error',
      });
    }
  });
}


