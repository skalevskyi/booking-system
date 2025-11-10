import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';
import { UserRole } from '@prisma/client';

const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  durationMin: z.number().int().positive('Duration must be positive'),
  priceCents: z.number().int().nonnegative('Price must be non-negative'),
  active: z.boolean().optional().default(true),
});

const updateServiceSchema = createServiceSchema.partial();

export async function servicesRoutes(fastify: FastifyInstance) {
  // GET /api/services
  fastify.get('/services', async (_request: FastifyRequest, reply: FastifyReply) => {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        durationMin: true,
        priceCents: true,
        active: true,
        createdAt: true,
      },
    });

    return reply.send(services);
  });

  // GET /api/services/:id
  fastify.get('/services/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const params = z.object({ id: z.string() }).parse(request.params);

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        durationMin: true,
        priceCents: true,
        active: true,
        createdAt: true,
      },
    });

    if (!service) {
      return reply.code(404).send({ error: 'Service not found' });
    }

    return reply.send(service);
  });

  // POST /api/services (ADMIN only)
  fastify.post(
    '/services',
    {
      preHandler: [fastify.authenticate, requireRole([UserRole.ADMIN])],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = createServiceSchema.parse(request.body);

      const service = await prisma.service.create({
        data: {
          name: body.name,
          description: body.description,
          durationMin: body.durationMin,
          priceCents: body.priceCents,
          active: body.active ?? true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          durationMin: true,
          priceCents: true,
          active: true,
          createdAt: true,
        },
      });

      return reply.code(201).send(service);
    },
  );

  // PUT /api/services/:id (ADMIN only)
  fastify.put(
    '/services/:id',
    {
      preHandler: [fastify.authenticate, requireRole([UserRole.ADMIN])],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const body = updateServiceSchema.parse(request.body);

      const existingService = await prisma.service.findUnique({
        where: { id: params.id },
      });

      if (!existingService) {
        return reply.code(404).send({ error: 'Service not found' });
      }

      const service = await prisma.service.update({
        where: { id: params.id },
        data: body,
        select: {
          id: true,
          name: true,
          description: true,
          durationMin: true,
          priceCents: true,
          active: true,
          createdAt: true,
        },
      });

      return reply.send(service);
    },
  );

  // DELETE /api/services/:id (ADMIN only)
  fastify.delete(
    '/services/:id',
    {
      preHandler: [fastify.authenticate, requireRole([UserRole.ADMIN])],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const params = z.object({ id: z.string() }).parse(request.params);

      const existingService = await prisma.service.findUnique({
        where: { id: params.id },
      });

      if (!existingService) {
        return reply.code(404).send({ error: 'Service not found' });
      }

      await prisma.service.delete({
        where: { id: params.id },
      });

      return reply.code(204).send();
    },
  );
}
